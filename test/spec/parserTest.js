describe("The \"parser\" module", function () {
	it("is exposed as an object", function () {
		expect(uniform.parser).toEqual(jasmine.any(Object));
	});

	var parser = uniform.parser;
	var evaluator = uniform.evaluator;

	it("exposes the \"parse\" member as a function", function () {
		expect(parser.parse).toEqual(jasmine.any(Function));
	});

	describe("is able to parse expressions such as", function () {
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
		describe("dot", function () {
			it("with no arguments", function () {
				spyOn(evaluator, "dot").and.callFake(function (expr, id, args) {
					expect(expr().value).$toEqual($("#child"));
					expect(id).toBe("parent");

					expect(args.length).toBe(0);
				});
				parser.parse("@test: $(\"#child\").parent();");
			});

			it("with arguments", function () {
				spyOn(evaluator, "dot").and.callFake(function (expr, id, args) {
					expect(expr().value).$toEqual($("#parent"));
					expect(id).toBe("find");

					expect(args.length).toBe(1);
					expect(args[0]().value).toBe("#child");
				});
				parser.parse("@test: $(\"#parent\").find(\"#child\");");
			});
		});
	});

	describe("is able to parse valid Uniform scripts such as", function () {
		it("variables", function () {
			var parseString = "@var: true;";
			expect(function () {
				parser.parse(parseString);
			}).not.toThrow();
		});
		it("selector blocks", function () {
			var parseString = "$(\"#selector\") {valid: true;}";
			expect(function () {
				parser.parse(parseString);
			}).not.toThrow();
		});
	});
});