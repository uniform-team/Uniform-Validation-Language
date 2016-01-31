var lexer = require("./lexer.js");
var currentToken;


function blocks() {
    if (currentToken.type === lexer.TOKEN.TYPE.SELECTOR)
        block();
    else if (currentToken.type === lexer.TOKEN.TYPE.VARIABLE)
        variableDeclaration();
    else return;

    blocks();
}

function block() {
    matchType(lexer.TOKEN.TYPE.SELECTOR);
    matchValue(lexer.TOKEN.OPERATOR.LBRACE);
    statements();
    matchValue(lexer.TOKEN.OPERATOR.RBRACE);
}

function variableDeclaration() {
    matchType(lexer.TOKEN.TYPE.VARIABLE);
    matchValue(lexer.TOKEN.OPERATOR.COLON);
    expression();
    matchValue(lexer.TOKEN.OPERATOR.SEMICOLON);
}

function statements() {
    while (currentToken.value === lexer.TOKEN.TAG.VALID ||
        currentToken.value === lexer.TOKEN.TAG.OPTIONAL ||
        currentToken.value === lexer.TOKEN.TAG.ENABLED ||
        currentToken.value === lexer.TOKEN.TAG.VISIBLE ||
        currentToken.type === lexer.TOKEN.TYPE.SELECTOR)
    {
        statement();
    }
}

function statement() {

    if (currentToken.type === lexer.TOKEN.TYPE.SELECTOR) {
        block();
    }
    else {
        tag();
        matchValue(lexer.TOKEN.OPERATOR.COLON);
        expression();
        matchValue(lexer.TOKEN.OPERATOR.SEMICOLON);
    }
}

function tag() {
    if (currentToken.value === lexer.TOKEN.TAG.VALID ||
            currentToken.value === lexer.TOKEN.TAG.OPTIONAL ||
            currentToken.value === lexer.TOKEN.TAG.ENABLED ||
            currentToken.value === lexer.TOKEN.TAG.VISIBLE)
        matchType(lexer.TOKEN.TYPE.KEYWORD);
    else {
        throw new Error("Invalid statement on line " + currentToken.line + ", \nexpected tag, recieved " + currentToken.value + "\n");
    }
}

function expression() {
    expression1();
}


function expression1() {
    expression2();
    while (currentToken.value === lexer.TOKEN.OPERATOR.AND ||
    currentToken.value === lexer.TOKEN.OPERATOR.OR) {
        matchType(lexer.TOKEN.TYPE.KEYWORD);
        expression2();
        console.log("and/or");
    }
}

function expression2() {
    if (currentToken.value === lexer.TOKEN.OPERATOR.NOT) {
        matchValue(lexer.TOKEN.OPERATOR.NOT);
        expression2();
        console.log("not");
    }
    else
        expression3();
}

function expression3() {
    expression4();
    while (currentToken.value === lexer.TOKEN.OPERATOR.EQUALS ||
    currentToken.value === lexer.TOKEN.OPERATOR.MATCHES ||
    currentToken.value === lexer.TOKEN.OPERATOR.IS ||
    currentToken.value === lexer.TOKEN.OPERATOR.LT ||
    currentToken.value === lexer.TOKEN.OPERATOR.GT ||
    currentToken.value === lexer.TOKEN.OPERATOR.LTE ||
    currentToken.value === lexer.TOKEN.OPERATOR.GTE) {
        matchType(lexer.TOKEN.TYPE.KEYWORD);
        expression4();
        console.log("operator");
    }
}

function expression4() {
    expression5();
    while (currentToken.value === lexer.TOKEN.OPERATOR.ADD ||
    currentToken.value === lexer.TOKEN.OPERATOR.SUB) {
        matchType(lexer.TOKEN.TYPE.KEYWORD);
        expression5();
        console.log("plus minus");
    }
}

function expression5() {
    expression6();
    while (currentToken.value === lexer.TOKEN.OPERATOR.MUL ||
    currentToken.value === lexer.TOKEN.OPERATOR.DIV ||
    currentToken.value === lexer.TOKEN.OPERATOR.MOD) {
        matchType(lexer.TOKEN.TYPE.KEYWORD);
        expression6();
        console.log("mul div mod");
    }
}

function expression6() {
    while (currentToken.value === lexer.TOKEN.OPERATOR.SUB) {
        matchValue(lexer.TOKEN.OPERATOR.SUB);
        console.log("neg");
    }
    expression7();
}

function expression7() {
    if (currentToken.value === lexer.TOKEN.OPERATOR.LPAREN) {
        matchValue(lexer.TOKEN.OPERATOR.LPAREN);
        expression1();
        matchValue(lexer.TOKEN.OPERATOR.RPAREN);
    }
    else operand();
}

function operand() {
    if (currentToken.type === lexer.TOKEN.TYPE.NUMBER)
        matchType(lexer.TOKEN.TYPE.NUMBER);
    else if (currentToken.type === lexer.TOKEN.TYPE.STRING)
        matchType(lexer.TOKEN.TYPE.STRING);
    else if (currentToken.type === lexer.TOKEN.TYPE.VARIABLE)
        matchType(lexer.TOKEN.TYPE.VARIABLE);
    else if (currentToken.type === lexer.TOKEN.TYPE.SELECTOR)
        matchType(lexer.TOKEN.TYPE.SELECTOR);
    else if (currentToken.type === lexer.TOKEN.TYPE.KEYWORD)
        state();
    else {
        throw new Error("Invalid statement on line " + currentToken.line + ", \nexpected an operand, recieved " + currentToken.value + "\n");
    }
}

function state() {
    if (currentToken.value === lexer.TOKEN.STATE.VALID ||
        currentToken.value === lexer.TOKEN.STATE.ENABLED ||
        currentToken.value === lexer.TOKEN.STATE.VISIBLE ||
        currentToken.value === lexer.TOKEN.STATE.OPTIONAL ||
            currentToken.value === lexer.TOKEN.STATE.STRING ||
            currentToken.value === lexer.TOKEN.STATE.NUMBER)
        matchType(lexer.TOKEN.TYPE.KEYWORD);
    else {
        throw new Error("Invalid statement on line " + currentToken.line + ", \nexpected a state, recieved " + currentToken.value + "\n");
    }
}


function matchType(inputToken) {
    if (inputToken === currentToken.type) {
        console.log("Value: " + currentToken.value + " Type: " + currentToken.type);
        currentToken = lexer.getNextToken();
    }
    else throw new Error("match type failed on line " + currentToken.line + ", could not find: " + currentToken.value);
}

function matchValue(inputToken) {
    if (inputToken === currentToken.value) {
        console.log("Value: " + currentToken.value + " Type: " + currentToken.type);
        currentToken = lexer.getNextToken();
    }
    else throw new Error("match value failed on line " + currentToken.line + ", could not find: " + currentToken.value);
}

module.exports = {
    parse: function (inputString) {
        lexer.loadString(inputString);
        currentToken = lexer.getNextToken();
        blocks();
        console.log("Done Parsing\n");
    },
    _expression: expression
};