describe("The Scope class", function () {
    let uniform = window.uniform;

    it ("is exposed globally", function() {
        expect(uniform.Scope).toEqual(jasmine.any(Function));
    });
    
    let { Scope, Variable, Tag, Identifier, Token, constants } = uniform;
    let { DuplicateDeclarationError } = uniform.errors;
    
    it("constructs while setting the parent scope to the current scope", function () {
    	let parentScope = {};
        spyOn(Scope, "thisScope").and.returnValue(parentScope);
        
        expect(new Scope().parentScope).toBe(parentScope);
    });
    
    describe("exposes the \"thisScope\" member", function () {
    	it("as a static function", function () {
    		expect(Scope.thisScope).toEqual(jasmine.any(Function));
    	});
        
        it("which returns the current scope", function () {
        	let scope = {};
        	Scope._currentScope = scope;
            
            expect(Scope.thisScope()).toBe(scope);
        });
    });
    
    describe("exposes the \"reset\" member", function () {
    	it("as a static function", function () {
    		expect(Scope.reset).toEqual(jasmine.any(Function));
    	});
        
        it("which clears the scope hierarchy", function () {
        	Scope._currentScope = { };
        	
        	Scope.reset();
            
            expect(Scope._currentScope).toBeNull();
        });
    });
    
    describe("exposes the \"push\" member", function () {
    	it("as a function", function () {
    		expect(Scope.prototype.push).toEqual(jasmine.any(Function));
    	});
        
        it("which pushes the current scope onto the stack to set it as the current scope", function () {
            expect(Scope.thisScope()).toBeNull();
            
            let firstScope = new Scope();
            firstScope.push(function () {
        	    expect(Scope.thisScope()).toBe(firstScope);
                
                let secondScope = new Scope();
                secondScope.push(function () {
                    expect(Scope.thisScope()).toBe(secondScope);
                });
                
                expect(Scope.thisScope()).toBe(firstScope);
            });
            
            expect(Scope.thisScope()).toBeNull();
            
            expect(expectationCount()).toBe(5);
        });
    });

    describe("exposes the \"insert\" member", function () {
        it("as a function", function () {
        	expect(Scope.prototype.insert).toEqual(jasmine.any(Function));
        });
        
        it("which inserts a variable", function () {
            let testVar = new Variable("test", 1, 2);
            
            let scope = new Scope();
            scope.insert(testVar);
            
            expect(scope.variables["test"]).toBe(testVar);
        });
        
        it("which inserts a variable shadowing one belonging to a parent with the same name", function () {
        	let testVar = new Variable("test", 1, 2);
            let testVar2 = new Variable("test", 3, 4);
            
            let scope = new Scope();
            scope.insert(testVar);
            scope.push(function () {
                let scope2 = new Scope();
                expect(() => scope2.insert(testVar2)).not.toThrow();
            });
            
            expect(expectationCount()).toBe(1);
        });
        
        it("throws an error on duplicate insertions", function () {
            let testVar = new Variable("test", 1, 2);
            let testVar2 = new Variable("test", 3, 4);
            
            let scope = new Scope();
            scope.insert(testVar);
            
            expect(() => scope.insert(testVar2)).toThrowUfmError(DuplicateDeclarationError);
        });
    });

    describe("exposes the \"findVar\" member", function () {
        it("as a function", function () {
        	expect(Scope.prototype.findVar).toEqual(jasmine.any(Function));
        });
        
        it("which returns the variable if found", function () {
            let testVar = new Variable("test", 1, 2);
            
            let scope = new Scope();
            scope.variables["test"] = testVar;
            
            expect(scope.findVar("test")).toBe(testVar);
        });
        
        it("which returns null if not found", function () {
            expect(new Scope().findVar("test")).toBeNull();
        });
    });

    describe("exposes the \"findTag\" member", function () {
        it("as a function", function () {
            expect(Scope.prototype.findTag).toEqual(jasmine.any(Function));
        });
        
        it("which returns the tag if found", function () {
            let testTag = new Tag("valid", null, 1, 2);
            
            let scope = new Scope();
            scope.tags["valid"] = testTag;
            
            expect(scope.findTag("valid")).toBe(testTag);
        });
        
        it("which returns null if not found", function () {
            expect(new Scope().findTag("valid")).toBeNull();
        });
    });
    
    describe("exposes the \"findIdentifier\" member", function () {
        it("as a function", function () {
            expect(Scope.prototype.findIdentifier).toEqual(jasmine.any(Function));
        });
        
        it("which returns the identifier if found", function () {
            let testIdentifier = new Identifier("test", 1, 2);
            let scope = new Scope();
            
            scope.identifiers["test"] = testIdentifier;
            expect(scope.findIdentifier("test")).toBe(testIdentifier);
        });
        
        it("which returns null if not found", function () {
            expect(new Scope().findIdentifier("test")).toBeNull();
        });
    });
    
    describe("exposes the \"lookupVar\" member", function () {
        it("as a function", function () {
            expect(Scope.prototype.lookupVar).toEqual(jasmine.any(Function));
        });
        
        it("returns the variable in the parent hierarchy", function () {
            let testVar = new Variable("test", 1, 2);
            let scope = new Scope();
            scope.insert(testVar);
            
            scope.push(function () {
                expect(new Scope().lookupVar("test")).toBe(testVar);
            });
        });
        
        it("returns null if not found in this scope or parent scopes", function () {
            let scope = new Scope();
            
            scope.push(function () {
                expect(new Scope().lookupVar("test")).toBeNull();
            });
        });
    });

    describe("exposes the \"lookupTag\" member", function () {
        it("as a function", function () {
            expect(Scope.prototype.lookupTag).toEqual(jasmine.any(Function));
        });
        
        it("returns the tag in the parent hierarchy", function () {
            let tag = new Tag(new Token("valid", constants.TYPE.KEYWORD, 1, 2), () => null);
            let scope = new Scope();
            scope.insert(tag);
            
            scope.push(function () {
                expect(new Scope().lookupTag("valid")).toBe(tag);
            });
        });
        
        it("returns null if not found in this scope or parent scopes", function () {
            let scope = new Scope();
            
            scope.push(function () {
                expect(new Scope().lookupTag("valid")).toBeNull();
            });
        });
    });
});