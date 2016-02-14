//Constants for lexical tokens
var TOKEN = {
    TYPE: {
        VARIABLE: "variable",
        NUMBER: "number",
        STRING: "string",
        ENDOFFILE: "EOF",
        SELECTOR: "selector",
        KEYWORD: "keyword",
        REGEX: "regex"
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
        GTE: ">=",
        REGEX: "/"
    },
    TAG: {
        VALID: "valid",
        ENABLED: "enabled",
        VISIBLE: "visible",
        OPTIONAL: "optional"
    },
    STATE: {
        VALID: "valid",
        STRING: "string",
        NUMBER: "number",
        ENABLED: "enabled",
        VISIBLE: "visible",
        OPTIONAL: "optional"
    },
    REGEX: "regex",
    ENDOFFILE: "EOF"
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

var lineNumber = 1;     //keeps track of current line number for error messages
var lineIndex = 1;      //keeps track of the current index of the line for error messages
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

        //When called, will reset the line and index numbers if a new line is encountered or increments the line index otherwise
        function resetLine() {
            if (lexbuffer === "\n") {
                lineNumber++;
                lineIndex = 1;
            }
            else
                lineIndex++;
        }

        //increments string index and updates lexbuffer to the next character
        function nextChar() {
            stringIndex++;
            lexbuffer = inputString.charAt(stringIndex);
        }

        //Description: Appends lexbuffer to tokenBuffer, and loads the next char into lexbuffer
        function readChar() {
            resetLine();
            tokenBuffer += lexbuffer;
            nextChar();
        }

        //loads the next char into lexbuffer without appending
        function skipChar() {
            resetLine();
            nextChar();
        }

        function ignoreWhiteSpace() {
            while (isWhitespace.test(lexbuffer)) {
                skipChar();
            }
        }

        //When the end of the uniform file is reached, exit
        if (stringIndex >= inputString.length) {
            return new Token(TOKEN.ENDOFFILE, TOKEN.TYPE.ENDOFFILE, lineNumber, lineIndex);
        }


        //set lexbuffer equal to the stringIndex
        lexbuffer = inputString.charAt(stringIndex);

        //ignore whitespace, move string index until non-whitespace character is found
        ignoreWhiteSpace();
        //check for regex and comment


        //if a / is encountered, it may be a single line comment, multi line comment, division operation, or a regex
        if (lexbuffer === "/") {
            skipChar();
            //single line comment
            if (lexbuffer === "/") {
                skipChar();
                while (lexbuffer !== "\n") {
                    skipChar();
                }
                skipChar();
                tokenBuffer = "";
                ignoreWhiteSpace();
            }
            //multi line comment
            else if (lexbuffer === "*") {
                skipChar();
                while (1) {
                    if (lexbuffer === "*") {
                        readChar();
                        if (lexbuffer === "/") {
                            skipChar();
                            //end comment
                            tokenBuffer = "";
                            ignoreWhiteSpace();
                            break;
                        }
                    }
                    else
                        skipChar();
                }
            }
            else if (lexbuffer === "\"") {
                //regex
                skipChar();
                tokenBuffer = "";
                while (1) {
                    if (lexbuffer === "\"") {
                        skipChar();
                        if (lexbuffer === "/") {
                            skipChar();
                            return new Token(tokenBuffer, TOKEN.TYPE.REGEX, lineNumber, lineIndex);
                        }
                        else tokenBuffer += "\"";
                    }
                    else
                        readChar();
                }
            }
            else
                return new Token(TOKEN.OPERATOR.DIV, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
        }

        //check for dom element
        if (lexbuffer === "$") {
            skipChar();
            if (lexbuffer === "(") {
                skipChar();
                if (lexbuffer === "\"") {
                    skipChar();
                    while (true) {
                        if (lexbuffer === "\"") {
                            skipChar();
                            if (lexbuffer === ")") {
                                skipChar();
                                break;
                            }
                            else {
                                tokenBuffer += "\"";
                            }
                        }
                        else {
                            readChar();
                        }
                    }
                    return new Token(tokenBuffer, TOKEN.TYPE.SELECTOR, lineNumber, lineIndex);
                }
                else {
                    throw new Error("ERROR: Invalid token--Expected token of type: SELECTOR \n Recieved " + tokenBuffer + " on line " + lineNumber + "\n");
                    return "ERROR";
                }
            }
            else {
                throw new Error("ERROR: Invalid token--Expected token of type: SELECTOR \n Recieved " + tokenBuffer + " on line " + lineNumber + "\n");
                return "ERROR";
            }
        }

            //check for operators and tags
        if (isAlpha.test(lexbuffer)) {
            do {
                readChar();
            } while (isAlpha.test(lexbuffer));

            switch(tokenBuffer) {
                case TOKEN.OPERATOR.IS:
                    return new Token(TOKEN.OPERATOR.IS, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.OPERATOR.AND:
                    return new Token(TOKEN.OPERATOR.AND, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.OPERATOR.OR:
                    return new Token(TOKEN.OPERATOR.OR, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.OPERATOR.NOT:
                    return new Token(TOKEN.OPERATOR.NOT, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.OPERATOR.MATCHES:
                    return new Token(TOKEN.OPERATOR.MATCHES, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.OPERATOR.EQUALS:
                    return new Token(TOKEN.OPERATOR.EQUALS, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);

                case TOKEN.TAG.VALID:
                    return new Token(TOKEN.TAG.VALID, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.TAG.ENABLED:
                    return new Token(TOKEN.TAG.ENABLED, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.TAG.VISIBLE:
                    return new Token(TOKEN.TAG.VISIBLE, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.TAG.OPTIONAL:
                    return new Token(TOKEN.TAG.OPTIONAL, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);

                case TOKEN.STATE.STRING:
                    return new Token(TOKEN.STATE.STRING, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.STATE.NUMBER:
                    return new Token(TOKEN.STATE.NUMBER, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);


                default:
                    throw new Error("ERROR: Invalid token--Expected token of type: OPERATOR or TAG \n Recieved " + tokenBuffer + " on line " + lineNumber + "\n");
            }
        }

        //Check for number
        else if (isDigit.test(lexbuffer)) {
            do {
                readChar();
            } while (isDigit.test(lexbuffer));
            return new Token(tokenBuffer, TOKEN.TYPE.NUMBER, lineNumber, lineIndex);
        }

        //Check for variable
        else if (lexbuffer === "@") {
            skipChar();
             while (isAlpha.test(lexbuffer) || isDigit.test(lexbuffer) || lexbuffer === "_")
                readChar();
            return new Token(tokenBuffer, TOKEN.TYPE.VARIABLE, lineNumber, lineIndex);
        }

        //Check for string
        else if (lexbuffer === "\"") {
            do {
                readChar();
            } while (lexbuffer !== '\"');
            readChar();
            return new Token(tokenBuffer, TOKEN.TYPE.STRING, lineNumber, lineIndex);
        }


        //check for non-alpha operators
        switch (lexbuffer) {
            case TOKEN.OPERATOR.ADD:
                readChar();
                return new Token(TOKEN.OPERATOR.ADD, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.SUB:
                readChar();
                return new Token(TOKEN.OPERATOR.SUB, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.MUL:
                readChar();
                return new Token(TOKEN.OPERATOR.MUL, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.DIV:
                readChar();
                return new Token(TOKEN.OPERATOR.DIV, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.MOD:
                readChar();
                return new Token(TOKEN.OPERATOR.MOD, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);

            case TOKEN.OPERATOR.COLON:
                readChar();
                return new Token(TOKEN.OPERATOR.COLON, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.LBRACE:
                readChar();
                return new Token(TOKEN.OPERATOR.LBRACE, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.RBRACE:
                readChar();
                return new Token(TOKEN.OPERATOR.RBRACE, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.LPAREN:
                readChar();
                return new Token(TOKEN.OPERATOR.LPAREN, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.RPAREN:
                readChar();
                return new Token(TOKEN.OPERATOR.RPAREN, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.SEMICOLON:
                readChar();
                return new Token(TOKEN.OPERATOR.SEMICOLON, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.LT:
                readChar();
                if (lexbuffer === "=")
                    return new Token(TOKEN.OPERATOR.LTE, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                else
                    return new Token(TOKEN.OPERATOR.LT, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.GT:
                readChar();
                if (lexbuffer === "=")
                    return new Token(TOKEN.OPERATOR.GTE, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                else
                    return new Token(TOKEN.OPERATOR.GT, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            default:
                break;
        }
        throw new Error("Unknown token: --" + tokenBuffer+ "-- on line " + lineNumber + "\n");
    }
};