var lexer = require("./lexer.js");

module.exports = {
    parse: function (inputString) {
        lexer.loadString(inputString);
        var currentToken = lexer.getNextToken();
        while (currentToken.type !== lexer.TOKEN.ENDOFFILE) {
            console.log("Token Type: " + currentToken.type + " Token Value: " + currentToken.value + "\n");
            if (currentToken === "}")
                break;
            currentToken = lexer.getNextToken();
        }
    }
};