import tokenizer from "../../src.es5/lexer.js";

import constants from "../../src.es5/constants.js";
import { SyntaxError } from "../../src.es5/errors.js";

describe("The lexer module", function () {
	const assertToken = function (input, value, type, isRegex = false) {
		const tokenize = tokenizer(input);
        tokenize._setExpectRegex(isRegex);
		const token = tokenize();

		expect(token).toEqualToken({ value, type });
	};
	
	describe("tokenizes inputs such as", function () {
		it("identifiers", function () {
			assertToken("test", "test", constants.TYPE.IDENTIFIER);
		});
		
		it("variables", function () {
			assertToken("@test", "test", constants.TYPE.VARIABLE);
		});
		
		it("numbers", function () {
			assertToken("123", 123, constants.TYPE.NUMBER);
		});

		describe("regular expressions", function () {
		    const assertRegex = function (input, value) {
		        assertToken(input, value, constants.TYPE.REGEX, true); // Assume isRegex
            };

		    it("with only normal characters", function () {
                assertRegex("/test/", /test/);
		    });

		    it("with escaped characters", function () {
                assertRegex(`/hello\\nworld\\/test/`, /hello\nworld\/test/);
		    });

		    it("with ending backslashes", function () {
                assertRegex(`/test\\\\/`, /test\\/);
		    });
		    
		    describe("with flags", function () {
		        it("such as ignore-case (i)", function () {
		            assertRegex(`/test/i`, /test/i);
		        });
		        
		        it("such as multi-line (m)", function () {
		            assertRegex(`/test/m`, /test/m);
		        });
		        
		        it("such as match-line (x)", function () {
		            assertRegex(`/test/x`, /^test$/);
		        });
		        
		        it("such as ignore-case and multi-line (order-independent)", function () {
		            assertRegex(`/test/im`, /test/im);
		            assertRegex(`/test/mi`, /test/mi);
		        });
		        
		        it("such as ignore-case and match-line (order-independent)", function () {
		            assertRegex(`/test/ix`, /^test$/i);
		            assertRegex(`/test/xi`, /^test$/i);
		        });
		        
		        it("such as multi-line and match-line (order-independent)", function () {
		            assertRegex(`/test/mx`, /^test$/m);
		            assertRegex(`/test/xm`, /^test$/m);
		        });
		        
		        it("such as all the flags (order-independent)", function () {
		            assertRegex(`/test/mxi`, /^test$/mi);
                    assertRegex(`/chex/mix`, /^chex$/mi);
                    assertRegex(`/test/xmi`, /^test$/mi);
                    assertRegex(`/test/xim`, /^test$/mi);
                    assertRegex(`/test/imx`, /^test$/mi);
                    assertRegex(`/test/ixm`, /^test$/mi);
		        });
		    });
		    
		    it("treating unknown flags as following identifiers", function () {
		        const tokenize = tokenizer(`/test/a`);
		        tokenize._setExpectRegex(true);
		        
		        expect(tokenize()).toEqualToken({
		            value: /test/,
                    type: constants.TYPE.REGEX
                });
		        
		        expect(tokenize()).toEqualToken({
		            value: "a",
                    type: constants.TYPE.IDENTIFIER
                });
		    });
		});

		describe("strings", function () {
            it("with only normal characters", function () {
                assertToken(`"test"`, "test", constants.TYPE.STRING);
            });

            it("with escaped characters", function () {
                assertToken(`"hello\\nworld\\"test"`, `hello\nworld"test`, constants.TYPE.STRING);
            });
		});
		
		it("true literal", function () {
			assertToken("true", true, constants.TYPE.BOOL);
		});
		
		it("false literal", function () {
			assertToken("false", false, constants.TYPE.BOOL);
		});

		describe("comments like ", function () {
			it("single-line comments", function () {
				assertToken("// comment\ntest", "test", constants.TYPE.IDENTIFIER);
			});

			it("multi-line comments", function () {
				assertToken("/* comment */test", "test", constants.TYPE.IDENTIFIER);
			});

			it("multi-line comments with new lines", function () {
				assertToken("/* comment\n \n more comment \n */test", "test", constants.TYPE.IDENTIFIER);
			});

			it("tricky multi-line comments", function () {
				assertToken("/* ****** comment\n //should be comment still /*\n more comment \n */test", "test", constants.TYPE.IDENTIFIER);
			});
		});


		describe("end-of-file on", function () {
			it("empty files", function () {
				assertToken("", constants.ENDOFFILE, constants.ENDOFFILE);
			});

			it("on full programs", function () {
				let testStr = "@variable: \"test\";";
				let tokenize = tokenizer(testStr);
				let i = 0;
				let token = tokenize();
				while (token.value != constants.ENDOFFILE) {
					token = tokenize();
					i = i + 1;
					if (i > 6)
						break;
				}
				expect(token.value).toEqual(constants.ENDOFFILE);
				expect(token.type).toBe(constants.ENDOFFILE);

			});
		});

		describe("keywords like", function () {
			it("and", function () {
				assertToken("and", constants.OPERATOR.AND, constants.TYPE.KEYWORD);
			});
			
			it("or", function () {
				assertToken("or", constants.OPERATOR.OR, constants.TYPE.KEYWORD);
			});
			
			it("not", function () {
				assertToken("not", constants.OPERATOR.NOT, constants.TYPE.KEYWORD);
			});
			
			it("matches", function () {
				assertToken("matches", constants.OPERATOR.MATCHES, constants.TYPE.KEYWORD);
			});
			
			it("equals", function () {
				assertToken("equals", constants.OPERATOR.EQUALS, constants.TYPE.KEYWORD);
			});
			
			it("valid", function () {
				assertToken("valid", constants.TAG.VALID, constants.TYPE.KEYWORD);
			});
			
			it("enabled", function () {
				assertToken("enabled", constants.TAG.ENABLED, constants.TYPE.KEYWORD);
			});
			
			it("visible", function () {
				assertToken("visible", constants.TAG.VISIBLE, constants.TYPE.KEYWORD);
			});
			
			it("result", function () {
				assertToken("result", constants.TAG.RESULT, constants.TYPE.KEYWORD);
			});

			it("selector", function () {
				assertToken("selector", constants.TAG.SELECTOR, constants.TYPE.KEYWORD);
			});

			it("string", function () {
				assertToken("string", constants.TYPE.STRING, constants.TYPE.KEYWORD);
			});
			
			it("boolean", function () {
			    assertToken("boolean", constants.TYPE.BOOL, constants.TYPE.KEYWORD);
			});
			
			it("number", function () {
				assertToken("number", constants.TYPE.NUMBER, constants.TYPE.KEYWORD);
			});
			
			it("all", function () {
				assertToken("all", constants.OPERATOR.ALL, constants.TYPE.KEYWORD);
			});
			
			it("any", function () {
				assertToken("any", constants.OPERATOR.ANY, constants.TYPE.KEYWORD);
			});

			it("if", function () {
				assertToken("if", constants.OPERATOR.IF, constants.TYPE.KEYWORD);
			});

			it("then", function () {
			    assertToken("then", constants.OPERATOR.THEN, constants.TYPE.KEYWORD);
			});
			
			it("elif", function () {
			    assertToken("elif", constants.OPERATOR.ELIF, constants.TYPE.KEYWORD);
			});

			it("else", function () {
				assertToken("else", constants.OPERATOR.ELSE, constants.TYPE.KEYWORD);
			});

			it("end", function () {
				assertToken("end", constants.OPERATOR.END, constants.TYPE.KEYWORD);
			});
		});
		
		describe("operators like", function () {
			it("addition", function () {
				assertToken("+", constants.OPERATOR.ADD, constants.TYPE.KEYWORD);
			});
			
			it("subtraction", function () {
				assertToken("-", constants.OPERATOR.SUB, constants.TYPE.KEYWORD);
			});
			
			it("multiplication", function () {
				assertToken("*", constants.OPERATOR.MUL, constants.TYPE.KEYWORD);
			});
			
			it("division", function () {
				assertToken("/", constants.OPERATOR.DIV, constants.TYPE.KEYWORD);
			});
			
			it("modulus", function () {
				assertToken("%", constants.OPERATOR.MOD, constants.TYPE.KEYWORD);
			});
			
			it("less than", function () {
				assertToken("<", constants.OPERATOR.LT, constants.TYPE.KEYWORD);
			});
			
			it("greater than", function () {
				assertToken(">", constants.OPERATOR.GT, constants.TYPE.KEYWORD);
			});
			
			it("less than or equal to", function () {
				assertToken("<=", constants.OPERATOR.LTE, constants.TYPE.KEYWORD);
			});
			
			it("greater than or equal to", function () {
				assertToken(">=", constants.OPERATOR.GTE, constants.TYPE.KEYWORD);
			});
			
			it("colon", function () {
				assertToken(":", constants.OPERATOR.COLON, constants.TYPE.KEYWORD);
			});
			
			it("semicolon", function () {
				assertToken(";", constants.OPERATOR.SEMICOLON, constants.TYPE.KEYWORD);
			});
			
			it("left parenthesis", function () {
				assertToken("(", constants.OPERATOR.LPAREN, constants.TYPE.KEYWORD);
			});
			
			it("right parenthesis", function () {
				assertToken(")", constants.OPERATOR.RPAREN, constants.TYPE.KEYWORD);
			});
			
			it("left curly brace", function () {
				assertToken("{", constants.OPERATOR.LBRACE, constants.TYPE.KEYWORD);
			});
			
			it("right curly brace", function () {
				assertToken("}", constants.OPERATOR.RBRACE, constants.TYPE.KEYWORD);
			});
			
			it("dot", function () {
				assertToken(".", constants.OPERATOR.DOT, constants.TYPE.KEYWORD);
			});
		});
	});
	
	describe("throws errors on bad inputs such as", function () {
        const assertUfmError = function (input, ErrorType, isRegex = true) {
            const tokenize = tokenizer(input);
            tokenize._setExpectRegex(isRegex);
            expect(tokenize).toThrowUfmError(ErrorType);
        };
        
		describe("malformed strings", function () {
		    it("containing raw newline characters", function () {
                assertUfmError(`"test\n"`, SyntaxError);
		    });
		    
		    it("containing escaped raw newline characters", function () {
		        assertUfmError(`"test\\\n"`, SyntaxError);
		    });
            
		    it("which do not end", function () {
                assertUfmError(`"test`, SyntaxError);
		    });
        });
		
		describe("malformed regular expressions", function () {
		    const assertRegexUfmError = function (input, ErrorType) {
		        assertUfmError(input, ErrorType, true);
            };
		    
		    it("containing raw newline characters", function () {
                assertRegexUfmError(`/test\n/`, SyntaxError);
		    });
            
		    it("containing escaped raw newline characters", function () {
		        assertRegexUfmError(`/test\\\n/`, SyntaxError);
		    });
		    
		    it("which do not end", function () {
                assertRegexUfmError(`/test`, SyntaxError);
		    });
		});
	});
    
    describe("exposes the \"hadNewlineBeforeLastToken\" member", function () {
        it("as a function", function () {
            expect(tokenizer().hadNewlineBeforeLastToken).toEqual(jasmine.any(Function));
        });
        
        it("which returns false if no token has yet been parsed", function () {
            let tokenize = tokenizer("test");
            expect(tokenize.hadNewlineBeforeLastToken()).toBe(false);
        });
        
        it("which returns true if the last token returned had a newline before the previous token", function () {
            let tokenize = tokenizer("else \n if");
            tokenize(); // else
            tokenize(); // if
            expect(tokenize.hadNewlineBeforeLastToken()).toBe(true);
        });
        
        it("which returns false if the last token returned did not have a newline before the previous token", function () {
            let tokenize = tokenizer("else if");
            tokenize(); // else
            tokenize(); // if
            expect(tokenize.hadNewlineBeforeLastToken()).toBe(false);
        });
    });
});