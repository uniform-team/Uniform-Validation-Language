
var lexer = require("./lexer.js");
var scope = require("./scope.js");

var currentToken;
var tokenString = "";

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

    scope.insert(new scope.Symbol(selector, "", scope.KIND.SELECTOR));
    matchValue(lexer.TOKEN.OPERATOR.LBRACE);
    scope.openScope(selector);
    statements();
    matchValue(lexer.TOKEN.OPERATOR.RBRACE);
    scope.closeScope();
}

function variableDeclaration() {
    var variable = matchType(lexer.TOKEN.TYPE.VARIABLE);
    matchValue(lexer.TOKEN.OPERATOR.COLON);
    tokenString = "";
    expressionAndOr();
    if (scope.thisScope().find(variable) !== null)
        console.warn("Line " + currentToken.line + ": Redeclared variable in same scope " + variable);

    scope.insert(new scope.Symbol(variable, tokenString, scope.KIND.VARIABLE));
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
        expressionAndOr();
        if (scope.thisScope().find(tagName) !== null)
            console.warn("Line " + currentToken.line + ": Redeclared tag in same scope " + tagName);
        scope.insert(new scope.Symbol(tagName, "", scope.KIND.TAG));
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
    expressionNot();
    while (currentToken.value === lexer.TOKEN.OPERATOR.AND ||
    currentToken.value === lexer.TOKEN.OPERATOR.OR) {
        matchType(lexer.TOKEN.TYPE.KEYWORD);
        expressionNot();
    }
}

function expressionNot() {
    if (currentToken.value === lexer.TOKEN.OPERATOR.NOT) {
        matchValue(lexer.TOKEN.OPERATOR.NOT);
        expressionNot();
    }
    else
        expressionOp();
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

function expressionOp() {
    expressionAddSub();
    while (isExpressionOp(currentToken)) {
        matchType(lexer.TOKEN.TYPE.KEYWORD);
        expressionAddSub();
    }
}

function expressionAddSub() {
    expressionMulDivMod();
    while (currentToken.value === lexer.TOKEN.OPERATOR.ADD ||
    currentToken.value === lexer.TOKEN.OPERATOR.SUB) {
        matchType(lexer.TOKEN.TYPE.KEYWORD);
        expressionMulDivMod();
    }
}

function expressionMulDivMod() {
    expressionNeg();
    while (currentToken.value === lexer.TOKEN.OPERATOR.MUL ||
    currentToken.value === lexer.TOKEN.OPERATOR.DIV ||
    currentToken.value === lexer.TOKEN.OPERATOR.MOD) {
        matchType(lexer.TOKEN.TYPE.KEYWORD);
        expressionNeg();
    }
}

function expressionNeg() {
    while (currentToken.value === lexer.TOKEN.OPERATOR.SUB) {
        matchValue(lexer.TOKEN.OPERATOR.SUB);
    }
    expressionParen();
}

function expressionParen() {
    if (currentToken.value === lexer.TOKEN.OPERATOR.LPAREN) {
        matchValue(lexer.TOKEN.OPERATOR.LPAREN);
        var AndOrValue = expressionAndOr();
        matchValue(lexer.TOKEN.OPERATOR.RPAREN);
        return AndOrValue;
    }
    else {
        return operand();
}

function operand() {
    var operandValue;
    if (currentToken.type === lexer.TOKEN.TYPE.NUMBER)
        returnFunctionTypeValue = matchType(lexer.TOKEN.TYPE.NUMBER);
    else if (currentToken.type === lexer.TOKEN.TYPE.STRING)
        operandValue = matchType(lexer.TOKEN.TYPE.STRING);
    else if (currentToken.type === lexer.TOKEN.TYPE.VARIABLE) {
        if (scope.isDefined(currentToken.value))
            throw new Error("Line " + currentToken.line + ": variable undefined " + currentToken.value);
        operandValue = matchType(lexer.TOKEN.TYPE.VARIABLE);
    }
    else if (currentToken.type === lexer.TOKEN.TYPE.SELECTOR)
        operandValue = matchType(lexer.TOKEN.TYPE.SELECTOR);
    else if (currentToken.type === lexer.TOKEN.TYPE.KEYWORD)
        state();
    else if (currentToken.type === lexer.TOKEN.TYPE.REGEX)
        operandValue = matchType(lexer.TOKEN.TYPE.REGEX);
    else {
        throw new Error("Line " + currentToken.line + ": invalid expression, expected an operand, recieved " + currentToken.value + "\n");
    }
    return function () {
        return operandValue;
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
    if (isState(currentToken))
        matchType(lexer.TOKEN.TYPE.KEYWORD);
    else {
        throw new Error("Line "+ currentToken.line + ": Invalid statement, \nexpected a state, recieved " + currentToken.value + "\n");
    }
}


function matchType(inputToken) {
    if (inputToken === currentToken.type) {
        tokenString += currentToken.value + " ";
        var thisString = currentToken.value;
        console.log("Value: " + currentToken.value + ", Type: " + currentToken.type);
        currentToken = lexer.getNextToken();
        return thisString;
    }
    else throw new Error("match type failed on line " + currentToken.line + ", could not find: " + currentToken.value + " " + currentToken.type);
}

function matchValue(inputToken) {
    if (inputToken === currentToken.value) {
        tokenString += currentToken.value + " ";
        var thisString = currentToken.value;
        console.log("Value: " + currentToken.value + " Type: " + currentToken.type);
        currentToken = lexer.getNextToken();
        return thisString;
    }
    else throw new Error("match value failed on line " + currentToken.line + ", could not find: " + currentToken.value + ", " + currentToken.type);
}

module.exports = {
    parse: function (inputString) {
        lexer.loadString(inputString);
        currentToken = lexer.getNextToken();
        scope.openScope("");
        blocks();
        scope.closeScope();
        console.log("Done Parsing\n");
    },
    _expression: expressionAndOr
};