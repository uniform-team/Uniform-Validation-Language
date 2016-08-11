describe("The Scope class", function () {
    let uniform = window.uniform;

    it ("is exposed globally", function() {
        expect(uniform.Scope).toEqual(jasmine.any(Function));
    });

    let Scope = uniform.Scope;
    let Variable = uniform.Variable;
    let Tag = uniform.Tag;
	let Identifier = uniform.Identifier;
    let DuplicateDeclarationError = uniform.errors.DuplicateDeclarationError;

    it("creates new scopes with inheriting parent scopes", function () {
        let childScope = null;
        let innerScope = null;
		Scope.reset();
        let parentScope = new Scope(function (myScope) {
            innerScope = myScope;
            childScope = new Scope();
        });
        expect(innerScope).toBe(parentScope);
        expect(parentScope.parentScope).toBeNull();
        expect(childScope.parentScope).toBe(parentScope);
    });

    describe("exposes the insert member", function () {
        it("which inserts a variable", function () {
            new Scope(function (scope) {
            	let testVar = new Variable("test", 1, 2);
                scope.insert(testVar);
                expect(scope.variables["test"]).toBe(testVar);
            });
        });
        it("throws an error on duplicate insertions", function () {
            let testVar = new Variable("test", 1, 2);
            let testVar2 = new Variable("test", 3, 4);
            new Scope(function (scope) {
                scope.insert(testVar);
                expect(() => scope.insert(testVar2)).toThrowUfmError(DuplicateDeclarationError);
            });
        });
    });

    describe("exposes the findVar member", function () {
        it("which returns the variable if found", function () {
            new Scope(function (scope) {
                let testVar = new Variable("test", 1, 2);
                scope.variables["test"] = testVar;
                expect(scope.findVar("test")).toBe(testVar);
            });
        });
        it("which returns null if not found", function () {
            new Scope(function (scope) {
                expect(scope.findVar("test")).toBeNull();
            });
        });
    });

    describe("exposes the findTag member", function () {
        it("which returns the tag if found", function () {
            new Scope(function (scope) {
                let testTag = new Tag("valid", null, 1, 2);
                scope.tags["valid"] = testTag;
                expect(scope.findTag("valid")).toBe(testTag);
            });
        });
        it("which returns null if not found", function () {
            new Scope(function (scope) {
                expect(scope.findTag("valid")).toBeNull();
            });
        });
    });
    
    describe("exposes the findIdentifier member", function () {
        it("which returns the identifier if found", function () {
            new Scope(function (scope) {
                let testIdentifier = new Identifier("test", 1, 2);
                scope.identifiers["test"] = testIdentifier;
                expect(scope.findIdentifier("test")).toBe(testIdentifier);
            });
        });
        it("which returns null if not found", function () {
            new Scope(function (scope) {
                expect(scope.findIdentifier("test")).toBeNull();
            });
        });
    });
    
    describe("exposes the lookupVar member", function () {
        it("returns the variable in the parent hierarchy", function () {
            new Scope(function (myScope) {
                let testVar = new Variable("test", 1, 2);
                myScope.insert(testVar);
                let childScope = new Scope();
                expect(childScope.lookupVar("test")).toBe(testVar);
            });
        });
        it("returns null if not found in this scope or parent scopes", function () {
            new Scope(function () {
                let childScope = new Scope();
                expect(childScope.lookupVar("test")).toBeNull();
            });
        });
    });

    describe("exposes the lookupTag member", function () {
        it("returns the tag in the parent hierarchy", function () {
            new Scope(function (myScope) {
                let testTag = new Tag("valid", null, 1, 2);
                myScope.insert(testTag);
                let childScope = new Scope();
                expect(childScope.lookupTag("valid")).toBe(testTag);
            });
        });
        it("returns null if not found in this scope or parent scopes", function () {
            new Scope(function () {
                let childScope = new Scope();
                expect(childScope.lookupTag("valid")).toBeNull();
            });
        });
    });
});