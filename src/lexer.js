//Constants for lexical tokens
var TOKEN = {
    TYPE: {
        BOOL: "boolean",
        VARIABLE: "variable",
        NUMBER: "number",
        STRING: "string",
		IDENTIFIER: "identifier",
        SELECTOR: "selector",
        KEYWORD: "keyword",
        REGEX: "regex",
        STATE: "state",
        UFM: "ufm"
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
		COMMA: ",",
        SEMICOLON: ";",
        LT: "<",
        GT: ">",
        LTE: "<=",
        GTE: ">=",
        REGEX: "/",
        DOT: "."
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
	VALUE: {
		TRUE: "true",
		FALSE: "false"
	},
	THIS: "this",
    ENDOFFILE: "EOF"
};

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
    //Generates new token object
    Token: function (value, type, line, col) {
        if (value === undefined) throw new Error("Undefined Value in new Token");
        if (type === undefined) throw new Error("Undefined Type in new Token");
        this.value = value;
        this.type = type;
        this.line = line;
        this.col = col;
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
            return new this.Token(TOKEN.ENDOFFILE, TOKEN.ENDOFFILE, lineNumber, lineIndex);
        }

        //set lexbuffer equal to the stringIndex
        lexbuffer = inputString.charAt(stringIndex);

        //ignore whitespace, move string index until non-whitespace character is found
        ignoreWhiteSpace();

        //if a / is encountered, it may be a single line comment, multi line comment, division operation, or a regex
        while (lexbuffer === "/") {
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
                        skipChar();
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
                            return new this.Token(tokenBuffer, TOKEN.TYPE.REGEX, lineNumber, lineIndex);
                        }
                        else tokenBuffer += "\"";
                    }
                    else
                        readChar();
                }
            }
            else
                return new this.Token(TOKEN.OPERATOR.DIV, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
        }

        //check for operators, tags, selectors, and identifiers
        if (isAlpha.test(lexbuffer) || lexbuffer === "_" || lexbuffer === "$") {
            do {
                readChar();
            } while (isAlpha.test(lexbuffer) || isDigit.test(lexbuffer) || lexbuffer === "_" || lexbuffer === "$");

			//check for dom element
			if (tokenBuffer === "$") { // Must be a selector, because it should be followed by a ("...")
				tokenBuffer = ""; // Remove "$" from output
				if (lexbuffer !== "(") {
					throw new Error("Line " + lineNumber + ": Invalid token, Expected token of type: SELECTOR \n Recieved " + tokenBuffer);
				}

				skipChar();
				if (lexbuffer !== "\"") {
					throw new Error("Line " + lineNumber + ": Invalid token, Expected token of type: SELECTOR \n Recieved " + tokenBuffer);
				}

				skipChar();
				while (true) {
					if (lexbuffer !== "\"") {
						readChar();
					} else {
						skipChar();
						if (lexbuffer === ")") {
							skipChar();
							return new this.Token(tokenBuffer, TOKEN.TYPE.SELECTOR, lineNumber, lineIndex);
						} else {
							tokenBuffer += "\"";
						}
					}
				}
			}

            switch(tokenBuffer) {
                case TOKEN.OPERATOR.IS:
                    return new this.Token(TOKEN.OPERATOR.IS, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.OPERATOR.AND:
                    return new this.Token(TOKEN.OPERATOR.AND, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.OPERATOR.OR:
                    return new this.Token(TOKEN.OPERATOR.OR, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.OPERATOR.NOT:
                    return new this.Token(TOKEN.OPERATOR.NOT, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.OPERATOR.MATCHES:
                    return new this.Token(TOKEN.OPERATOR.MATCHES, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.OPERATOR.EQUALS:
                    return new this.Token(TOKEN.OPERATOR.EQUALS, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.TAG.VALID:
                    return new this.Token(TOKEN.TAG.VALID, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.TAG.ENABLED:
                    return new this.Token(TOKEN.TAG.ENABLED, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.TAG.VISIBLE:
                    return new this.Token(TOKEN.TAG.VISIBLE, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.TAG.OPTIONAL:
                    return new this.Token(TOKEN.TAG.OPTIONAL, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.STATE.STRING:
                    return new this.Token(TOKEN.STATE.STRING, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                case TOKEN.STATE.NUMBER:
                    return new this.Token(TOKEN.STATE.NUMBER, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
				case TOKEN.THIS:
					return new this.Token(TOKEN.THIS, TOKEN.TYPE.SELECTOR, lineNumber, lineIndex);
				case TOKEN.VALUE.TRUE:
					return new this.Token(true, TOKEN.TYPE.BOOL, lineNumber, lineIndex);
				case TOKEN.VALUE.FALSE:
					return new this.Token(false, TOKEN.TYPE.BOOL, lineNumber, lineIndex);
                default:
                    return new this.Token(tokenBuffer, TOKEN.TYPE.IDENTIFIER, lineNumber, lineIndex);
            }
        }

        //Check for number
        else if (isDigit.test(lexbuffer)) {
            do {
                readChar();
            } while (isDigit.test(lexbuffer));
            return new this.Token(tokenBuffer, TOKEN.TYPE.NUMBER, lineNumber, lineIndex);
        }

        //Check for variable
        else if (lexbuffer === "@") {
            skipChar();
            while (isAlpha.test(lexbuffer) || isDigit.test(lexbuffer) || lexbuffer === "_")
                readChar();
            return new this.Token(tokenBuffer, TOKEN.TYPE.VARIABLE, lineNumber, lineIndex);
        }

        //Check for string
        else if (lexbuffer === "\"") {
            skipChar();
            tokenBuffer = "";
            while (lexbuffer !== '\"') {
                readChar();
            }
            skipChar();
            return new this.Token(tokenBuffer, TOKEN.TYPE.STRING, lineNumber, lineIndex);
        }

        //check for non-alpha operators
		var token = lexbuffer;
		readChar();
        switch (token) {
            case TOKEN.OPERATOR.ADD:
                return new this.Token(TOKEN.OPERATOR.ADD, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.SUB:
                return new this.Token(TOKEN.OPERATOR.SUB, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.MUL:
                return new this.Token(TOKEN.OPERATOR.MUL, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.DIV:
                return new this.Token(TOKEN.OPERATOR.DIV, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.MOD:
                return new this.Token(TOKEN.OPERATOR.MOD, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.COLON:
                return new this.Token(TOKEN.OPERATOR.COLON, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.LBRACE:
                return new this.Token(TOKEN.OPERATOR.LBRACE, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.RBRACE:
                return new this.Token(TOKEN.OPERATOR.RBRACE, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.LPAREN:
                return new this.Token(TOKEN.OPERATOR.LPAREN, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.RPAREN:
                return new this.Token(TOKEN.OPERATOR.RPAREN, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
			case TOKEN.OPERATOR.COMMA:
				return new this.Token(TOKEN.OPERATOR.COMMA, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.SEMICOLON:
                return new this.Token(TOKEN.OPERATOR.SEMICOLON, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.LT:
                if (lexbuffer === "=") {
                    readChar();
                    return new this.Token(TOKEN.OPERATOR.LTE, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                }
                else
                    return new this.Token(TOKEN.OPERATOR.LT, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            case TOKEN.OPERATOR.GT:
                if (lexbuffer === "=") {
                    readChar();
                    return new this.Token(TOKEN.OPERATOR.GTE, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
                }
                else
                    return new this.Token(TOKEN.OPERATOR.GT, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
			case TOKEN.OPERATOR.DOT:
				return new this.Token(TOKEN.OPERATOR.DOT, TOKEN.TYPE.KEYWORD, lineNumber, lineIndex);
            default:
                break;
        }

		throw new Error("Line " + lineNumber + ": Unknown token, \"" + tokenBuffer + "\"");
    }
};