describe("The parser module", function () {
	let uniform = window.uniform;
	
	it("is exposed globally", function () {
		expect(uniform.parser).toEqual(jasmine.any(Object));
	});
	
	let parser = uniform.parser;
	let constants = uniform.constants;
	let ParsingError = uniform.errors.ParsingError;
	let parseExpr = function (expr) {
		parser.parse("valid: " + expr + ";");
	};
	
	describe("parses valid inputs such as", function () {
		it("identifier blocks", function () {
			expect(() => parser.parse("test { }")).not.toThrow();
		});
		
		it("variable blocks", function () {
			expect(() => parser.parse("@test { }")).not.toThrow();
		});
		
		it("nested blocks", function () {
			expect(() => parser.parse("test1 { test2 { } }")).not.toThrow();
		});
		
		it("tag statements", function () {
			expect(() => parser.parse("valid: true;")).not.toThrow();
		});
		
		it("variable statements", function () {
			expect(() => parser.parse("@test: true;")).not.toThrow();
		});
		
		it("empty file", function () {
			expect(() => parser.parse("")).not.toThrow();
		});
	});
	
	describe("parses valid expressions", function () {
		beforeAll(function () {
			parser._testExpr = true;
		});
		
		afterAll(function () {
			parser._testExpr = false;
		});
		
		describe("with boolean operators such as", function () {
			it("and", function () {
				expect(parser.parse("true and false")()).toEqualToken({
					value: false,
					type: constants.TYPE.BOOL
				});
			});
			
			it("or", function () {
				expect(parser.parse("true or false")()).toEqualToken({
					value: true,
					type: constants.TYPE.BOOL
				});
			});
			
			it("not", function () {
				expect(parser.parse("not true")()).toEqualToken({
					value: false,
					type: constants.TYPE.BOOL
				});
			});
			
			it("chained not", function () {
				expect(parser.parse("not not not not true")()).toEqualToken({
					value: true,
					type: constants.TYPE.BOOL
				});
			});
		});
		
		describe("with comparison operators such as", function () {
			it("equals", function () {
				expect(parser.parse("true equals true")()).toEqualToken({
					value: true,
					type: constants.TYPE.BOOL
				});
			});
			
			it("matches", function () {
				expect(parser.parse("\"test\" matches /\"test\"/")()).toEqualToken({
					value: true,
					type: constants.TYPE.BOOL
				});
			});
			
			it("is", function () {
				expect(parser.parse("\"test\" is string")()).toEqualToken({
					value: true,
					type: constants.TYPE.BOOL
				});
			});
			
			it("<", function () {
				expect(parser.parse("1 < 1")()).toEqualToken({
					value: false,
					type: constants.TYPE.BOOL
				});
			});
			
			it(">", function () {
				expect(parser.parse("1 > 1")()).toEqualToken({
					value: false,
					type: constants.TYPE.BOOL
				});
			});
			
			it("<=", function () {
				expect(parser.parse("1 <= 1")()).toEqualToken({
					value: true,
					type: constants.TYPE.BOOL
				});
			});
			
			it(">=", function () {
				expect(parser.parse("1 >= 1")()).toEqualToken({
					value: true,
					type: constants.TYPE.BOOL
				});
			});
		});
		
		describe("with arithmetic operators such as", function () {
			it("addition", function () {
				expect(parser.parse("1 + 1")()).toEqualToken({
					value: 2,
					type: constants.TYPE.NUMBER
				});
			});
			
			it("subtraction", function () {
				expect(parser.parse("1 - 1")()).toEqualToken({
					value: 0,
					type: constants.TYPE.NUMBER
				});
			});
			
			it("multiplication", function () {
				expect(parser.parse("2 * 3")()).toEqualToken({
					value: 6,
					type: constants.TYPE.NUMBER
				});
			});
			
			it("division", function () {
				expect(parser.parse("6 / 3")()).toEqualToken({
					value: 2,
					type: constants.TYPE.NUMBER
				});
			});
			
			it("modulo", function () {
				expect(parser.parse("7 % 3")()).toEqualToken({
					value: 1,
					type: constants.TYPE.NUMBER
				});
			});
			
			it("negation", function () {
				expect(parser.parse("- 1")()).toEqualToken({
					value: -1,
					type: constants.TYPE.NUMBER
				});
			});
			
			it("chained negation", function () {
				expect(parser.parse("- - - - 1")()).toEqualToken({
					value: 1,
					type: constants.TYPE.NUMBER
				});
			});
		});
		
		describe("with miscellaneous operators such as", function () {
			it("any", function () {
				expect(parser.parse("any @array")).not.toThrow();
			});
			
			it("all", function () {
				expect(parser.parse("all @array")).not.toThrow();
			});
			
			it("dot", function () {
				expect(parser.parse("{ foo: \"bar\"; }.foo")()).toEqualToken({
					value: "bar",
					type: constants.TYPE.STRING
				});
			});
			
			it("paren", function () {
				expect(parser.parse("( true )")()).toEqualToken({
					value: true,
					type: constants.TYPE.BOOL
				});
			});
		});
		
		describe("with operands such as", function () {
			it("identifiers", function () {
				expect(parser.parse("test")()).toEqualToken({
					value: "test",
					type: constants.TYPE.IDENTIFIER
				});
			});
			
			it("booleans", function () {
				expect(parser.parse("true")()).toEqualToken({
					value: true,
					type: constants.TYPE.BOOL
				});
				
				expect(parser.parse("false")()).toEqualToken({
					value: false,
					type: constants.TYPE.BOOL
				});
			});
			
			it("numbers", function () {
				expect(parser.parse("1")()).toEqualToken({
					value: 1,
						type: constants.TYPE.NUMBER
				});
			});
			
			it("strings", function () {
				expect(parser.parse("\"test\"")()).toEqualToken({
					value: "test",
					type: constants.TYPE.STRING
				});
			});
			
			it("regular expressions", function () {
				expect(parser.parse("/\"test\"/")()).toEqualToken({
					value: /test/,
					type: constants.TYPE.REGEX
				});
			});
			
			it("variables", function () {
				expect(parser.parse("@test")()).toEqualToken({
					value: "test",
					type: constants.TYPE.VARIABLE
				});
			});
			
			it("selectors", function () {
				expect(parser.parse("$(\"test\")")()).toEqualToken({
					value: "test",
					type: constants.TYPE.SELECTOR
				});
			});
			
			it("states", function () {
				expect(parser.parse("string")()).toEqualToken({
					value: "string",
					type: constants.TYPE.KEYWORD
				});
				
				expect(parser.parse("number")()).toEqualToken({
					value: "number",
					type: constants.TYPE.KEYWORD
				});
			});
			
			it("this keyword", function () {
				expect(parser.parse("this")()).toEqualToken({
					value: "this",
					type: constants.TYPE.SELECTOR
				});
			});
			
			describe("objects", function () {
				it("with no key-value pairs", function () {
					expect(parser.parse("{ }")()).toEqualToken({
						value: { },
						type: constants.TYPE.OBJECT
					});
				});
				
				it("with a single key-value pair", function () {
					let token = parser.parse("{ test: true; }")();
					let { value, type } = token;
					expect(type).toBe(constants.TYPE.OBJECT);
					
					let expr = value.test;
					expect(expr()).toEqualToken({
						value: true,
						type: constants.TYPE.BOOL
					});
				});
				
				it("with multiple key-value pairs", function () {
					let token = parser.parse("{ test: true; test2: false; }")();
					let { value, type } = token;
					expect(type).toBe(constants.TYPE.OBJECT);
					
					let expr1 = value.test;
					expect(expr1()).toEqualToken({
						value: true,
						type: constants.TYPE.BOOL
					});
					
					let expr2 = value.test2;
					expect(expr2()).toEqualToken({
						value: false,
						type: constants.TYPE.BOOL
					});
				});
				
				it("with nested objects", function () {
					let token = parser.parse("{ test: { foo: \"bar\"; }; }")();
					let { value, type } = token;
					expect(type).toBe(constants.TYPE.OBJECT);
					
					let expr = value.test;
					let innerObjToken = expr();
					expect(innerObjToken.type).toBe(constants.TYPE.OBJECT);
					
					let innerExpr = innerObjToken.value.foo;
					expect(innerExpr()).toEqualToken({
						value: "bar",
						type: constants.TYPE.STRING
					});
				});
			});
		});
	});
	
	describe("throws an error when given invalid expressions such as", function () {
		it("following a block with a non-block and non-statement", function () {
			expect(() => parser.parse("test { } true")).toThrowUfmError(ParsingError);
		});
		
		it("using a non-block and non-statement as a block or statement", function () {
			expect(() => parser.parse("true")).toThrowUfmError(ParsingError);
		});
		
		it("following a variable (when in block) with a non-block and non-statement", function () {
			expect(() => parser.parse("@test;")).toThrowUfmError(ParsingError);
		});
		
		it("chaining and / all", function () {
			expect(() => parseExpr("any all @array")).toThrowUfmError(ParsingError);
		});
		
		it("using a non-operand as an operand", function () {
			expect(() => parseExpr("any :")).toThrowUfmError(ParsingError);
		});
	});
});