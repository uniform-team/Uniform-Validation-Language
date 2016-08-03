describe("The lexer module", function () {
	it("is exposed globally", function () {
		expect(uniform.tokenizer).toBeDefined();
	});
	
	var assertToken = function (input, value, type) {
		var tokenize = tokenizer(input);
		var token = tokenize();
		
		expect(token.value).toEqual(value);
		expect(token.type).toBe(type);
	};
	
	var tokenizer = uniform.tokenizer;
	var constants = uniform.constants;
	
	describe("tokenizes inputs such as", function () {
		it("identifiers", function () {
			assertToken("test", "test", constants.TYPE.IDENTIFIER);
		});
		
		it("variables", function () {
			assertToken("@test", "test", constants.TYPE.VARIABLE);
		});
		
		it("selectors", function () {
			assertToken("$(\"#test\")", "#test", constants.TYPE.SELECTOR);
		});
		
		it("numbers", function () {
			assertToken("123", 123, constants.TYPE.NUMBER);
		});
		
		it("regular expressions", function () {
			assertToken("/\"test\"/", /test/, constants.TYPE.REGEX);
		});
		
		it("strings", function () {
			assertToken("\"test\"", "test", constants.TYPE.STRING);
		});
		
		it("true literal", function () {
			assertToken("true", true, constants.TYPE.BOOL);
		});
		
		it("false literal", function () {
			assertToken("false", false, constants.TYPE.BOOL);
		});
		
		it("single-line comments", function () {
			assertToken("// comment\ntest", "test", constants.TYPE.IDENTIFIER);
		});
		
		it("multi-line comments", function () {
			assertToken("/* comment */test", "test", constants.TYPE.IDENTIFIER);
		});
		
		it("end-of-file", function () {
			assertToken("", constants.ENDOFFILE, constants.ENDOFFILE);
		});
		
		describe("keywords like", function () {
			it("is", function () {
				assertToken("is", constants.OPERATOR.IS, constants.TYPE.KEYWORD);
			});
			
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
			
			it("return", function () {
				assertToken("return", constants.TAG.RETURN, constants.TYPE.KEYWORD);
			});
			
			it("string", function () {
				assertToken("string", constants.STATE.STRING, constants.TYPE.KEYWORD);
			});
			
			it("number", function () {
				assertToken("number", constants.STATE.NUMBER, constants.TYPE.KEYWORD);
			});
			
			it("this", function () {
				assertToken("this", constants.THIS, constants.TYPE.SELECTOR);
			});
			
			it("all", function () {
				assertToken("all", constants.OPERATOR.ALL, constants.TYPE.KEYWORD);
			});
			
			it("any", function () {
				assertToken("any", constants.OPERATOR.ANY, constants.TYPE.KEYWORD);
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
			
			it("comma", function () {
				assertToken(",", constants.OPERATOR.COMMA, constants.TYPE.KEYWORD);
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
		var assertError = function (input) {
			var tokenize = tokenizer(input);
			expect(tokenize).toThrow();
		};
		
		describe("malformed selector", function () {
			it("from a missing open parenthesis", function () {
				assertError("$test");
			});
			
			it("from a missing open quote", function () {
				assertError("$(test)");
			});
			
			it("from a missing close quote", function () {
				assertError("$(\"test)");
			});
			
			it("from a missing close parenthesis", function () {
				assertError("$(\"test\"");
			});
		});
		
		it("malformed string", function () {
			assertError("\"test");
		});
		
		describe("malformed regular expression", function () {
			it("from a missing close quote", function () {
				assertError("/\"test");
			});
			
			it("from a missing close slash", function () {
				assertError("/\"test\"");
			});
		});
	});
});