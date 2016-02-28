var lexer = require("./lexer.js");
var scope = require("./scope.js");

var currentToken;

function isTag(token) {
    return (token.value === lexer.TOKEN.TAG.VALID ||
    token.value === lexer.TOKEN.TAG.OPTIONAL ||
    token.value === lexer.TOKEN.TAG.ENABLED ||
    token.value === lexer.TOKEN.TAG.VISIBLE);
}

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

function block() {
    var selector = matchType(lexer.TOKEN.TYPE.SELECTOR);
    if (scope.thisScope().find(selector) !== null)
        console.warn("Line " + currentToken.line + ": Redeclared selector in same scope " + selector);

    scope.insert(new scope.Symbol(selector.value, "", scope.KIND.SELECTOR));
    matchValue(lexer.TOKEN.OPERATOR.LBRACE);
    scope.createScope(selector, function() {
        statements();
        matchValue(lexer.TOKEN.OPERATOR.RBRACE);
    });
}

function variableDeclaration() {
    var variable = matchType(lexer.TOKEN.TYPE.VARIABLE);
    matchValue(lexer.TOKEN.OPERATOR.COLON);
    var exprValue = expressionAndOr();
    if (scope.thisScope().find(variable) !== null)
        console.warn("Line " + currentToken.line + ": Redeclared variable in same scope " + variable);
    scope.insert(new scope.Symbol(variable.value, exprValue, scope.KIND.VARIABLE));
    matchValue(lexer.TOKEN.OPERATOR.SEMICOLON);
}

function isValidStatement() {
    return (isTag(currentToken) ||
    currentToken.type === lexer.TOKEN.TYPE.SELECTOR ||
    currentToken.type === lexer.TOKEN.TYPE.VARIABLE);
}

function statements() {
    if (isValidStatement())
        while (isValidStatement())
        {
            statement();
        }
    else throw new Error("Line " + currentToken.line + ": Invalid statement");
}

function statement() {
    if (currentToken.type === lexer.TOKEN.TYPE.SELECTOR) {
        block();
    }
    else if (currentToken.type === lexer.TOKEN.TYPE.VARIABLE) {
        variableDeclaration();
    }
    else {
        var tagName = tag();
        matchValue(lexer.TOKEN.OPERATOR.COLON);
        var exprValue = expressionAndOr();
        if (scope.thisScope().find(tagName) !== null)
            console.warn("Line " + currentToken.line + ": Redeclared tag in same scope " + tagName);
        scope.insert(new scope.Symbol(tagName.value, exprValue, scope.KIND.TAG));
        matchValue(lexer.TOKEN.OPERATOR.SEMICOLON);
    }
}

function tag() {
    if (isTag(currentToken)) {
        return matchType(lexer.TOKEN.TYPE.KEYWORD);
    }
    else {
        throw new Error("Invalid statement on line " + currentToken.line + ", \nexpected tag, recieved " + currentToken.value + "\n");
    }
}

function expressionAndOr() {
    var LReturn = expressionNot();
    while (currentToken.value === lexer.TOKEN.OPERATOR.AND ||
    currentToken.value === lexer.TOKEN.OPERATOR.OR) {
        (function() {
            var op = matchType(lexer.TOKEN.TYPE.KEYWORD);
            var RReturn = expressionNot();
            var tempLReturn = LReturn;
            LReturn = function () {
                var LToken = tempLReturn();
                var RToken = RReturn();
                if (op.value === lexer.TOKEN.OPERATOR.OR)
                    return new lexer.Token(LToken.value || RToken.value, lexer.TOKEN.TYPE.BOOL, RToken.line, RToken.col);
                else if (op.value === lexer.TOKEN.OPERATOR.AND)
                    return new lexer.Token(LToken.value && RToken.value, lexer.TOKEN.TYPE.BOOL, RToken.line, RToken.col);
                else throw new Error("Line " + RToken.line + ": Invalid expression, cannot " + LToken.type + " " + op.value + " " + RToken.type);
            };
        })();
    }
    return LReturn;
}

function expressionNot() {
    if (currentToken.value === lexer.TOKEN.OPERATOR.NOT) {
        matchValue(lexer.TOKEN.OPERATOR.NOT);
        var RReturn = expressionNot();
        return function () {
            var RToken = RReturn();
            if (RToken.type === lexer.TOKEN.TYPE.BOOL || RToken.type === lexer.TOKEN.TYPE.NUMBER)
                return new lexer.Token(!RToken.value, lexer.TOKEN.TYPE.BOOL, RToken.line, RToken.col);
            else throw new Error("Line " + RToken.line + ": Invalid expression, cannot not " + RToken.type);
        };
    }
    else
        return expressionOp();
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

function isState(token) {
    return (token.value === lexer.TOKEN.STATE.VALID ||
    token.value === lexer.TOKEN.STATE.STRING ||
    token.value === lexer.TOKEN.STATE.NUMBER ||
    token.value === lexer.TOKEN.STATE.ENABLED ||
    token.value === lexer.TOKEN.STATE.VISIBLE ||
    token.value === lexer.TOKEN.STATE.OPTIONAL);
}

function expressionOp() {
    var LReturn = expressionAddSub();
    while (isExpressionOp(currentToken)) {
        var op = matchType(lexer.TOKEN.TYPE.KEYWORD);
        var RReturn = expressionAddSub();
        var tempLReturn = LReturn;
        LReturn = function () {
            var LToken = tempLReturn();
            var RToken = RReturn();
            if (LToken.type === lexer.TOKEN.TYPE.NUMBER && RToken.type === lexer.TOKEN.TYPE.NUMBER) {
                if (op.value === lexer.TOKEN.OPERATOR.LT) {
                    return new lexer.Token(LToken.value < RToken.value, lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
                }
                else if (op.value === lexer.TOKEN.OPERATOR.GT) {
                    return new lexer.Token(LToken.value > RToken.value, lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
                }
                else if (op.value === lexer.TOKEN.OPERATOR.GTE) {
                    return new lexer.Token(LToken.value >= RToken.value, lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
                }
                else if (op.value === lexer.TOKEN.OPERATOR.LTE) {
                    return new lexer.Token(LToken.value <= RToken.value, lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
                }
                else if (op.value === lexer.TOKEN.OPERATOR.EQUALS) {
                    return new lexer.Token(LToken.value === RToken.value, lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
                }
            }
            else if (op.value === lexer.TOKEN.OPERATOR.EQUALS) {
                return new lexer.Token(LToken.value === RToken.value, lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
            }
            else if (op.value === lexer.TOKEN.OPERATOR.MATCHES && RToken.type === lexer.TOKEN.TYPE.REGEX) {
                var tempRegex = new RegExp(RToken.value);
                return new lexer.Token(tempRegex.test(LToken.value), lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
            }
            else if (isState(RToken) && op.value === lexer.TOKEN.OPERATOR.IS) {
                if (RToken.value === lexer.TOKEN.STATE.STRING)
                    return new lexer.Token(LToken.type === lexer.TOKEN.TYPE.STRING, lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
                if (RToken.value === lexer.TOKEN.STATE.NUMBER)
                    return new lexer.Token(LToken.type === lexer.TOKEN.TYPE.NUMBER, lexer.TOKEN.TYPE.BOOL, LToken.line, LToken.col);
                //TODO call selector tag functions
            }
            else throw new Error("Line " + LToken.line + ": Invalid expression, cannot " + LToken.type + " " + op.value + " " + RToken.type);
        };
    }
    return LReturn;
}

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
                var LToken = tempLReturn();
                var RToken = RReturn();
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
                var LToken = tempLReturn();
                var RToken = RReturn();
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
            var parenReturnToken = parenReturn();
            if (parenReturnToken.type === lexer.TOKEN.TYPE.NUMBER)
                return new lexer.Token(-parenReturnToken.value, parenReturnToken.type, parenReturnToken.line, parenReturnToken.col);
            else
                throw new Error("Line " + parenReturnToken.line + ": cannot negate " + parenReturn.type + " " + parenReturn.value);
        }
    }
    else
        return parenReturn;
}

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
    else if (currentToken.type === lexer.TOKEN.TYPE.SELECTOR)
        returnToken = matchType(lexer.TOKEN.TYPE.SELECTOR);
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

function isState(token) {
    return token.value === lexer.TOKEN.STATE.VALID ||
        token.value === lexer.TOKEN.STATE.ENABLED ||
        token.value === lexer.TOKEN.STATE.VISIBLE ||
        token.value === lexer.TOKEN.STATE.OPTIONAL ||
        token.value === lexer.TOKEN.STATE.STRING ||
        token.value === lexer.TOKEN.STATE.NUMBER;
}

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

function matchType(inputToken) {
    if (inputToken === currentToken.type) {
        var tempCurrentToken = currentToken;
        //console.log("Value: " + currentToken.value + ", Type: " + currentToken.type);
        currentToken = lexer.getNextToken();
        return tempCurrentToken;
    }
    else throw new Error("match type failed on line " + currentToken.line + ", could not find: " + currentToken.value + " " + currentToken.type);
}

function matchValue(inputToken) {
    if (inputToken === currentToken.value) {
        var tempCurrentToken = currentToken;
        //console.log("Value: " + currentToken.value + " Type: " + currentToken.type);
        currentToken = lexer.getNextToken();
        return tempCurrentToken;
    }
    else throw new Error("match value failed on line " + currentToken.line + ", could not find: " + currentToken.value + ", " + currentToken.type);
}

module.exports = {
    parse: function (inputString) {
        var closeScope;
        lexer.loadString(inputString);
        currentToken = lexer.getNextToken();
        closeScope = scope.createScope("", function () {
            blocks();
        });
        return closeScope;
    },
    _addSub: expressionAddSub,
    _scope: scope
};