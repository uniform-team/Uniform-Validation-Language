describe("The \"parser\" module", function () {
	it("is exposed as an object", function () {
		expect(uniform.parser).toEqual(jasmine.any(Object));
	});
	var parser = uniform.parser;
	var lexer = uniform.lexer;
	describe("exposes the \"parse\" member", function () {
		it("as a function", function () {
			expect(parser.parse).toEqual(jasmine.any(Function));
		});
	});

	var testExpression = function (expr) {
		var returnScope = parser.parse("@test:" + expr + ";");
		return returnScope.symbolTable["test"].expression();
	};

	describe("evaluates expressions such as", function () {
		it("addition", function () {
			var token = testExpression("1+2");
			expect(token.value).toEqual(3);
			expect(token.type).toBe(lexer.TOKEN.TYPE.NUMBER);
		});
		it("subtraction", function () {
			var token = testExpression("3-1");
			expect(token.value).toEqual(2);
			expect(token.type).toBe(lexer.TOKEN.TYPE.NUMBER);
		});
		it("multiplication", function () {
			var token = testExpression("3*5");
			expect(token.value).toEqual(15);
			expect(token.type).toBe(lexer.TOKEN.TYPE.NUMBER);
		});
		it("division", function () {
			var token = testExpression("12/3");
			expect(token.value).toEqual(4);
			expect(token.type).toBe(lexer.TOKEN.TYPE.NUMBER);
		});
		it("modulo", function () {
			var token = testExpression("12%5");
			expect(token.value).toEqual(2);
			expect(token.type).toBe(lexer.TOKEN.TYPE.NUMBER);
		});
		it("modulo", function () {
			var token = testExpression("12%5");
			expect(token.value).toEqual(2);
			expect(token.type).toBe(lexer.TOKEN.TYPE.NUMBER);
		});
		it("negation", function () {
			var token = testExpression("-12");
			expect(token.value).toEqual(-12);
			expect(token.type).toBe(lexer.TOKEN.TYPE.NUMBER);
		});
		it("chained negation", function () {
			var token = testExpression("----12");
			expect(token.value).toEqual(12);
			expect(token.type).toBe(lexer.TOKEN.TYPE.NUMBER);
		});
		describe("is operator evaluates states such as", function () {
			it("is number true", function () {
				var token = testExpression("12 is number");
				expect(token.value).toEqual(true);
				expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
			});
			it("is number false", function () {
				var token = testExpression("\"a\" is number");
				expect(token.value).toEqual(false);
				expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
			});
			it("is string true", function () {
				var token = testExpression("\"a\" is string");
				expect(token.value).toEqual(true);
				expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
			});
			it("is string false", function () {
				var token = testExpression("1 is string");
				expect(token.value).toEqual(false);
				expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
			});
		});

		it("< true", function () {
			var token = testExpression("1 < 2");
			expect(token.value).toEqual(true);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it("< false", function () {
			var token = testExpression("2 < 1");
			expect(token.value).toEqual(false);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it("<= true", function () {
			var token = testExpression("1 <= 1");
			expect(token.value).toEqual(true);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it("<= false", function () {
			var token = testExpression("2 <= 1");
			expect(token.value).toEqual(false);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it("> true", function () {
			var token = testExpression("2 > 1");
			expect(token.value).toEqual(true);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it("> false", function () {
			var token = testExpression("1 > 2");
			expect(token.value).toEqual(false);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});

		it(">= true", function () {
			var token = testExpression("2 >= 2");
			expect(token.value).toEqual(true);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it(">= false", function () {
			var token = testExpression("2 >= 1");
			expect(token.value).toEqual(true);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});

		it("equals true", function () {
			var token = testExpression("2 equals 2");
			expect(token.value).toEqual(true);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it("equals false", function () {
			var token = testExpression("2 equals 5");
			expect(token.value).toEqual(false);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it("equals string true", function () {
			var token = testExpression("\"a\" equals \"a\"");
			expect(token.value).toEqual(true);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it("equals string false", function () {
			var token = testExpression("\"b\" equals \"a\"");
			expect(token.value).toEqual(false);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it("order of operations", function () {
			var token = testExpression("(1+2)*3/9");
			expect(token.value).toEqual(1);
			expect(token.type).toBe(lexer.TOKEN.TYPE.NUMBER);
		});
		it("matches true", function () {
			var token = testExpression("\"1231\" matches /\"^[0-9]+$\"/");
			expect(token.value).toEqual(true);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it("matches false", function () {
			var token = testExpression("\"1231a\" matches /\"^[0-9]+$\"/");
			expect(token.value).toEqual(false);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it("not true", function () {
			var token = testExpression("not false");
			expect(token.value).toEqual(true);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it("not false", function () {
			var token = testExpression("not true");
			expect(token.value).toEqual(false);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it("chained not", function () {
			var token = testExpression("not not not not true");
			expect(token.value).toEqual(true);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it("and true", function () {
			var token = testExpression("true and true and true");
			expect(token.value).toEqual(true);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it("and false", function () {
			var token = testExpression("true and true and false");
			expect(token.value).toEqual(false);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it("or true", function () {
			var token = testExpression("true or true or false");
			expect(token.value).toEqual(true);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		it("or false", function () {
			var token = testExpression("false or false or false");
			expect(token.value).toEqual(false);
			expect(token.type).toBe(lexer.TOKEN.TYPE.BOOL);
		});
		//TODO need to finish tag statements
	});
	//TODO variables
	//TODO selector states
});