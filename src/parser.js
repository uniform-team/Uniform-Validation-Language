var lexer = require("./lexer.js");
var scope = require("./scope.js");

var currentToken;


//Helper functions
function isState(token) {
    return token.value === lexer.TOKEN.STATE.VALID ||
        token.value === lexer.TOKEN.STATE.ENABLED ||
        token.value === lexer.TOKEN.STATE.VISIBLE ||
        token.value === lexer.TOKEN.STATE.OPTIONAL ||
        token.value === lexer.TOKEN.STATE.STRING ||
        token.value === lexer.TOKEN.STATE.NUMBER;
}

function isTag(token) {
    return (token.value === lexer.TOKEN.TAG.VALID ||
    token.value === lexer.TOKEN.TAG.OPTIONAL ||
    token.value === lexer.TOKEN.TAG.ENABLED ||
    token.value === lexer.TOKEN.TAG.VISIBLE);
}

function isExpressionOp(token) {
    return (token.value === lexer.TOKEN.OPERATOR.EQUALS ||
    token.value === lexer.TOKEN.OPERATOR.MATCHES ||
    token.value === lexer.TOKEN.OPERATOR.IS ||
    token.value === lexer.TOKEN.OPERATOR.LT ||
    token.value === lexer.TOKEN.OPERATOR.GT ||
    token.value === lexer.TOKEN.OPERATOR.LTE ||
    token.value === lexer.TOKEN.OPERATOR.GTE);
}

function isValidStatement() {
    return (isTag(currentToken) ||
    currentToken.type === lexer.TOKEN.TYPE.SELECTOR ||
    currentToken.type === lexer.TOKEN.TYPE.VARIABLE);
}

//helper function for coerce
function derefUfm(token) {
    if (token.type === lexer.TOKEN.TYPE.UFM) {
        return new lexer.Token(token.value.val(), token.value.type(), token.line, token.col);
    }
    else return token;
}


//coerce functions will convert the ufm object to the appropriate type and throw an error otherwise
function coerceToNumber(token) {
    token = derefUfm(token);
    if (token.type === lexer.TOKEN.TYPE.NUMBER)
        return token;
    if (token.type === lexer.TOKEN.TYPE.STRING) {
        return new lexer.Token(parseInt(token.value), lexer.TOKEN.TYPE.NUMBER, token.line, token.col);
    }
    throw new Error("Line " + token.line + ": cannot coerce " + token.type + " to number");
}

function coerceToString(token) {
    token = derefUfm(token);
    if (token.type === lexer.TOKEN.TYPE.STRING)
        return token;
    if (token.type === lexer.TOKEN.TYPE.NUMBER) {
        return new lexer.Token(token.value + "", lexer.TOKEN.TYPE.STRING, token.line, token.col);
    }
    throw new Error("Line " + token.line + ": cannot coerce " + token.type + " to string");
}

function coerceToBool(token) {
    token = derefUfm(token);
    if (token.type === lexer.TOKEN.TYPE.BOOL)
        return token;
    else
        throw new Error("Line " + token.line + ": cannot coerce " + token.type + " to bool");
}



//<blocks> -> <block> <blocks> | ø
function blocks() {
    while (currentToken.type === lexer.TOKEN.TYPE.SELECTOR || currentToken.type === lexer.TOKEN.TYPE.VARIABLE) {
        if (currentToken.type === lexer.TOKEN.TYPE.SELECTOR)
            block();
        else if (currentToken.type === lexer.TOKEN.TYPE.VARIABLE)
            variableDeclaration();
    }
    if (currentToken.value === lexer.TOKEN.ENDOFFILE)
        return;
    else throw new Error("Line " + currentToken.line + ": Invalid block");
}

//<block> -> <selector> { <statements> } | <variabeDeclaration>
function block() {
    var selector = matchType(lexer.TOKEN.TYPE.SELECTOR);

    if (scope.thisScope().find(selector) !== null)
        console.warn("Line " + currentToken.line + ": Redeclared selector in same scope " + selector + ", previous definitions ignored");

    var symbol = new scope.Symbol(selector.value, null, scope.KIND.SELECTOR);
    scope.insert(symbol);
    matchValue(lexer.TOKEN.OPERATOR.LBRACE);
    var tempScope = scope.thisScope();

    //attach event listener to change all dependencies
    $(selector.value).on("change", function(evt) {
        var $selector = $(selector.value).ufm();
        $selector.valid(tempScope.find(selector.value).expression().value);
        $selector.enabled(tempScope.find(selector.value).expression().value);
        $selector.visible(tempScope.find(selector.value).expression().value);
        $selector.optional(tempScope.find(selector.value).expression().value);
        evt.stopPropagation();
        $selector.trigger("ufm:validate");
    });

    //Open the scope and parse the statements
    scope.createScope(selector, function() {
        statements(symbol);
        matchValue(lexer.TOKEN.OPERATOR.RBRACE);
    });
}


//<variableDeclaration> -> <variable> : <expression> ;
function variableDeclaration() {
    var variable = matchType(lexer.TOKEN.TYPE.VARIABLE);
    matchValue(lexer.TOKEN.OPERATOR.COLON);
    var exprValue = expressionAndOr();

    if (scope.thisScope().find(variable) !== null)
        console.warn("Line " + currentToken.line + ": Redeclared variable in same scope " + variable);

    //insert variable into current scope
    scope.insert(new scope.Symbol(variable.value, exprValue, scope.KIND.VARIABLE));
    matchValue(lexer.TOKEN.OPERATOR.SEMICOLON);
}

//<statements> -> <statement> <statements> | ø
function statements(symbol) {
    if (isValidStatement())
        while (isValidStatement())
            statement(symbol);
    else throw new Error("Line " + currentToken.line + ": Invalid statement");
}

//<statement> -> <block> | <variableDeclaration> | <tag> : <expression> ;
function statement(symbol) {
    if (currentToken.type === lexer.TOKEN.TYPE.SELECTOR)
        block();
    else if (currentToken.type === lexer.TOKEN.TYPE.VARIABLE)
        variableDeclaration();
    else {
        var tagName = tag();
        matchValue(lexer.TOKEN.OPERATOR.COLON);
        var exprFunc = expressionAndOr();

        //checks to make sure that the expression evaluates to a boolean
        var checkedExprValue = function () {
            var exprValue = exprFunc();
            if (exprValue.type === lexer.TOKEN.TYPE.BOOL)
                return exprValue;
            else throw new Error("Line " + currentToken.line + ": expected boolean result, received result of type " + exprValue.type);
        };

        if (scope.thisScope().find(tagName) !== null)
            console.warn("Line " + currentToken.line + ": Redeclared tag in same scope " + tagName);
        if (tagName.value === lexer.TOKEN.TAG.VALID) {
            scope.insert(new scope.Symbol("valid", checkedExprValue, scope.KIND.TAG));
        }
        else if (tagName.value === lexer.TOKEN.TAG.ENABLED) {
            scope.insert(new scope.Symbol("enabled", checkedExprValue, scope.KIND.TAG));
        }
        else if (tagName.value === lexer.TOKEN.TAG.VISIBLE) {
            scope.insert(new scope.Symbol("visible", checkedExprValue, scope.KIND.TAG));
        }
        else if (tagName.value === lexer.TOKEN.TAG.OPTIONAL) {
            scope.insert(new scope.Symbol("optional", checkedExprValue, scope.KIND.TAG));
        }
        symbol.expression = checkedExprValue;
        matchValue(lexer.TOKEN.OPERATOR.SEMICOLON);
    }
}

//<tag> -> valid | optional | visible | enabled
function tag() {
    if (isTag(currentToken)) {
        return matchType(lexer.TOKEN.TYPE.KEYWORD);
    }
    else {
        throw new Error("Line " + currentToken.line + ": Invalid statement, expected tag recieved " + currentToken.value);
    }
}

//<andOr> -> <not> <andOr_>
//<andOr_> -> and <not>> <andOr_> | or <not> <andOr_> | ø
function expressionAndOr() {
    var LReturn = expressionNot();
    while (currentToken.value === lexer.TOKEN.OPERATOR.AND ||
    currentToken.value === lexer.TOKEN.OPERATOR.OR) {
        //while loop breaks closure so a function is needed to create a new one for each LReturn
        (function() {
            var op = matchType(lexer.TOKEN.TYPE.KEYWORD);
            var RReturn = expressionNot();
            var tempLReturn = LReturn;
            LReturn = function () {
                var LToken = coerceToBool(tempLReturn());
                var RToken = coerceToBool(RReturn());
                if (op.value === lexer.TOKEN.OPERATOR.OR)
                    return new lexer.Token(LToken.value || RToken.value, lexer.TOKEN.TYPE.BOOL, RToken.line, RToken.col);
                else if (op.value === lexer.TOKEN.OPERATOR.AND)
                    return new lexer.Token(LToken.value && RToken.value, lexer.TOKEN.TYPE.BOOL, RToken.line, RToken.col);
            };
        })();
    }
    return LReturn;
}

//<not> -> not <not> | <op>
function expressionNot() {
    if (currentToken.value === lexer.TOKEN.OPERATOR.NOT) {
        matchValue(lexer.TOKEN.OPERATOR.NOT);
        var RReturn = expressionNot();
        return function () {
            var RToken = coerceToBool(RReturn());
            return new lexer.Token(!RToken.value, lexer.TOKEN.TYPE.BOOL, RToken.line, RToken.col);
        };
    }
    else
        return expressionOp();
}

//<op> -> <addSub> <op_>
//<op_> -> equals <addSub> <op_> | is... | <.... | >... | <=... | >=... | ø
function expressionOp() {
    var LReturn = expressionAddSub();
    while (isExpressionOp(currentToken)) {
        var op = matchType(lexer.TOKEN.TYPE.KEYWORD);
        var RReturn = expressionAddSub();
        var tempLReturn = LReturn;
        LReturn = function () {
            var LToken = tempLReturn();
            var RToken = RReturn();
            if (op.value === lexer.TOKEN.OPERATOR.LT) {
                LToken = coerceToNumber(LToken);
                RToken = coerceToNumber(RToken);
                return new lexer.Token(LToken.value < RToken.value, lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
            }
            else if (op.value === lexer.TOKEN.OPERATOR.GT) {
                LToken = coerceToNumber(LToken);
                RToken = coerceToNumber(RToken);
                return new lexer.Token(LToken.value > RToken.value, lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
            }
            else if (op.value === lexer.TOKEN.OPERATOR.GTE) {
                LToken = coerceToNumber(LToken);
                RToken = coerceToNumber(RToken);
                return new lexer.Token(LToken.value >= RToken.value, lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
            }
            else if (op.value === lexer.TOKEN.OPERATOR.LTE) {
                LToken = coerceToNumber(LToken);
                RToken = coerceToNumber(RToken);
                return new lexer.Token(LToken.value <= RToken.value, lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
            }
            else if (op.value === lexer.TOKEN.OPERATOR.EQUALS) {
                if (LToken.type === RToken.type)
                    return new lexer.Token(LToken.value === RToken.value, lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
                else throw new Error("Line " + LToken.line + ": cannot equals, types of operands do not match");
            }
            else if (op.value === lexer.TOKEN.OPERATOR.MATCHES && RToken.type === lexer.TOKEN.TYPE.REGEX) {
                LToken = coerceToString(LToken);
                var tempRegex = new RegExp(RToken.value);
                return new lexer.Token(tempRegex.test(LToken.value), lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
            }
            else if (isState(RToken) && op.value === lexer.TOKEN.OPERATOR.IS && LToken.type === lexer.TOKEN.TYPE.UFM) {

                if (RToken.value === lexer.TOKEN.STATE.VALID)
                    return new lexer.Token($(LToken.value).ufm().valid(), lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
                else if (RToken.value === lexer.TOKEN.STATE.ENABLED)
                    return new lexer.Token($(LToken.value).ufm().enabled(), lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
                else if (RToken.value === lexer.TOKEN.STATE.VISIBLE)
                    return new lexer.Token($(LToken.value).ufm().visible(), lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
                else if (RToken.value === lexer.TOKEN.STATE.OPTIONAL)
                    return new lexer.Token($(LToken.value).ufm().optional(), lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col)

                else if (RToken.value === lexer.TOKEN.STATE.STRING) {
                    try {
                        coerceToString(LToken);
                    }
                    catch (ex) {
                        return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
                    }
                    return new lexer.Token(true, lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
                }
                else if (RToken.value === lexer.TOKEN.STATE.NUMBER) {
                    try {
                        coerceToNumber(LToken);
                    }
                    catch (ex) {
                        return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
                    }
                    return new lexer.Token(true, lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
                }
            }
            else throw new Error("Line " + LToken.line + ": Invalid expression, cannot " + LToken.type + " " + op.value + " " + RToken.type);
        };
    }
    return LReturn;
}


//<addSub> -> <mulDivMod> <addSub_>
//<addSub_> -> + <mulDivMod> <addSub_> | -... | ø
function expressionAddSub() {
    var LReturn = expressionMulDivMod();
    while (currentToken.value === lexer.TOKEN.OPERATOR.ADD ||
    currentToken.value === lexer.TOKEN.OPERATOR.SUB) {
        //while loop breaks closure so a function is needed to create a new one for each LReturn
        (function(){
            var op = matchType(lexer.TOKEN.TYPE.KEYWORD);
            var RReturn = expressionMulDivMod();
            var tempLReturn = LReturn;
            LReturn = function () {
                var LToken = coerceToNumber(tempLReturn());
                var RToken = coerceToNumber(RReturn());
                if (LToken.type === lexer.TOKEN.TYPE.NUMBER && RToken.type === lexer.TOKEN.TYPE.NUMBER) {
                    if (op.value === lexer.TOKEN.OPERATOR.ADD)
                        return new lexer.Token(LToken.value + RToken.value, lexer.TOKEN.TYPE.NUMBER, LToken.line, LToken.col);
                    else if (op.value === lexer.TOKEN.OPERATOR.SUB)
                        return new lexer.Token(LToken.value - RToken.value, lexer.TOKEN.TYPE.NUMBER, LToken.line, LToken.col);
                }
                else throw new Error("Line " + LToken.line + ": Invalid expression, cannot " + LToken.type + " " + op.value + " " + RToken.type);
            }
        }());
    }
    return LReturn;
}

//<mulDivMod> -> <neg> <mulDivMod_>
//<mulDivMod_> -> * <neg> <mulDivMod_> | /... | %... | ø
function expressionMulDivMod() {
    var LReturn = expressionNeg();
    while (currentToken.value === lexer.TOKEN.OPERATOR.MUL ||
    currentToken.value === lexer.TOKEN.OPERATOR.DIV ||
    currentToken.value === lexer.TOKEN.OPERATOR.MOD)
    {
        //while loop breaks closure so a function is needed to create a new one for each LReturn
        (function(){
            var op = matchType(lexer.TOKEN.TYPE.KEYWORD);
            var RReturn = expressionNeg();
            var tempLReturn = LReturn;
            LReturn = function () {
                var LToken = coerceToNumber(tempLReturn());
                var RToken = coerceToNumber(RReturn());

                if (LToken.type === lexer.TOKEN.TYPE.NUMBER && RToken.type === lexer.TOKEN.TYPE.NUMBER) {
                    if (op.value === lexer.TOKEN.OPERATOR.MUL)
                        return new lexer.Token(LToken.value * RToken.value, lexer.TOKEN.TYPE.NUMBER, LToken.line, LToken.col);
                    else if (op.value === lexer.TOKEN.OPERATOR.DIV)
                        return new lexer.Token(LToken.value / RToken.value, lexer.TOKEN.TYPE.NUMBER, LToken.line, LToken.col);
                    else if (op.value === lexer.TOKEN.OPERATOR.MOD)
                        return new lexer.Token(LToken.value % RToken.value, lexer.TOKEN.TYPE.NUMBER, LToken.line, LToken.col);
                }
                else throw new Error("Line " + LToken.line + ": Invalid expression, cannot " + LToken.type + " " + op.value + " " + RToken.type);
            }
        }());
    }
    return LReturn;
}

//<neg> -> - <neg> | <paren>
function expressionNeg() {
    var negCount = 0;
    while (currentToken.value === lexer.TOKEN.OPERATOR.SUB) {
        matchValue(lexer.TOKEN.OPERATOR.SUB);
        negCount++;
    }
    negCount %= 2;
    var parenReturn = expressionParen();
    //negCount will be 0 if there is an even number of '-'
    if (negCount) {
        return function() {
            var parenReturnToken = coerceToNumber(parenReturn());
            return new lexer.Token(-parenReturnToken.value, parenReturnToken.type, parenReturnToken.line, parenReturnToken.col);
        }
    }
    else
        return parenReturn;
}

//<paren> -> ( <andOr> ) | <operand>
function expressionParen() {
    if (currentToken.value === lexer.TOKEN.OPERATOR.LPAREN) {
        matchValue(lexer.TOKEN.OPERATOR.LPAREN);
        var exprReturn = expressionAndOr();
        matchValue(lexer.TOKEN.OPERATOR.RPAREN);
        return exprReturn;
    }
    else
        return operand();
}

//<operand> -> <number> | <string> | <variable> | <selector> | <state>
function operand() {
    var returnToken;
    if (currentToken.type === lexer.TOKEN.TYPE.NUMBER) {
        returnToken = matchType(lexer.TOKEN.TYPE.NUMBER);
        returnToken.value = parseInt(returnToken.value);
    }
    else if (currentToken.type === lexer.TOKEN.TYPE.STRING)
        returnToken = matchType(lexer.TOKEN.TYPE.STRING);
    else if (currentToken.type === lexer.TOKEN.TYPE.VARIABLE) {
        if (!scope.isDefined(currentToken.value))
            throw new Error("Line " + currentToken.line + ": undefined variable " + currentToken.value);
        returnToken = matchType(lexer.TOKEN.TYPE.VARIABLE);
        return scope.lookup(returnToken.value).expression;
    }
    else if (currentToken.type === lexer.TOKEN.TYPE.SELECTOR) {
        returnToken = matchType(lexer.TOKEN.TYPE.SELECTOR);
        //check if tag table is empty
        var thisScope = scope.thisScope();

        //custom event to trigger dependencies
        $(returnToken.value).on("ufm:validate", function (evt) {
            var $selector = $(thisScope.selector.value).ufm();
            $selector.valid(thisScope.tagTable["valid"].expression().value);
            $selector.enabled(thisScope.tagTable["enabled"].expression().value);
            $selector.visible(thisScope.tagTable["visible"].expression().value);
            $selector.optional(thisScope.tagTable["optional"].expression().value);

            $(thisScope.selector.value).trigger("ufm:validate");
        });

        return function () {
            return new lexer.Token($(returnToken.value).ufm(), lexer.TOKEN.TYPE.UFM, returnToken.line, returnToken.col);
        };
    }
    else if (currentToken.type === lexer.TOKEN.TYPE.KEYWORD)
        returnToken = state();
    else if (currentToken.type === lexer.TOKEN.TYPE.REGEX)
        returnToken = matchType(lexer.TOKEN.TYPE.REGEX);
    else if (currentToken.type === lexer.TOKEN.TYPE.BOOL)
        returnToken = matchType(lexer.TOKEN.TYPE.BOOL);
    else {
        throw new Error("Line " + currentToken.line + ": invalid expression, expected an operand, recieved " + currentToken.value + "\n");
    }
    return function () {
        return returnToken;
    };
}

//<state> -> valid | string | number | enabled | visible | optional
function state() {
    if (isState(currentToken)) {
        var temp = matchType(lexer.TOKEN.TYPE.KEYWORD);
        temp.type = lexer.TOKEN.TYPE.STATE;
        return temp;
    }
    else {
        throw new Error("Line "+ currentToken.line + ": Invalid statement, \nexpected a state, recieved " + currentToken.value + "\n");
    }
}

//Parameters: token object
//checks the inputToken value against the currentToken type
//if they match, the next token is loaded into the currentToken and the matched token is returned
function matchType(inputToken) {
    if (inputToken === currentToken.type) {
        var tempCurrentToken = currentToken;
        //console.log("Value: " + currentToken.value + ", Type: " + currentToken.type);
        currentToken = lexer.getNextToken();
        return tempCurrentToken;
    }
    else throw new Error("match type failed on line " + currentToken.line + ", could not find: " + currentToken.value + " " + currentToken.type);
}

//Parameters: token object
//checks the inputToken value against the currentToken value
//if they match, the next token is loaded into the currentToken and the matched token is returned
function matchValue(inputToken) {
    if (inputToken === currentToken.value) {
        var tempCurrentToken = currentToken;
        //console.log("Value: " + currentToken.value + " Type: " + currentToken.type);
        currentToken = lexer.getNextToken();
        return tempCurrentToken;
    }
    else throw new Error("match value failed on line " + currentToken.line + ", could not find: " + currentToken.value + ", " + currentToken.type);
}

/*

Parse is the "main" function
 it opens the global scope and calls lexer to get the next token into the currentToken
 blocks() is the top-level layer in the grammar tree.
 when scope is closed, it returns the root of the symbol tree.

*/
module.exports = {
    parse: function (inputString) {
        var closedScope;
        lexer.loadString(inputString);
        currentToken = lexer.getNextToken();
        closedScope = scope.createScope("", function () {
            blocks();
        });
        return closedScope;
    },
    _scope: scope
};