describe("The \"evaluator\" module", function () {
    it("is exposed as an object", function () {
        expect(uniform.parser).toEqual(jasmine.any(Object));
    });
    var lexer = uniform.lexer;
    var parser = uniform.parser;
    var evaluator = uniform.evaluator;

    var numberType = lexer.TOKEN.TYPE.NUMBER;
    var boolType = lexer.TOKEN.TYPE.BOOL;
    var stringType = lexer.TOKEN.TYPE.STRING;
    var stateType = lexer.TOKEN.TYPE.STATE;
    var regexType = lexer.TOKEN.TYPE.REGEX;
    var selectorType = lexer.TOKEN.TYPE.SELECTOR;
    var ufmType = lexer.TOKEN.TYPE.UFM;

    var tokenize = function (expr, type) {
        return function () {
            return new lexer.Token(expr, type);
        };
    };
    describe("evaluates expressions such as", function () {
        it("addition", function () {
            var left = tokenize(122, numberType);
            var right = tokenize(344, numberType);
            var result = evaluator.add(left, right)();
            expect(result.value).toEqual(466);
            expect(result.type).toBe(lexer.TOKEN.TYPE.NUMBER);
        });
        it("subtraction", function () {
            var left = tokenize(344, numberType);
            var right = tokenize(122, numberType);
            var result = evaluator.sub(left, right)();
            expect(result.value).toEqual(222);
            expect(result.type).toBe(lexer.TOKEN.TYPE.NUMBER);
        });
        it("multiplication", function () {
            var left = tokenize(12, numberType);
            var right = tokenize(46, numberType);
            var result = evaluator.mul(left, right)();
            expect(result.value).toEqual(552);
            expect(result.type).toBe(lexer.TOKEN.TYPE.NUMBER);

        });
        it("division", function () {
            var left = tokenize(1005, numberType);
            var right = tokenize(5, numberType);
            var result = evaluator.div(left, right)();
            expect(result.value).toEqual(201);
            expect(result.type).toBe(lexer.TOKEN.TYPE.NUMBER);
        });
        it("modulo", function () {
            var left = tokenize(144, numberType);
            var right = tokenize(12, numberType);
            var result = evaluator.mod(left, right)();
            expect(result.value).toEqual(0);
            expect(result.type).toBe(lexer.TOKEN.TYPE.NUMBER);
        });
        it("modulo", function () {
            var left = tokenize(147, numberType);
            var right = tokenize(12, numberType);
            var result = evaluator.mod(left, right)();
            expect(result.value).toEqual(3);
            expect(result.type).toBe(lexer.TOKEN.TYPE.NUMBER);
        });
        it("negation", function () {
            var val = tokenize(12, numberType);
            var result = evaluator.neg(val)();
            expect(result.value).toEqual(-12);
            expect(result.type).toBe(lexer.TOKEN.TYPE.NUMBER);
        });
        it("chained negation", function () {
            var val = tokenize(-12, numberType);
            var result = evaluator.neg(val)();
            expect(result.value).toEqual(12);
            expect(result.type).toBe(lexer.TOKEN.TYPE.NUMBER);
        });
        describe("is operator evaluates states such as", function () {
            it("is number true", function () {
                var left = tokenize(12, numberType);
                var right = tokenize("number", stateType);
                var result = evaluator.is(left, right)();
                expect(result.value).toEqual(true);
                expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
            });
            it("is number false", function () {
                var left = tokenize("a", stringType);
                var right = tokenize("number", stateType);
                var result = evaluator.is(left, right)();
                expect(result.value).toEqual(false);
                expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
            });
            it("is string true", function () {
                var left = tokenize("a", stringType);
                var right = tokenize("string", stateType);
                var result = evaluator.is(left, right)();
                expect(result.value).toEqual(true);
                expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
            });
            it("is string false", function () {
                var left = tokenize(1, numberType);
                var right = tokenize("string", stateType);
                var result = evaluator.is(left, right)();
                expect(result.value).toEqual(false);
                expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
            });
            it("$selector is valid", function () {
                var left = tokenize("#sel", ufmType);
                var right = tokenize("valid", stateType);
                spyOn($, "attr").and.returnValue("true");
                var result = evaluator.is(left, right)();
                expect(result.value).toEqual(true);
                expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
            });
            it("$selector is enabled", function () {
                var left = tokenize("#sel", ufmType);
                var right = tokenize("enabled", stateType);
                spyOn($, "attr").and.returnValue("true");
                var result = evaluator.is(left, right)();
                expect(result.value).toEqual(true);
                expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
            });
            it("$selector is visible", function () {
                var left = tokenize("#sel", ufmType);
                var right = tokenize("visible", stateType);
                spyOn($, "attr").and.returnValue("true");
                var result = evaluator.is(left, right)();
                expect(result.value).toEqual(true);
                expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
            });
            it("$selector is valid", function () {
                var left = tokenize("#sel", ufmType);
                var right = tokenize("optional", stateType);
                spyOn($, "attr").and.returnValue("true");
                var result = evaluator.is(left, right)();
                expect(result.value).toEqual(true);
                expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
            });
        });
        it("< true", function () {
            var left = tokenize(1, numberType);
            var right = tokenize(2, numberType);
            var result = evaluator.lt(left, right)();
            expect(result.value).toEqual(true);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it("< false", function () {
            var left = tokenize(2, numberType);
            var right = tokenize(1, numberType);
            var result = evaluator.lt(left, right)();
            expect(result.value).toEqual(false);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it("<= true", function () {
            var left = tokenize(1, numberType);
            var right = tokenize(1, numberType);
            var result = evaluator.lte(left, right)();
            expect(result.value).toEqual(true);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it("<= false", function () {
            var left = tokenize(2, numberType);
            var right = tokenize(1, numberType);
            var result = evaluator.lte(left, right)();
            expect(result.value).toEqual(false);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it("> true", function () {
            var left = tokenize(2, numberType);
            var right = tokenize(1, numberType);
            var result = evaluator.gt(left, right)();
            expect(result.value).toEqual(true);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it("> false", function () {
            var left = tokenize(1, numberType);
            var right = tokenize(2, numberType);
            var result = evaluator.gt(left, right)();
            expect(result.value).toEqual(false);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it(">= true", function () {
            var left = tokenize(2, numberType);
            var right = tokenize(2, numberType);
            var result = evaluator.gte(left, right)();
            expect(result.value).toEqual(true);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it(">= false", function () {
            var left = tokenize(2, numberType);
            var right = tokenize(1, numberType);
            var result = evaluator.lt(left, right)();
            expect(result.value).toEqual(false);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it("equals true", function () {
            var left = tokenize(2, numberType);
            var right = tokenize(2, numberType);
            var result = evaluator.equals(left, right)();
            expect(result.value).toEqual(true);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it("equals false", function () {
            var left = tokenize(2, numberType);
            var right = tokenize(5, numberType);
            var result = evaluator.equals(left, right)();
            expect(result.value).toEqual(false);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it("equals string true", function () {
            var left = tokenize("a", stringType);
            var right = tokenize("a", stringType);
            var result = evaluator.equals(left, right)();
            expect(result.value).toEqual(true);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it("equals string false", function () {
            var left = tokenize("b", stringType);
            var right = tokenize("a", stringType);
            var result = evaluator.equals(left, right)();
            expect(result.value).toEqual(false);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it("matches true", function () {
            var left = tokenize("1231", stringType);
            var right = tokenize("^[0-9]+$", regexType);
            var result = evaluator.matches(left, right)();
            expect(result.value).toEqual(true);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it("matches false", function () {
            var left = tokenize("1231a", stringType);
            var right = tokenize("^[0-9]+$", regexType);
            var result = evaluator.matches(left, right)();
            expect(result.value).toEqual(false);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it("not true", function () {
            var val = tokenize(false, boolType);
            var result = evaluator.not(val)();
            expect(result.value).toEqual(true);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it("not false", function () {
            var val = tokenize(true, boolType);
            var result = evaluator.not(val)();
            expect(result.value).toEqual(false);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it("and true", function () {
            var left = tokenize(true, boolType);
            var right = tokenize(true, boolType);
            var result = evaluator.and(left, right)();
            expect(result.value).toEqual(true);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it("and false", function () {
            var left = tokenize(false, boolType);
            var right = tokenize(true, boolType);
            var result = evaluator.and(left, right)();
            expect(result.value).toEqual(false);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it("or true", function () {
            var left = tokenize(false, boolType);
            var right = tokenize(true, boolType);
            var result = evaluator.or(left, right)();
            expect(result.value).toEqual(true);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
        it("or false", function () {
            var left = tokenize(false, boolType);
            var right = tokenize(false, boolType);
            var result = evaluator.or(left, right)();
            expect(result.value).toEqual(false);
            expect(result.type).toBe(lexer.TOKEN.TYPE.BOOL);
        });
    });
});