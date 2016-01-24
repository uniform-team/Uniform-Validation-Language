//Constants for lexical tokens
var TOKEN = {
    TYPE: {
        OPERATOR: "operator",
        VARIABLE: "variable",
        NUMBER: "number",
        STRING: "string",
        ENDOFFILE: "EOF",
        SELECTOR: "selector",
        TAG: "tag",
        STATE: "state"
    },
    OPERATOR: {
        ADD: "+",
        SUB: "-",
        MUL: "*",
        DIV: "/",
        MOD: "%",
        IS: "is",
        AND: "and",
        OR: "or",
        NOT: "not",
        MATCHES: "matches",
        EQUALS: "equals",
        COLON: ":",
        LBRACE: "{",
        RBRACE: "}",
        LPAREN: "(",
        RPAREN: ")",
        SEMICOLON: ";",
        LT: "<",
        GT: ">",
        LTE: "<=",
        GTE: ">="
    },
    TAG: {
        VALID: "valid",
        ENABLED: "enabled",
        VISIBLE: "visible",
        OPTIONAL: "optional"
    },
    STATE: {
        CHECKED: "checked",
        VALID: "valid"
    },
    ENDOFFILE: "EOF",
};

//Generates new token object
function Token(value, type, line, col) {
    if (value === undefined) throw new Error("Undefined Token");
    if (type === undefined) throw new Error("Undefined Type");
    this.value = value;
    this.type = type;
    this.line = line;
    this.col = col;
}

//Regular expressions
var isWhitespace = /\s|\t/;
var isAlpha = /[a-zA-Z]/;
var isDigit = /[0-9]/;

var lineNumber = 0;     //keeps track of current line number for error messages
var lineIndex = 0;      //keeps track of the current index of the line for error messages
var stringIndex = 0;    //the index of the string, lexbuffer contains the character at this index
var inputString = "";   //the entire uniform file to be lexed

module.exports = {
    TOKEN: TOKEN,

    //Description: Call load string before calling lexer, used for scope
    //Parameters: inString -- a string containing the entire uniform file to be lexed
    loadString: function (inString) {
        inputString = inString;
        stringIndex = 0;
    },

    //Description: Returns the current token and prepares to return the next
    getNextToken: function () {

        var lexbuffer = "";         //contains a single character to be analyzed
        var tokenBuffer = "";   //buffer that appends the lexbuffer until a token is built

        //Description: Appends lexbuffer to tokenBuffer, and loads the next char into lexbuffer
        function nextChar() {
            if (lexbuffer === "\n") {
                lineNumber++;
                lineIndex = 0;
            }
            else
                lineIndex++;
            tokenBuffer += lexbuffer;
            stringIndex++;
            lexbuffer = inputString.charAt(stringIndex);
        }

        //When the end of the uniform file is reached, exit
        if (stringIndex >= inputString.length) {
            return new Token(TOKEN.ENDOFFILE, TOKEN.TYPE.ENDOFFILE, lineNumber, lineIndex);
        }


        //set lexbuffer equal to the stringIndex
        lexbuffer = inputString.charAt(stringIndex);

        //ignore whitespace, move string index until non-whitespace character is found
        while (isWhitespace.test(lexbuffer)) {
            if (lexbuffer === "\n") {
                lineNumber++;
                lineIndex = 0;
            }
            else
                lineIndex++;
            stringIndex++;
            lexbuffer = inputString.charAt(stringIndex);
        }

        //check for dom element
        if (lexbuffer === "$") {
            nextChar();
            if (lexbuffer === "(") {
                nextChar();
                if (lexbuffer === "\"") {
                    while (true) {
                        nextChar();
                        if (lexbuffer === "\"") {
                            nextChar();
                            if (lexbuffer === ")") {
                                nextChar();
                                break;
                            }
                        }
                    }
                    return new Token(tokenBuffer, TOKEN.TYPE.SELECTOR, lineNumber, lineIndex);
                }
                else {
                    console.log("ERROR: Invalid token--Expected token of type: SELECTOR \n Recieved " + tokenBuffer + " on line " + lineNumber + "\n");
                    return "ERROR";
                }
            }
            else {
                console.log("ERROR: Invalid token--Expected token of type: SELECTOR \n Recieved " + tokenBuffer + " on line " + lineNumber + "\n");
                return "ERROR";
            }
        }

        //check for operators and tags
        if (isAlpha.test(lexbuffer)) {
            do {
                nextChar();
            } while (isAlpha.test(lexbuffer));

            switch(tokenBuffer) {
                case TOKEN.OPERATOR.IS:
                    return new Token(TOKEN.OPERATOR.IS, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
                case TOKEN.OPERATOR.AND:
                    return new Token(TOKEN.OPERATOR.AND, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
                case TOKEN.OPERATOR.OR:
                    return new Token(TOKEN.OPERATOR.OR, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
                case TOKEN.OPERATOR.NOT:
                    return new Token(TOKEN.OPERATOR.NOT, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
                case TOKEN.OPERATOR.MATCHES:
                    return new Token(TOKEN.OPERATOR.MATCHES, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
                case TOKEN.OPERATOR.EQUALS:
                    return new Token(TOKEN.OPERATOR.EQUALS, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);

                case TOKEN.TAG.VALID:
                    return new Token(TOKEN.TAG.VALID, TOKEN.TYPE.TAG, lineNumber, lineIndex);
                case TOKEN.TAG.ENABLED:
                    return new Token(TOKEN.TAG.ENABLED, TOKEN.TYPE.TAG, lineNumber, lineIndex);
                case TOKEN.TAG.VISIBLE:
                    return new Token(TOKEN.TAG.VISIBLE, TOKEN.TYPE.TAG, lineNumber, lineIndex);
                case TOKEN.TAG.OPTIONAL:
                    return new Token(TOKEN.TAG.OPTIONAL, TOKEN.TYPE.TAG, lineNumber, lineIndex);

                case TOKEN.STATE.VALID:
                    return new Token(TOKEN.STATE.VALID, TOKEN.TYPE.STATE, lineNumber, lineIndex);
                case TOKEN.STATE.CHECKED:
                    return new Token(TOKEN.STATE.CHECKED, TOKEN.TYPE.STATE, lineNumber, lineIndex);


                default:
                    throw new Error("ERROR: Invalid token--Expected token of type: OPERATOR or TAG \n Recieved " + tokenBuffer + " on line " + lineNumber + "\n");
            }
        }

        //Check for number
        else if (isDigit.test(lexbuffer)) {
            do {
                nextChar();
            } while (isDigit.test(lexbuffer));
            return new Token(tokenBuffer, TOKEN.TYPE.NUMBER, lineNumber, lineIndex);
        }

        //Check for variable
        else if (lexbuffer === "@") {
            do {
                nextChar();
            } while (isAlpha.test(lexbuffer) || isDigit.test(lexbuffer));
            return new Token(tokenBuffer, TOKEN.TYPE.VARIABLE, lineNumber, lineIndex);
        }

        //Check for string
        else if (lexbuffer === "\"") {
            do {
                nextChar();
            } while (lexbuffer !== '\"');
            nextChar();
            return new Token(tokenBuffer, TOKEN.TYPE.STRING, lineNumber, lineIndex);
        }


        //check for non-alpha operators
        switch (lexbuffer) {
            case TOKEN.OPERATOR.ADD:
                nextChar();
                return new Token(TOKEN.OPERATOR.ADD, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
            case TOKEN.OPERATOR.SUB:
                nextChar();
                return new Token(TOKEN.OPERATOR.SUB, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
            case TOKEN.OPERATOR.MUL:
                nextChar();
                return new Token(TOKEN.OPERATOR.MUL, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
            case TOKEN.OPERATOR.DIV:
                nextChar();
                return new Token(TOKEN.OPERATOR.DIV, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
            case TOKEN.OPERATOR.MOD:
                nextChar();
                return new Token(TOKEN.OPERATOR.MOD, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);

            case TOKEN.OPERATOR.COLON:
                nextChar();
                return new Token(TOKEN.OPERATOR.COLON, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
            case TOKEN.OPERATOR.LBRACE:
                nextChar();
                return new Token(TOKEN.OPERATOR.LBRACE, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
            case TOKEN.OPERATOR.RBRACE:
                nextChar();
                return new Token(TOKEN.OPERATOR.RBRACE, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
            case TOKEN.OPERATOR.LPAREN:
                nextChar();
                return new Token(TOKEN.OPERATOR.LPAREN, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
            case TOKEN.OPERATOR.RPAREN:
                nextChar();
                return new Token(TOKEN.OPERATOR.RPAREN, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
            case TOKEN.OPERATOR.SEMICOLON:
                nextChar();
                return new Token(TOKEN.OPERATOR.SEMICOLON, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
            case TOKEN.OPERATOR.LT:
                nextChar();
                if (lexbuffer === "=")
                    return new Token(TOKEN.OPERATOR.LTE, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
                else
                    return new Token(TOKEN.OPERATOR.LT, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
            case TOKEN.OPERATOR.GT:
                nextChar();
                if (lexbuffer === "=")
                    return new Token(TOKEN.OPERATOR.GTE, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
                else
                    return new Token(TOKEN.OPERATOR.GT, TOKEN.TYPE.OPERATOR, lineNumber, lineIndex);
            default:
                break;
        }
        throw new Error("Unknown token on line " + lineNumber + "\n");
    }
};