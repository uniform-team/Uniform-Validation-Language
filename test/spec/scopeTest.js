var scope = uniform.parser._scope;

describe("The \"scope\" module should", function () {
    it("Open new scopes, insert new ones, and look them up", function () {
        scope.createScope("", function () {
            var testScope = new scope.Symbol("test", "true", scope.KIND.VARIABLE);
            scope.insert(testScope);
            expect(scope.lookup("test")).toEqual(testScope);
        });
    });
    it("Close scopes removing the innermost scope", function () {
        scope.createScope("", function () {
            var testScope = new scope.Symbol("test", "true", scope.KIND.VARIABLE);
            scope.insert(testScope);
        });
        expect(scope.lookup("test")).toEqual(null);
    });
    it("isDefined will return null if symbol does not exist in symbol table and true if it does", function () {
        scope.createScope("", function () {
            var testScope = new scope.Symbol("test", "true", scope.KIND.VARIABLE);
            scope.insert(testScope);
            expect(scope.isDefined("test")).toEqual(true);
        });
        expect(scope.isDefined("test")).toEqual(false);
    });
});