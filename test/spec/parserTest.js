describe("The \"parser\" module", function () {
	it("is exposed as an object", function () {
		expect(uniform.parser).toEqual(jasmine.any(Object));
	});
	var parser = uniform.parser;
	var lexer = uniform.lexer;
	var evaluator = uniform.evaluator;


	describe("exposes the \"parse\" member", function () {
		it("as a function", function () {
			expect(parser.parse).toEqual(jasmine.any(Function));
		});
	});

	describe("Is able to parse expressions such as", function () {
		it("and", function () {
			spyOn(evaluator, "and").and.callFake(function (left, right) {
				expect(left().value).toBe(true);
				expect(right().value).toBe(false);
			});
			parser.parse("@test: true and false;");
		});
		it("or", function () {
			spyOn(evaluator, "or").and.callFake(function (left, right) {
				expect(left().value).toBe(true);
				expect(right().value).toBe(false);
			});
			parser.parse("@test: true and false;");
		});
		it("not", function () {
			spyOn(evaluator, "not").and.callFake(function (input) {
				expect(input().value).toBe(false);
			});
			parser.parse("@test: not false;");
		});
		it("lt", function () {
			spyOn(evaluator, "lt").and.callFake(function (left, right) {
				expect(left().value).toBe(1);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 1 < 2;");
		});
		it("gt", function () {
			spyOn(evaluator, "gt").and.callFake(function (left, right) {
				expect(left().value).toBe(1);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 1 > 2;");
		});
		it("lte", function () {
			spyOn(evaluator, "lte").and.callFake(function (left, right) {
				expect(left().value).toBe(1);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 1 <= 2;");
		});
		it("gte", function () {
			spyOn(evaluator, "gte").and.callFake(function (left, right) {
				expect(left().value).toBe(1);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 1 > 2;");
		});
		it("equals", function () {
			spyOn(evaluator, "equals").and.callFake(function (left, right) {
				expect(left().value).toBe(1);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 1 equals 2;");
		});
		it("matches", function () {
			spyOn(evaluator, "lt").and.callFake(function (left, right) {
				expect(left().value).toBe(1);
				expect(right().value).toBe(".");
			});
			parser.parse("@test: 1 matches /\".\"/;");
		});
		it("is", function () {
			spyOn(evaluator, "is").and.callFake(function (left, right) {
				expect(left().value).toBe(5);
				expect(right().value).toBe("number");
			});
			parser.parse("@test: 5 is number;");
		});
		it("add", function () {
			spyOn(evaluator, "add").and.callFake(function (left, right) {
				expect(left().value).toBe(3);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 3 + 2;");
		});
		it("sub", function () {
			spyOn(evaluator, "sub").and.callFake(function (left, right) {
				expect(left().value).toBe(3);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 3 - 2;");
		});
		it("mul", function () {
			spyOn(evaluator, "mul").and.callFake(function (left, right) {
				expect(left().value).toBe(3);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 3 * 2;");
		});
		it("div", function () {
			spyOn(evaluator, "div").and.callFake(function (left, right) {
				expect(left().value).toBe(3);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 3 / 2;");
		});
		it("mod", function () {
			spyOn(evaluator, "mod").and.callFake(function (left, right) {
				expect(left().value).toBe(3);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 3 % 2;");
		});
		it("neg", function () {
			spyOn(evaluator, "neg").and.callFake(function (input) {
				expect(input().value).toBe(2);
			});
			parser.parse("@test: -2;");
		});
	});

	describe("Is able to parse these valid blocks", function () {
		it("parses variables", function () {
			var parseString = "@var: true;";
			expect(function () {
				parser.parse(parseString);
			}).not.toThrow();
		});
		it("parses selector blocks", function () {
			var parseString = "#selector {valid: true;}";
			expect(function () {
				parser.parse(parseString);
			}).not.toThrow();
		});
	});
});