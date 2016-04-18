var scope = uniform.scope;

describe("The \"scope\" module", function () {
    it("is exposed as an object", function () {
        expect(scope).toEqual(jasmine.any(Object));
    });

    it("can open new scopes, insert new ones, and look them up", function () {
        scope.createScope("", function () {
            var testScope = new scope.Symbol("test", "true", scope.KIND.VARIABLE);
            scope.insert(testScope);
            expect(scope.lookup("test")).toEqual(testScope);
        });
    });
    it("can close scopes, removing the innermost scope", function () {
        scope.createScope("", function () {
            var testScope = new scope.Symbol("test", "true", scope.KIND.VARIABLE);
            scope.insert(testScope);
        });
        expect(scope.lookup("test")).toEqual(null);
    });
    it("exposes isDefined, which will return null if symbol does not exist in symbol table and true if it does", function () {
        scope.createScope("", function () {
            var testScope = new scope.Symbol("test", "true", scope.KIND.VARIABLE);
            scope.insert(testScope);
            expect(scope.isDefined("test")).toEqual(true);
        });
        expect(scope.isDefined("test")).toEqual(false);
    });
});