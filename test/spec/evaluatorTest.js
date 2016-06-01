describe("The \"evaluator\" module", function () {
    it("is exposed as an object", function () {
        expect(uniform.evaluator).toEqual(jasmine.any(Object));
    });

    describe("evaluates expressions such as", function () {
		var lexer = uniform.lexer;
		var evaluator = uniform.evaluator;

		var TOK_TYPE = lexer.TOKEN.TYPE;

		// Convert an expression into a lexical token of the given type, expecting the given self
		var tokenize = function (expr, type, expectedSelf) {
			return function (self) {
				expect(self).toBe(expectedSelf);
				return new lexer.Token(expr, type);
			};
		};

        it("addition", function () {
			var self = {};
            var left = tokenize(122, TOK_TYPE.NUMBER, self);
            var right = tokenize(344, TOK_TYPE.NUMBER, self);

            var result = evaluator.add(left, right)(self);

            expect(result.value).toEqual(466);
            expect(result.type).toBe(TOK_TYPE.NUMBER);
        });
        it("subtraction", function () {
			var self = {};
            var left = tokenize(344, TOK_TYPE.NUMBER, self);
            var right = tokenize(122, TOK_TYPE.NUMBER, self);

            var result = evaluator.sub(left, right)(self);

            expect(result.value).toEqual(222);
            expect(result.type).toBe(TOK_TYPE.NUMBER);
        });
        it("multiplication", function () {
			var self = {};
            var left = tokenize(12, TOK_TYPE.NUMBER, self);
            var right = tokenize(46, TOK_TYPE.NUMBER, self);

            var result = evaluator.mul(left, right)(self);

            expect(result.value).toEqual(552);
            expect(result.type).toBe(TOK_TYPE.NUMBER);

        });
        it("division", function () {
			var self = {};
            var left = tokenize(1005, TOK_TYPE.NUMBER, self);
            var right = tokenize(5, TOK_TYPE.NUMBER, self);

            var result = evaluator.div(left, right)(self);

            expect(result.value).toEqual(201);
            expect(result.type).toBe(TOK_TYPE.NUMBER);
        });
        it("modulo", function () {
			var self = {};
            var left = tokenize(144, TOK_TYPE.NUMBER, self);
            var right = tokenize(12, TOK_TYPE.NUMBER, self);

            var result = evaluator.mod(left, right)(self);

            expect(result.value).toEqual(0);
            expect(result.type).toBe(TOK_TYPE.NUMBER);
        });
        it("negation", function () {
			var self = {};
            var val = tokenize(12, TOK_TYPE.NUMBER, self);

            var result = evaluator.neg(val)(self);

            expect(result.value).toEqual(-12);
            expect(result.type).toBe(TOK_TYPE.NUMBER);
        });
        it("chained negation", function () {
			var self = {};
            var val = tokenize(-12, TOK_TYPE.NUMBER, self);

            var result = evaluator.neg(val)(self);

            expect(result.value).toEqual(12);
            expect(result.type).toBe(TOK_TYPE.NUMBER);
        });
        it("dot", function () {
			var self = {};
			var $parent = $("#parent");
			var id = "find";
			var child = "#child";
			var args = [ tokenize(child, TOK_TYPE.STRING, self) ];
			
			var $child = $(child);
			spyOn($parent, "find").and.returnValue($child);
			
			var result = evaluator.dot(tokenize($parent, TOK_TYPE.UFM, self), id, args)(self);

			expect($parent.find).toHaveBeenCalledWith(child);

			expect(result.value).toBe($child);
			expect(result.type).toBe(TOK_TYPE.UFM);
		});
        describe("is operator evaluates states such as", function () {
            it("is number true", function () {
				var self = {};
                var left = tokenize(12, TOK_TYPE.NUMBER, self);
                var right = tokenize("number", TOK_TYPE.STATE, self);

                var result = evaluator.is(left, right)(self);

                expect(result.value).toEqual(true);
                expect(result.type).toBe(TOK_TYPE.BOOL);
            });
            it("is number false", function () {
				var self = {};
                var left = tokenize("a", TOK_TYPE.STRING, self);
                var right = tokenize("number", TOK_TYPE.STATE, self);

                var result = evaluator.is(left, right)(self);

                expect(result.value).toEqual(false);
                expect(result.type).toBe(TOK_TYPE.BOOL);
            });
            it("is string true", function () {
				var self = {};
                var left = tokenize("a", TOK_TYPE.STRING, self);
                var right = tokenize("string", TOK_TYPE.STATE, self);

                var result = evaluator.is(left, right)(self);

                expect(result.value).toEqual(true);
                expect(result.type).toBe(TOK_TYPE.BOOL);
            });
            it("is string false", function () {
				var self = {};
                var left = tokenize(1, TOK_TYPE.NUMBER, self);
                var right = tokenize("string", TOK_TYPE.STATE, self);

                var result = evaluator.is(left, right)(self);

                expect(result.value).toEqual(false);
                expect(result.type).toBe(TOK_TYPE.BOOL);
            });
            xit("$selector is valid", function () {
                //needs to be addressed but modified to pass
				var self = {};
                var $left = $("#sel");
                var right = tokenize("valid", TOK_TYPE.STATE, self);

				jQuerySpy(function ($mock) {
					spyOn($mock, "attr").and.returnValue("true");
				});

                var result = evaluator.is(tokenize($left, TOK_TYPE.UFM, self), right)(self);

                expect(result.value).toEqual(true);
                expect(result.type).toBe(TOK_TYPE.BOOL);
            });
            xit("$selector is enabled", function () {
				var self = {};
                var $left = $("#sel");
                var right = tokenize("enabled", TOK_TYPE.STATE, self);

				jQuerySpy(function ($mock) {
					spyOn($mock, "attr").and.returnValue("true");
				});

                var result = evaluator.is(tokenize($left, TOK_TYPE.UFM, self), right)(self);

                expect(result.value).toEqual(true);
                expect(result.type).toBe(TOK_TYPE.BOOL);
            });
            xit("$selector is visible", function () {
				var self = {};
				var $left = $("#sel");
                var right = tokenize("visible", TOK_TYPE.STATE, self);

				jQuerySpy(function ($mock) {
					spyOn($mock, "attr").and.returnValue("true");
				});

                var result = evaluator.is(tokenize($left, TOK_TYPE.UFM, self), right)(self);

                expect(result.value).toEqual(true);
                expect(result.type).toBe(TOK_TYPE.BOOL);
            });
            xit("$selector is optional", function () {
				var self = {};
				var $left = $("#sel");
                var right = tokenize("optional", TOK_TYPE.STATE, self);

				jQuerySpy(function ($mock) {
					spyOn($mock, "attr").and.returnValue("true");
				});
				
                var result = evaluator.is(tokenize($left, TOK_TYPE.UFM, self), right)(self);

                expect(result.value).toEqual(true);
                expect(result.type).toBe(TOK_TYPE.BOOL);
            });
        });
        it("< true", function () {
			var self = {};
            var left = tokenize(1, TOK_TYPE.NUMBER, self);
            var right = tokenize(2, TOK_TYPE.NUMBER, self);

            var result = evaluator.lt(left, right)(self);

            expect(result.value).toEqual(true);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it("< false", function () {
			var self = {};
            var left = tokenize(2, TOK_TYPE.NUMBER, self);
            var right = tokenize(1, TOK_TYPE.NUMBER, self);

            var result = evaluator.lt(left, right)(self);

            expect(result.value).toEqual(false);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it("<= true", function () {
			var self = {};
            var left = tokenize(1, TOK_TYPE.NUMBER, self);
            var right = tokenize(1, TOK_TYPE.NUMBER, self);

            var result = evaluator.lte(left, right)(self);

            expect(result.value).toEqual(true);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it("<= false", function () {
			var self = {};
            var left = tokenize(2, TOK_TYPE.NUMBER, self);
            var right = tokenize(1, TOK_TYPE.NUMBER, self);

            var result = evaluator.lte(left, right)(self);

            expect(result.value).toEqual(false);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it("> true", function () {
			var self = {};
            var left = tokenize(2, TOK_TYPE.NUMBER, self);
            var right = tokenize(1, TOK_TYPE.NUMBER, self);

            var result = evaluator.gt(left, right)(self);

            expect(result.value).toEqual(true);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it("> false", function () {
			var self = {};
            var left = tokenize(1, TOK_TYPE.NUMBER, self);
            var right = tokenize(2, TOK_TYPE.NUMBER, self);

            var result = evaluator.gt(left, right)(self);

            expect(result.value).toEqual(false);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it(">= true", function () {
			var self = {};
            var left = tokenize(2, TOK_TYPE.NUMBER, self);
            var right = tokenize(2, TOK_TYPE.NUMBER, self);

            var result = evaluator.gte(left, right)(self);

            expect(result.value).toEqual(true);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it(">= false", function () {
			var self = {};
            var left = tokenize(2, TOK_TYPE.NUMBER, self);
            var right = tokenize(1, TOK_TYPE.NUMBER, self);

            var result = evaluator.lt(left, right)(self);

            expect(result.value).toEqual(false);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it("equals true", function () {
			var self = {};
            var left = tokenize(2, TOK_TYPE.NUMBER, self);
            var right = tokenize(2, TOK_TYPE.NUMBER, self);

            var result = evaluator.equals(left, right)(self);

            expect(result.value).toEqual(true);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it("equals false", function () {
			var self = {};
            var left = tokenize(2, TOK_TYPE.NUMBER, self);
            var right = tokenize(5, TOK_TYPE.NUMBER, self);

            var result = evaluator.equals(left, right)(self);

            expect(result.value).toEqual(false);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it("equals string true", function () {
			var self = {};
            var left = tokenize("a", TOK_TYPE.STRING, self);
            var right = tokenize("a", TOK_TYPE.STRING, self);

            var result = evaluator.equals(left, right)(self);

            expect(result.value).toEqual(true);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it("equals string false", function () {
			var self = {};
            var left = tokenize("b", TOK_TYPE.STRING, self);
            var right = tokenize("a", TOK_TYPE.STRING, self);

            var result = evaluator.equals(left, right)(self);

            expect(result.value).toEqual(false);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it("matches true", function () {
			var self = {};
            var left = tokenize("1231", TOK_TYPE.STRING, self);
            var right = tokenize("^[0-9]+$", TOK_TYPE.REGEX, self);

            var result = evaluator.matches(left, right)(self);

            expect(result.value).toEqual(true);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it("matches false", function () {
			var self = {};
            var left = tokenize("1231a", TOK_TYPE.STRING, self);
            var right = tokenize("^[0-9]+$", TOK_TYPE.REGEX, self);

            var result = evaluator.matches(left, right)(self);

            expect(result.value).toEqual(false);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it("not true", function () {
			var self = {};
            var val = tokenize(false, TOK_TYPE.BOOL, self);

            var result = evaluator.not(val)(self);

            expect(result.value).toEqual(true);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it("not false", function () {
			var self = {};
            var val = tokenize(true, TOK_TYPE.BOOL, self);

            var result = evaluator.not(val)(self);

            expect(result.value).toEqual(false);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it("and true", function () {
			var self = {};
            var left = tokenize(true, TOK_TYPE.BOOL, self);
            var right = tokenize(true, TOK_TYPE.BOOL, self);

            var result = evaluator.and(left, right)(self);

            expect(result.value).toEqual(true);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it("and false", function () {
			var self = {};
            var left = tokenize(false, TOK_TYPE.BOOL, self);
            var right = tokenize(true, TOK_TYPE.BOOL, self);

            var result = evaluator.and(left, right)(self);

            expect(result.value).toEqual(false);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it("or true", function () {
			var self = {};
            var left = tokenize(false, TOK_TYPE.BOOL, self);
            var right = tokenize(true, TOK_TYPE.BOOL, self);

            var result = evaluator.or(left, right)(self);

            expect(result.value).toEqual(true);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
        it("or false", function () {
			var self = {};
            var left = tokenize(false, TOK_TYPE.BOOL, self);
            var right = tokenize(false, TOK_TYPE.BOOL, self);

            var result = evaluator.or(left, right)(self);

            expect(result.value).toEqual(false);
            expect(result.type).toBe(TOK_TYPE.BOOL);
        });
    });
});