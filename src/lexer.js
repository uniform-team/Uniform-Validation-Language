import constants from "./constants.js";
import TokenClass from "./token.js";
import { SyntaxError as SyntaxErrorClass } from "./errors.js";
import { isWhitespace, isAlpha, isDigit, escape, canBeFollowedByRegex, isRegexFlag } from "./lexer-util.js";

export default function (input) {
	let lineNumber = 1;     //keeps track of current line number for error messages
	let lineIndex = 1;      //keeps track of the current index of the line for error messages
	let stringIndex = 0;    //the index of the string, lexbuffer contains the character at this index
	
	let lexbuffer = "";   //contains a single character to be analyzed
	let tokenBuffer = ""; //buffer that appends the lexbuffer until a token is built
    
    let hadNewlineBeforeLastToken = false;
    let expectNextRegex = false;
    let expectRegex = false;
	
	// Wrap the Token class with one which automatically inserts the current line number and index
	class Token extends TokenClass {
		constructor(value, type) {
			super(value, type, lineNumber, lineIndex);
		}
	}
	
	// Wrap the SyntaxError class with one which automatically inserts the current line number and index
	class SyntaxError extends SyntaxErrorClass {
		constructor(msgOrError) {
			super(msgOrError, lineNumber, lineIndex);
		}
	}
	
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
		if (stringIndex > input.length) throw new SyntaxError("Unexpected end of file.");
		lexbuffer = input.charAt(stringIndex);
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
            if (lexbuffer === "\n") {
                hadNewlineBeforeLastToken = true;
            }
            
			skipChar();
		}
	}
	
	// Create a tokenizer function and return it
	let tokenize = function () {
		try {
			tokenBuffer = "";
            hadNewlineBeforeLastToken = false;
            expectRegex = expectNextRegex; // Check if the current token is expected to be a RegEx
            expectNextRegex = false; // Assume next token is not a RegEx unless otherwise specified
			
			//When the end of the uniform file is reached, exit
			if (stringIndex >= input.length) {
				return new Token(constants.ENDOFFILE, constants.ENDOFFILE);
			}
			
			//set lexbuffer equal to the stringIndex
			lexbuffer = input.charAt(stringIndex);
			
			//ignore whitespace, move string index until non-whitespace character is found
			ignoreWhiteSpace();
			if (lexbuffer === "")
				return new Token(constants.ENDOFFILE, constants.ENDOFFILE);
			
			//if a / is encountered, it may be a single line comment, multi line comment, division operation, or a RegEx
			while (lexbuffer === "/") {
				skipChar(); // /
				
				//single line comment
				if (lexbuffer === "/") {
					while (lexbuffer !== "\n") {
						skipChar();
					}
					skipChar(); // \n
					ignoreWhiteSpace();
				} else if (lexbuffer === "*") { // multi-line comment
					skipChar(); // *
					while (true) {
						if (lexbuffer !== "*") {
							skipChar();
							continue;
						}
						
						skipChar(); // *
						if (lexbuffer === "/") {
							skipChar(); // /
							//end comment
							ignoreWhiteSpace();
							break;
						}
					}
				} else if (expectRegex) { // RegEx
					while (true) {
                        if (lexbuffer === "\n") { // Found raw newline, syntax error
                            throw new SyntaxError("Unterminated regular expression literal.");
                        }

                        // Handle escape sequence
                        if (lexbuffer === "\\") {
                            // Necessary to avoid detecting \/ as terminating the RegEx
                            readChar(); // \
                            if (lexbuffer === "\n") { // Found raw newline, syntax error
                                throw new SyntaxError("Unterminated regular expression literal.");
                            }
                            readChar(); // Character following \
                            continue;
                        }

                        // Not the end of the Regex, keep adding characters
                        if (lexbuffer !== "/") {
					        readChar();
					        continue;
                        }

                        // Found end of Regex expression
                        skipChar(); // /

                        // Tokenize Regex flags
                        let flags = "";
                        while (isRegexFlag(lexbuffer)) {
                            if (lexbuffer === constants.REGEX_FLAGS.MATCH_LINE) { // Require expression to match entire line
                                // Convert x UFM flag to JavaScript RegEx format by wrapping with ^...$
								if (!tokenBuffer.startsWith("^")) tokenBuffer = "^" + tokenBuffer;
                                if (!tokenBuffer.endsWith("$")) tokenBuffer += "$";
                            } else {
                                flags += lexbuffer;
                            }
                            skipChar();
                        }

                        return new Token(new RegExp(tokenBuffer, flags), constants.TYPE.REGEX);
					}
				} else { // Must be a division operator
					return new Token(constants.OPERATOR.DIV, constants.TYPE.KEYWORD);
				}
			}
			
			//check for operators, tags, and identifiers
			if (isAlpha.test(lexbuffer) || lexbuffer === "_") {
				// Read complete term
				do {
					readChar();
				} while (isAlpha.test(lexbuffer) || isDigit.test(lexbuffer) || lexbuffer === "_");
				
				// Check for keywords
                expectNextRegex = canBeFollowedByRegex(tokenBuffer);
				switch (tokenBuffer) {
					case constants.OPERATOR.AND:
						return new Token(constants.OPERATOR.AND, constants.TYPE.KEYWORD);
					case constants.OPERATOR.OR:
						return new Token(constants.OPERATOR.OR, constants.TYPE.KEYWORD);
					case constants.OPERATOR.NOT:
						return new Token(constants.OPERATOR.NOT, constants.TYPE.KEYWORD);
					case constants.OPERATOR.MATCHES:
						return new Token(constants.OPERATOR.MATCHES, constants.TYPE.KEYWORD);
					case constants.OPERATOR.EQUALS:
						return new Token(constants.OPERATOR.EQUALS, constants.TYPE.KEYWORD);
					case constants.TAG.VALID:
						return new Token(constants.TAG.VALID, constants.TYPE.KEYWORD);
					case constants.TAG.ENABLED:
						return new Token(constants.TAG.ENABLED, constants.TYPE.KEYWORD);
					case constants.TAG.VISIBLE:
						return new Token(constants.TAG.VISIBLE, constants.TYPE.KEYWORD);
					case constants.TAG.RESULT:
						return new Token(constants.TAG.RESULT, constants.TYPE.KEYWORD);
					case constants.TAG.SELECTOR:
						return new Token(constants.TAG.SELECTOR, constants.TYPE.KEYWORD);
					case constants.TYPE.STRING:
						return new Token(constants.TYPE.STRING, constants.TYPE.KEYWORD);
                    case constants.TYPE.NUMBER:
                        return new Token(constants.TYPE.NUMBER, constants.TYPE.KEYWORD);
                    case constants.TYPE.BOOL:
                        return new Token(constants.TYPE.BOOL, constants.TYPE.KEYWORD);
					case constants.VALUE.TRUE:
						return new Token(true, constants.TYPE.BOOL);
					case constants.VALUE.FALSE:
						return new Token(false, constants.TYPE.BOOL);
					case constants.OPERATOR.ALL:
						return new Token(constants.OPERATOR.ALL, constants.TYPE.KEYWORD);
					case constants.OPERATOR.ANY:
						return new Token(constants.OPERATOR.ANY, constants.TYPE.KEYWORD);
					case constants.OPERATOR.IF:
						return new Token(constants.OPERATOR.IF, constants.TYPE.KEYWORD);
					case constants.OPERATOR.THEN:
						return new Token(constants.OPERATOR.THEN, constants.TYPE.KEYWORD);
					case constants.OPERATOR.ELIF:
						return new Token(constants.OPERATOR.ELIF, constants.TYPE.KEYWORD);
					case constants.OPERATOR.ELSE:
						return new Token(constants.OPERATOR.ELSE, constants.TYPE.KEYWORD);
					case constants.OPERATOR.END:
						return new Token(constants.OPERATOR.END, constants.TYPE.KEYWORD);
					default:
						return new Token(tokenBuffer, constants.TYPE.IDENTIFIER);
				}
			}
			
			// Check for number
			if (isDigit.test(lexbuffer)) {
				do {
					readChar();
				} while (isDigit.test(lexbuffer));
				
				return new Token(parseInt(tokenBuffer), constants.TYPE.NUMBER);
			}
			
			// Check for variable
			if (lexbuffer === "@") {
				skipChar();
				while (isAlpha.test(lexbuffer) || isDigit.test(lexbuffer) || lexbuffer === "_")
					readChar();
				
				return new Token(tokenBuffer, constants.TYPE.VARIABLE);
			}
			
			// Check for string
			if (lexbuffer === "\"") {
				skipChar(); // "
				while (true) {
				    // Check for newline
                    if (lexbuffer === "\n") {
                        throw new SyntaxError("Unterminated string literal.");
                    }

				    // Escape sequences
				    if (lexbuffer === "\\") {
				        skipChar(); // \
				        tokenBuffer += escape("\\" + lexbuffer);
				        skipChar(); // Character following \
                        continue;
                    }

                    // Check for terminating quote
                    if (lexbuffer === "\"") {
				        skipChar(); // "
				        break;
                    }

                    // Normal character, add it to the buffer
                    readChar();
                }
				
				return new Token(tokenBuffer, constants.TYPE.STRING);
			}
			
			//check for non-alpha operators
			let token = lexbuffer;
			skipChar();
			expectNextRegex = canBeFollowedByRegex(token);
			switch (token) {
				case constants.OPERATOR.ADD:
					return new Token(constants.OPERATOR.ADD, constants.TYPE.KEYWORD);
				case constants.OPERATOR.SUB:
					return new Token(constants.OPERATOR.SUB, constants.TYPE.KEYWORD);
				case constants.OPERATOR.MUL:
					return new Token(constants.OPERATOR.MUL, constants.TYPE.KEYWORD);
				case constants.OPERATOR.DIV:
					return new Token(constants.OPERATOR.DIV, constants.TYPE.KEYWORD);
				case constants.OPERATOR.MOD:
					return new Token(constants.OPERATOR.MOD, constants.TYPE.KEYWORD);
				case constants.OPERATOR.LT:
					if (lexbuffer === "=") {
						skipChar();
						return new Token(constants.OPERATOR.LTE, constants.TYPE.KEYWORD);
					}
					else
						return new Token(constants.OPERATOR.LT, constants.TYPE.KEYWORD);
				case constants.OPERATOR.GT:
					if (lexbuffer === "=") {
						skipChar();
						return new Token(constants.OPERATOR.GTE, constants.TYPE.KEYWORD);
					}
					else
						return new Token(constants.OPERATOR.GT, constants.TYPE.KEYWORD);
				case constants.OPERATOR.COLON:
					return new Token(constants.OPERATOR.COLON, constants.TYPE.KEYWORD);
				case constants.OPERATOR.SEMICOLON:
					return new Token(constants.OPERATOR.SEMICOLON, constants.TYPE.KEYWORD);
				case constants.OPERATOR.LPAREN:
					return new Token(constants.OPERATOR.LPAREN, constants.TYPE.KEYWORD);
				case constants.OPERATOR.RPAREN:
					return new Token(constants.OPERATOR.RPAREN, constants.TYPE.KEYWORD);
				case constants.OPERATOR.LBRACE:
					return new Token(constants.OPERATOR.LBRACE, constants.TYPE.KEYWORD);
				case constants.OPERATOR.RBRACE:
					return new Token(constants.OPERATOR.RBRACE, constants.TYPE.KEYWORD);
				case constants.OPERATOR.DOT:
					return new Token(constants.OPERATOR.DOT, constants.TYPE.KEYWORD);
				default:
					break;
			}
			
			throw new SyntaxError("Unknown token, \"" + tokenBuffer + "\"");
		} catch (err) {
			throw new SyntaxError(err);
		}
	};
    
	// Expose function to check for newline
    tokenize.hadNewlineBeforeLastToken = function () {
        return hadNewlineBeforeLastToken;
    };
    
    // Testing hook to set whether the next token can be a RegEx
    tokenize._setExpectRegex = function (expect) {
        expectNextRegex = expect;
    };
    
    // Curry function which will return the next token each time it is invoked
    return tokenize;
};