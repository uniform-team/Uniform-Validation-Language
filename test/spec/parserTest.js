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
			expect(evaluator.and).toHaveBeenCalled()
		});
		it("or", function () {
			spyOn(evaluator, "or").and.callFake(function (left, right) {
				expect(left().value).toBe(true);
				expect(right().value).toBe(false);
			});
			parser.parse("@test: true or false;");
			expect(evaluator.or).toHaveBeenCalled()
		});
		it("not", function () {
			spyOn(evaluator, "not").and.callFake(function (input) {
				expect(input().value).toBe(false);
			});
			parser.parse("@test: not false;");
			expect(evaluator.not).toHaveBeenCalled()
		});
		it("lt", function () {
			spyOn(evaluator, "lt").and.callFake(function (left, right) {
				expect(left().value).toBe(1);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 1 < 2;");
			expect(evaluator.lt).toHaveBeenCalled()
		});
		it("gt", function () {
			spyOn(evaluator, "gt").and.callFake(function (left, right) {
				expect(left().value).toBe(1);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 1 > 2;");
			expect(evaluator.gt).toHaveBeenCalled()
		});
		it("lte", function () {
			spyOn(evaluator, "lte").and.callFake(function (left, right) {
				expect(left().value).toBe(1);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 1 <= 2;");
			expect(evaluator.lte).toHaveBeenCalled()
		});
		it("gte", function () {
			spyOn(evaluator, "gte").and.callFake(function (left, right) {
				expect(left().value).toBe(1);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 1 >= 2;");
			expect(evaluator.gte).toHaveBeenCalled()
		});
		it("equals", function () {
			spyOn(evaluator, "equals").and.callFake(function (left, right) {
				expect(left().value).toBe(1);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 1 equals 2;");
			expect(evaluator.equals).toHaveBeenCalled()
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
			expect(evaluator.is).toHaveBeenCalled()
		});
		it("add", function () {
			spyOn(evaluator, "add").and.callFake(function (left, right) {
				expect(left().value).toBe(3);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 3 + 2;");
			expect(evaluator.add).toHaveBeenCalled()
		});
		it("sub", function () {
			spyOn(evaluator, "sub").and.callFake(function (left, right) {
				expect(left().value).toBe(3);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 3 - 2;");
			expect(evaluator.sub).toHaveBeenCalled()
		});
		it("mul", function () {
			spyOn(evaluator, "mul").and.callFake(function (left, right) {
				expect(left().value).toBe(3);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 3 * 2;");
			expect(evaluator.mul).toHaveBeenCalled()
		});
		it("div", function () {
			spyOn(evaluator, "div").and.callFake(function (left, right) {
				expect(left().value).toBe(3);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 3 / 2;");
			expect(evaluator.div).toHaveBeenCalled()
		});
		it("mod", function () {
			spyOn(evaluator, "mod").and.callFake(function (left, right) {
				expect(left().value).toBe(3);
				expect(right().value).toBe(2);
			});
			parser.parse("@test: 3 % 2;");
			expect(evaluator.mod).toHaveBeenCalled()
		});
		it("neg", function () {
			spyOn(evaluator, "neg").and.callFake(function (input) {
				expect(input().value).toBe(2);
			});
			parser.parse("@test: -2;");
			expect(evaluator.neg).toHaveBeenCalled()
		});
		describe("dot", function () {
			it("with no arguments", function () {
				spyOn(evaluator, "dot").and.callFake(function (expr, id, args) {
					expect(expr().value).$toEqual($("#child"));
					expect(id).toBe("parent");

					expect(args.length).toBe(0);
				});
				parser.parse("@test: $(\"#child\").parent();");
				expect(evaluator.dot).toHaveBeenCalled()
			});

			it("with arguments", function () {
				spyOn(evaluator, "dot").and.callFake(function (expr, id, args) {
					expect(expr().value).$toEqual($("#parent"));
					expect(id).toBe("find");

					expect(args.length).toBe(1);
					expect(args[0]().value).toBe("#child");
				});
				parser.parse("@test: $(\"#parent\").find(\"#child\");");
				expect(evaluator.dot).toHaveBeenCalled()
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
		it("returns valid scope tree", function () {
			var scope = parser.parse("@var: true;");
			expect(scope.variableTable["var"].expression().value).toBe(true);
		});
	});
});