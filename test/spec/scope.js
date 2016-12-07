import Scope from "../../src.es5/scope.js";

import constants from "../../src.es5/constants.js";
import Token from "../../src.es5/token.js";
import { BlockVariable, ExpressionVariable } from "../../src.es5/variable.js";
import Tag from "../../src.es5/tag.js";
import Identifier from "../../src.es5/identifier.js";
import { UndeclaredError, DuplicateDeclarationError } from "../../src.es5/errors.js";

describe("The Scope class", function () {
    it("constructs with the given owner while setting the parent scope to the current scope", function () {
    	Scope._currentScope = {};
        
    	const owner = {};
    	
    	const scope = new Scope(owner);
    	
    	expect(scope.owner).toBe(owner);
        expect(scope.parentScope).toBe(Scope._currentScope);
    });
    
    beforeEach(function () {
        Scope.reset();
    });
    
    describe("exposes the static \"thisScope\" property", function () {
    	describe("with a getter", function () {
            it("defined as a function", function () {
                expect(Scope).toHaveGetter("thisScope");
            });
        
            it("which returns the current scope", function () {
                let scope = { };
                Scope._currentScope = scope;
            
                expect(Scope.thisScope).toBe(scope);
            });
    	});
        
        it("withOUT a setter", function () {
        	expect(Scope).not.toHaveSetter("thisScope");
        });
    });
    
    describe("exposes the static \"rootScope\" property", function () {
    	describe("with a getter", function () {
    		it("defined as a function", function () {
    			expect(Scope).toHaveGetter("rootScope");
    		});
            
            it("which returns the root scope", function () {
            	let scope = { };
            	Scope._rootScope = scope;
                
                expect(Scope.rootScope).toBe(scope);
            });
    	});
        
        it("withOUT a setter", function () {
        	expect(Scope).not.toHaveSetter("rootScope");
        });
    });
    
    describe("exposes the \"init\" member", function () {
    	it("as a static function", function () {
            expect(Scope.init).toEqual(jasmine.any(Function));
    	});
        
        it("which initializes the Scope class by resetting it", function () {
        	spyOn(Scope, "reset");
            
            Scope.init();
            
            expect(Scope.reset).toHaveBeenCalled();
        });
    });
    
    describe("exposes the \"reset\" member", function () {
    	it("as a static function", function () {
    		expect(Scope.reset).toEqual(jasmine.any(Function));
    	});
        
        it("which clears the scope hierarchy", function () {
            let scope = {};
            let ScopeClass = {
                prototype: {
                    constructor: jasmine.createSpy("Scope").and.returnValue(scope)
                }
            };
            
            Scope._rootScope = { };
            Scope._currentScope = { };
        	
        	Scope.reset.apply(ScopeClass);
            
            expect(Scope._rootScope).toBe(scope);
            expect(Scope._currentScope).toBe(scope);
        });
    });
    
    describe("exposes the \"push\" member", function () {
    	it("as a function", function () {
    		expect(Scope.prototype.push).toEqual(jasmine.any(Function));
    	});
        
        it("which pushes the current scope onto the stack to set it as the current scope", function () {
            let baseScope = { };
            Scope._currentScope = baseScope;
            
            let firstScope = new Scope();
            firstScope.push(function () {
        	    expect(Scope._currentScope).toBe(firstScope);
                
                let secondScope = new Scope();
                secondScope.push(function () {
                    expect(Scope._currentScope).toBe(secondScope);
                });
                
                expect(Scope._currentScope).toBe(firstScope);
            });
            
            expect(Scope._currentScope).toBe(baseScope);
            
            expect(jasmineUtil.expectationCount).toBe(4);
        });
    });

    describe("exposes the \"insert\" member", function () {
        it("as a function", function () {
        	expect(Scope.prototype.insert).toEqual(jasmine.any(Function));
        });
        
        it("which inserts a variable", function () {
            let testVar = new ExpressionVariable(new Token("test", constants.TYPE.VARIABLE, 1, 2));
            
            let scope = new Scope();
            scope.insert(testVar);
            
            expect(scope.variables["test"]).toBe(testVar);
        });
        
        it("which inserts a variable shadowing one belonging to a parent with the same name", function () {
        	let testVar = new ExpressionVariable(new Token("test", constants.TYPE.VARIABLE, 1, 2));
            let testVar2 = new ExpressionVariable(new Token("test", constants.TYPE.VARIABLE, 3, 4));
            
            let scope = new Scope();
            scope.insert(testVar);
            scope.push(function () {
                let scope2 = new Scope();
                expect(() => scope2.insert(testVar2)).not.toThrow();
            });
            
            expect(jasmineUtil.expectationCount).toBe(1);
        });
        
        it("throws an error on duplicate insertions", function () {
            let testVar = new ExpressionVariable(new Token("test", constants.TYPE.VARIABLE, 1, 2));
            let testVar2 = new ExpressionVariable(new Token("test", constants.TYPE.VARIABLE, 3, 4));
            
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
            let testVar = new ExpressionVariable(new Token("test", constants.TYPE.VARIABLE, 1, 2));
            
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
            let testIdentifier = new Identifier(new Token("test", constants.TYPE.IDENTIFIER), constants.TYPE.STRING);
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
            let testVar = new ExpressionVariable(new Token("test", constants.TYPE.VARIABLE, 1, 2));
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

    describe("exposes the \"getOrInferSelector\" member", function () {
        it("as a function", function () {
            expect(Scope.prototype.getOrInferSelector).toEqual(jasmine.any(Function));
        });

        it("which returns the token result on a well-defined selector tag", function () {
            const selectorToken = new Token("#selector", constants.TYPE.STRING);
            const selectorTag = { value: selectorToken };

            spyOn(Scope.prototype, "findTag").and.returnValue(selectorTag);

            expect(new Scope().getOrInferSelector()).toBe(selectorToken);
        });

        it("which throws a TypeError on an explicitly defined selector tag with an invalid type", function () {
            const selectorToken = new Token(true, constants.TYPE.BOOL);
            const selectorTag = { value: selectorToken };

            spyOn(Scope.prototype, "findTag").and.returnValue(selectorTag);

            expect(() => new Scope().getOrInferSelector()).toThrowUfmError(TypeError);
        });

        it("which infers a selector from this Scope's owner when not explicitly defined", function () {
            const name = "myIdentifier";
            const identifier = new Identifier(new Token(name, constants.TYPE.IDENTIFIER), constants.TYPE.STRING);

            spyOn(Scope.prototype, "findTag").and.returnValue(null);

            expect(new Scope(identifier).getOrInferSelector()).toEqualToken({
                value: `[name="${name}"]`,
                type: constants.TYPE.STRING
            });
        });

        it("which throws an UndeclaredError when trying to infer from a BlockVariable", function () {
            const variable = new BlockVariable(new Token("myVariable", constants.TYPE.VARIABLE));

            spyOn(Scope.prototype, "findTag").and.returnValue(null);

            expect(() => new Scope(variable).getOrInferSelector()).toThrowUfmError(UndeclaredError);
        });
    });
});