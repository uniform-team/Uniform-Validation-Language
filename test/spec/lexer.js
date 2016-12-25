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
            
            it("with ending backslashes which do NOT escape the terminating slash", function () {
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
            
            it("with ending backslashes which do NOT escape the end quote", function () {
                assertToken(`"hello\\\\"`, `hello\\`, constants.TYPE.STRING);
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
            
            it("sequential single line comments", function () {
                assertToken("// comment\n// another comment\ntest", "test", constants.TYPE.IDENTIFIER);
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
            
            it("sequential multi-line comments", function () {
                assertToken("/* comment *//* another comment */test", "test", constants.TYPE.IDENTIFIER);
            });
            
            it("interspersed single-line and multi-line comments", function () {
                assertToken("// comment\n/* comment 2 */\n// comment 3\n/* comment 4 */test", "test", constants.TYPE.IDENTIFIER);
            });
        });

        describe("end-of-file on", function () {
            it("empty files", function () {
                assertToken("", constants.ENDOFFILE, constants.ENDOFFILE);
            });
            
            it("empty files with just whitespace", function () {
                assertToken("   ", constants.ENDOFFILE, constants.ENDOFFILE)
            });

            it("non-empty files", function () {
                const tokenize = tokenizer("test");
                
                tokenize(); // test identifier
                expect(tokenize()).toEqualToken({
                    value: constants.ENDOFFILE,
                    type: constants.ENDOFFILE
                });
            });
            
            it("non-empty files with trailing whitespace", function () {
                const tokenize = tokenizer("test   ");
                
                tokenize(); // test identifier
                expect(tokenize()).toEqualToken({
                    value: constants.ENDOFFILE,
                    type: constants.ENDOFFILE
                });
            });
            
            it("files with arbitrary non-token input", function () {
                const tokenize = tokenizer("  // comment1 \n /* comment2 */  ");
                
                expect(tokenize()).toEqualToken({
                    value: constants.ENDOFFILE,
                    type: constants.ENDOFFILE
                });
            });
        });

        describe("keywords like", function () {
            const assertKeyword = function (input, value) {
                assertToken(input, value, constants.TYPE.KEYWORD);
            };
            
            it("and", function () {
                assertKeyword("and", constants.OPERATOR.AND);
            });
            
            it("or", function () {
                assertKeyword("or", constants.OPERATOR.OR);
            });
            
            it("not", function () {
                assertKeyword("not", constants.OPERATOR.NOT);
            });
            
            it("matches", function () {
                assertKeyword("matches", constants.OPERATOR.MATCHES);
            });
            
            it("equals", function () {
                assertKeyword("equals", constants.OPERATOR.EQUALS);
            });
            
            it("valid", function () {
                assertKeyword("valid", constants.TAG.VALID);
            });
            
            it("enabled", function () {
                assertKeyword("enabled", constants.TAG.ENABLED);
            });
            
            it("visible", function () {
                assertKeyword("visible", constants.TAG.VISIBLE);
            });
            
            it("result", function () {
                assertKeyword("result", constants.TAG.RESULT);
            });

            it("selector", function () {
                assertKeyword("selector", constants.TAG.SELECTOR);
            });
            
            it("all", function () {
                assertKeyword("all", constants.OPERATOR.ALL);
            });
            
            it("any", function () {
                assertKeyword("any", constants.OPERATOR.ANY);
            });

            it("if", function () {
                assertKeyword("if", constants.OPERATOR.IF);
            });

            it("then", function () {
                assertKeyword("then", constants.OPERATOR.THEN);
            });
            
            it("elif", function () {
                assertKeyword("elif", constants.OPERATOR.ELIF);
            });

            it("else", function () {
                assertKeyword("else", constants.OPERATOR.ELSE);
            });

            it("end", function () {
                assertKeyword("end", constants.OPERATOR.END);
            });
            
            it("this", function () {
                assertKeyword("this", constants.THIS);
            });
        });
        
        describe("operators like", function () {
            const assertOperator = function (input, value) {
                assertToken(input, value, constants.TYPE.KEYWORD);
            };
            
            it("addition", function () {
                assertOperator("+", constants.OPERATOR.ADD);
            });
            
            it("subtraction", function () {
                assertOperator("-", constants.OPERATOR.SUB);
            });
            
            it("multiplication", function () {
                assertOperator("*", constants.OPERATOR.MUL);
            });
            
            it("division", function () {
                assertOperator("/", constants.OPERATOR.DIV);
            });
            
            it("modulus", function () {
                assertOperator("%", constants.OPERATOR.MOD);
            });
            
            it("less than", function () {
                assertOperator("<", constants.OPERATOR.LT);
            });
            
            it("greater than", function () {
                assertOperator(">", constants.OPERATOR.GT);
            });
            
            it("less than or equal to", function () {
                assertOperator("<=", constants.OPERATOR.LTE);
            });
            
            it("greater than or equal to", function () {
                assertOperator(">=", constants.OPERATOR.GTE);
            });
            
            it("colon", function () {
                assertOperator(":", constants.OPERATOR.COLON);
            });
            
            it("semicolon", function () {
                assertOperator(";", constants.OPERATOR.SEMICOLON);
            });
            
            it("left parenthesis", function () {
                assertOperator("(", constants.OPERATOR.LPAREN);
            });
            
            it("right parenthesis", function () {
                assertOperator(")", constants.OPERATOR.RPAREN);
            });
            
            it("left curly brace", function () {
                assertOperator("{", constants.OPERATOR.LBRACE);
            });
            
            it("right curly brace", function () {
                assertOperator("}", constants.OPERATOR.RBRACE);
            });
            
            it("dot", function () {
                assertOperator(".", constants.OPERATOR.DOT);
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