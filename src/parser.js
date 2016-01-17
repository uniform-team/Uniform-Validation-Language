var lexer = require("./lexer.js");

module.exports = {
    parse: function (inputString) {
        lexer.loadString(inputString);
        var currentToken = lexer.getNextToken();
        while (currentToken !== lexer.TOKEN.ENDOFFILE) {
            console.log(currentToken + "\n");
            currentToken = lexer.getNextToken();
        }
    }
};