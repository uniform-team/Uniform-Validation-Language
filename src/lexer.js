//Constants for lexical tokens
var TOKEN = {
    OPERATOR_TYPE: "operator",
    OPERATOR: {
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
    VARIABLE: "variable",
    NUMBER: "number",
    STRING: "string",
    ENDOFFILE: "EOF",
    SELECTOR: "selector",

    TAG_TYPE: "tag",
    TAG: {
        VALID: "valid",
        ENABLED: "enabled",
        VISIBLE: "visible",
        OPTIONAL: "optional"
    }
};

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
        var nextTokenBuffer = "";   //buffer that appends the lexbuffer until a token is built

        //Description: Appends lexbuffer to nextTokenBuffer, and loads the next char into lexbuffer
        function nextChar() {
            if (lexbuffer === "\n") {
                lineNumber++;
                lineIndex = 0;
            }
            else
                lineIndex++;
            nextTokenBuffer += lexbuffer;
            stringIndex++;
            lexbuffer = inputString.charAt(stringIndex);
        }

        //When the end of the uniform file is reached, exit
        if (stringIndex >= inputString.length) {
            return {
                value: "EOF",
                type: TOKEN.ENDOFFILE,
                line: lineNumber,
                col: lineIndex
            }
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
                    return {
                        value: nextTokenBuffer,
                        type: TOKEN.SELECTOR,
                        line: lineNumber,
                        col: lineIndex
                    };
                }
                else {
                    console.log("ERROR: Invalid token--Expected token of type: SELECTOR \n Recieved " + nextTokenBuffer + " on line " + lineNumber + "\n");
                    return "ERROR";
                }
            }
            else {
                console.log("ERROR: Invalid token--Expected token of type: SELECTOR \n Recieved " + nextTokenBuffer + " on line " + lineNumber + "\n");
                return "ERROR";
            }
        }

        //check for operators and tags
        if (isAlpha.test(lexbuffer)) {
            do {
                nextChar();
            } while (isAlpha.test(lexbuffer));

            switch(nextTokenBuffer) {
                case "is":
                    return {
                        value: nextTokenBuffer,
                        type: TOKEN.OPERATOR_TYPE,
                        line: lineNumber,
                        col: lineIndex
                    };
                case "and":
                    return {
                        value: nextTokenBuffer,
                        type: TOKEN.OPERATOR_TYPE,
                        line: lineNumber,
                        col: lineIndex
                    };
                case "or":
                    return {
                        value: nextTokenBuffer,
                        type: TOKEN.OPERATOR_TYPE,
                        line: lineNumber,
                        col: lineIndex
                    };
                case "not":
                    return {
                        value: nextTokenBuffer,
                        type: TOKEN.OPERATOR_TYPE,
                        line: lineNumber,
                        col: lineIndex
                    };
                case "matches":
                    return {
                        value: nextTokenBuffer,
                        type: TOKEN.OPERATOR_TYPE,
                        line: lineNumber,
                        col: lineIndex
                    };
                case "equals":
                    return {
                        value: nextTokenBuffer,
                        type: TOKEN.OPERATOR_TYPE,
                        line: lineNumber,
                        col: lineIndex
                    };
                case "valid":
                    return {
                        value: nextTokenBuffer,
                        type: TOKEN.TAG_TYPE,
                        line: lineNumber,
                        col: lineIndex
                    };
                case "enabled":
                    return {
                        value: nextTokenBuffer,
                        type: TOKEN.TAG_TYPE,
                        line: lineNumber,
                        col: lineIndex
                    };
                case "visible":
                    return {
                        value: nextTokenBuffer,
                        type: TOKEN.TAG_TYPE,
                        line: lineNumber,
                        col: lineIndex
                    };
                case "optional":
                    return {
                        value: nextTokenBuffer,
                        type: TOKEN.TAG_TYPE,
                        line: lineNumber,
                        col: lineIndex
                    };
                default:
                    console.log("ERROR: Invalid token--Expected token of type: OPERATOR or TAG \n Recieved " + nextTokenBuffer + " on line " + lineNumber + "\n");
                    return "ERROR";
            }
        }

        //Check for number
        else if (isDigit.test(lexbuffer)) {
            do {
                nextChar();
            } while (isDigit.test(lexbuffer));
            return {
                value: nextTokenBuffer,
                type: TOKEN.NUMBER,
                line: lineNumber,
                col: lineIndex
            };
        }

        //Check for variable
        else if (lexbuffer === "@") {
            do {
                nextChar();
            } while (isAlpha.test(lexbuffer) || isDigit.test(lexbuffer));
                return {
                value: nextTokenBuffer,
                type: TOKEN.VARIABLE,
                line: lineNumber,
                col: lineIndex
            };
        }

        //Check for string
        else if (lexbuffer === "\"") {
            do {
                nextChar();
            } while (lexbuffer !== '\"');
            nextChar();
            return {
                value: nextTokenBuffer,
                type: TOKEN.STRING,
                line: lineNumber,
                col: lineIndex
            };
        }


        //check for non-alpha operators
        switch (lexbuffer) {
            case TOKEN.OPERATOR.COLON:
                nextChar();
                return {
                    value: nextTokenBuffer,
                    type: TOKEN.OPERATOR_TYPE,
                    line: lineNumber,
                    col: lineIndex
                };
            case TOKEN.OPERATOR.LBRACE:
                nextChar();
                return {
                    value: nextTokenBuffer,
                    type: TOKEN.OPERATOR_TYPE,
                    line: lineNumber,
                    col: lineIndex
                };
            case TOKEN.OPERATOR.RBRACE:
                nextChar();
                return {
                    value: nextTokenBuffer,
                    type: TOKEN.OPERATOR_TYPE,
                    line: lineNumber,
                    col: lineIndex
                };
            case TOKEN.OPERATOR.LPAREN:
                nextChar();
                return {
                    value: nextTokenBuffer,
                    type: TOKEN.OPERATOR_TYPE,
                    line: lineNumber,
                    col: lineIndex
                };
            case TOKEN.OPERATOR.RPAREN:
                nextChar();
                return {
                    value: nextTokenBuffer,
                    type: TOKEN.OPERATOR_TYPE,
                    line: lineNumber,
                    col: lineIndex
                };
            case TOKEN.OPERATOR.SEMICOLON:
                nextChar();
                return {
                    value: nextTokenBuffer,
                    type: TOKEN.OPERATOR_TYPE,
                    line: lineNumber,
                    col: lineIndex
                };
            case TOKEN.OPERATOR.LT:
                nextChar();
                if (lexbuffer === "=")
                    return {
                        value: nextTokenBuffer,
                        type: TOKEN.OPERATOR_TYPE,
                        line: lineNumber,
                        col: lineIndex
                    };
                else return {
                    value: nextTokenBuffer,
                    type: TOKEN.OPERATOR_TYPE,
                    line: lineNumber,
                    col: lineIndex
                };
            case TOKEN.OPERATOR.GT:
                nextChar();
                if (lexbuffer === "=")
                    return {
                        value: nextTokenBuffer,
                        type: TOKEN.OPERATOR_TYPE,
                        line: lineNumber,
                        col: lineIndex
                    };
                else return {
                    value: nextTokenBuffer,
                    type: TOKEN.OPERATOR_TYPE,
                    line: lineNumber,
                    col: lineIndex
                };
            default:
                break;
        }
        console.log("Unknown token on line " + lineNumber + "\n");
        return "invalid";
    }
};