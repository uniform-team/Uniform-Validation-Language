import Tag from "../../src.es5/tag.js";

import constants from "../../src.es5/constants.js";
import Token from "../../src.es5/token.js";
import Scope from "../../src.es5/scope.js";
import Identifier from "../../src.es5/identifier.js";
import { BlockVariable } from "../../src.es5/variable.js";
import Dependable from "../../src.es5/dependable.js";
import { TypeError, UndeclaredError } from "../../src.es5/errors.js";

describe("The Tag class", function () {
	it("constructs from a token", function () {
		expect(() => new Tag(new Token("valid", constants.TYPE.KEYWORD))).not.toThrow();
	});
    
    it("mixes in Dependable", function () {
        let tag = new Tag(new Token("valid", constants.TYPE.KEYWORD));
        tag.initDependable(() => null); // Initialize the tag because the constructor does not do this
        
    	expect(Dependable.instanceof(tag)).toBe(true);
    });
    
    describe("overrides the Dependable \"update\" member", function () {
    	it("as a function", function () {
    		expect(Tag.prototype.update).toEqual(jasmine.any(Function));
    	});
    	
    	it("which does nothing if not yet initialized", function () {
    	    const tag = new Tag(new Token(constants.TAG.VALID, constants.TYPE.KEYWORD));
    	    tag.initDependable(() => null);
    	    tag.value = null; // Simulate uninitialized tag
    	    
    	    expect(() => tag.update()).not.toThrow();
    	});
    	
    	it("which throws a TypeError if given an expression yielding an invalid type", function () {
    	    const tag = new Tag(new Token(constants.TAG.VALID, constants.TYPE.KEYWORD));
    	    tag.initDependable(() => new Token("test", constants.TYPE.STRING));
    	    
    	    expect(() => tag.update()).toThrowUfmError(TypeError);
    	});
    
        describe("for an enabled tag", function () {
            it("correctly sets the element's enabled state if it has a sibling selector tag", function () {
                const enabledTag = new Tag(new Token(constants.TAG.ENABLED, constants.TYPE.KEYWORD), new Scope());
                const enabled = true;
                enabledTag.initDependable(() => new Token(enabled, constants.TYPE.BOOL));
                
                const selector = "#selector";
                const selectorTag = new Tag(new Token(constants.TAG.SELECTOR, constants.TYPE.KEYWORD));
                selectorTag.initDependable(() => new Token(selector, constants.TYPE.STRING));
                selectorTag.update(); // Initialize value
                spyOn(Scope.prototype, "findTag").and.returnValue(selectorTag);
                
                spyOn($.prototype, "is").and.callFake(function () {
                    expect(this.sel).toBe(selector);
                    return true; // Is an <input /> element
                });
                spyOn($.prototype, "prop").and.callFake(function () {
                    expect(this.sel).toBe(selector);
                });
                
                enabledTag.update();
                
                expect($.prototype.is).toHaveBeenCalledWith(":input");
                expect($.prototype.prop).toHaveBeenCalledWith("disabled", !enabled);
                
                expect(jasmineUtil.expectationCount).toBe(4);
            });
    
            it("correctly sets the element's enabled state by inferring the selector tag if a sibling tag does not exist", function () {
                const identifier = "make";
                const scope = new Scope(new Identifier(new Token(identifier, constants.TYPE.IDENTIFIER), constants.TYPE.STRING));
                const enabledTag = new Tag(new Token(constants.TAG.ENABLED, constants.TYPE.KEYWORD), scope);
                const enabled = true;
                enabledTag.initDependable(() => new Token(enabled, constants.TYPE.BOOL));
        
                spyOn(Scope.prototype, "findTag").and.returnValue(null);
        
                const selector = `[name="${identifier}"]`;
                spyOn($.prototype, "is").and.callFake(function () {
                    expect(this.sel).toBe(selector);
                    return true; // Is an <input /> element
                });
                spyOn($.prototype, "prop");
        
                enabledTag.update();
        
                expect($.prototype.is).toHaveBeenCalledWith(":input");
                expect($.prototype.prop).toHaveBeenCalledWith("disabled", !enabled);
        
                expect(jasmineUtil.expectationCount).toBe(3);
            });
            
            it("correctly sets the element's enabled state if it is an <input /> tag", function () {
                const enabledTag = new Tag(new Token(constants.TAG.ENABLED, constants.TYPE.KEYWORD), new Scope());
                const enabled = true;
                enabledTag.initDependable(() => new Token(enabled, constants.TYPE.BOOL));
        
                const selector = "#selector";
                const selectorTag = new Tag(new Token(constants.TAG.SELECTOR, constants.TYPE.KEYWORD));
                selectorTag.initDependable(() => new Token(selector, constants.TYPE.STRING));
                selectorTag.update(); // Initialize value
                spyOn(Scope.prototype, "findTag").and.returnValue(selectorTag);
        
                spyOn($.prototype, "is").and.callFake(function () {
                    expect(this.sel).toBe(selector);
                    return true; // Is an <input /> element
                });
                spyOn($.prototype, "prop").and.callFake(function () {
                    expect(this.sel).toBe(selector);
                });
        
                enabledTag.update();
        
                expect($.prototype.is).toHaveBeenCalledWith(":input");
                expect($.prototype.prop).toHaveBeenCalledWith("disabled", !enabled);
        
                expect(jasmineUtil.expectationCount).toBe(4);
            });
            
            it("correctly sets the element's <input /> descendants' enabled state", function () {
                const identifier = "make";
                const scope = new Scope(new Identifier(new Token(identifier, constants.TYPE.IDENTIFIER), constants.TYPE.STRING));
                const enabledTag = new Tag(new Token(constants.TAG.ENABLED, constants.TYPE.KEYWORD), scope);
                const enabled = true;
                enabledTag.initDependable(() => new Token(enabled, constants.TYPE.BOOL));
                
                const selector = "#selector";
                const selectorTag = new Tag(new Token(constants.TAG.SELECTOR, constants.TYPE.KEYWORD));
                selectorTag.initDependable(() => new Token(selector, constants.TYPE.STRING));
                selectorTag.update(); // Initialize
                spyOn(Scope.prototype, "findTag").and.returnValue(selectorTag);
                
                spyOn($.prototype, "is").and.callFake(function () {
                    expect(this.sel).toBe(selector);
                    return false; // Not an <input /> element
                });
                spyOn($.prototype, "find").and.callFake(function () {
                    expect(this.sel).toBe(selector);
                    return this; // Chain
                });
                spyOn($.prototype, "prop");
        
                enabledTag.update();
        
                expect($.prototype.is).toHaveBeenCalledWith(":input");
                expect($.prototype.find).toHaveBeenCalledWith(":input");
                expect($.prototype.prop).toHaveBeenCalledWith("disabled", !enabled);
        
                expect(jasmineUtil.expectationCount).toBe(5);
            });
        });
    	
        describe("for a visible tag", function () {
            it("correctly sets the element's visible state if it has a sibling selector tag", function () {
                const visibleTag = new Tag(new Token(constants.TAG.VISIBLE, constants.TYPE.KEYWORD), new Scope());
                visibleTag.initDependable(() => new Token(true, constants.TYPE.BOOL));
        
                const selector = "#selector";
                const selectorTag = new Tag(new Token(constants.TAG.SELECTOR, constants.TYPE.KEYWORD));
                selectorTag.initDependable(() => new Token(selector, constants.TYPE.STRING));
                selectorTag.update(); // Initialize value
                spyOn(Scope.prototype, "findTag").and.returnValue(selectorTag);
        
                spyOn($.prototype, "show").and.callFake(function () {
                    expect(this.sel).toBe(selector);
                });
        
                visibleTag.update();
        
                expect($.prototype.show).toHaveBeenCalledWith();
        
                expect(jasmineUtil.expectationCount).toBe(2);
            });
    
            it("correctly sets the element's visible state by inferring the selector tag a sibling tag does not exist", function () {
                const identifier = "make";
                const scope = new Scope(new Identifier(new Token(identifier, constants.TYPE.IDENTIFIER), constants.TYPE.STRING));
                const visibleTag = new Tag(new Token(constants.TAG.VISIBLE, constants.TYPE.KEYWORD), scope);
                visibleTag.initDependable(() => new Token(true, constants.TYPE.BOOL));
        
                spyOn(Scope.prototype, "findTag").and.returnValue(null);
        
                const selector = `[name="${identifier}"]`;
                spyOn($.prototype, "show").and.callFake(function () {
                    expect(this.sel).toBe(selector);
                });
        
                visibleTag.update();
        
                expect($.prototype.show).toHaveBeenCalledWith();
        
                expect(jasmineUtil.expectationCount).toBe(2);
            });
    
            it("correctly shows the element", function () {
                const visibleTag = new Tag(new Token(constants.TAG.VISIBLE, constants.TYPE.KEYWORD), new Scope());
                visibleTag.initDependable(() => new Token(true, constants.TYPE.BOOL));
        
                const selector = "#selector";
                const selectorTag = new Tag(new Token(constants.TAG.SELECTOR, constants.TYPE.KEYWORD));
                selectorTag.initDependable(() => new Token(selector, constants.TYPE.STRING));
                selectorTag.update(); // Initialize value
                spyOn(Scope.prototype, "findTag").and.returnValue(selectorTag);
                
                spyOn($.prototype, "show").and.callFake(function () {
                    expect(this.sel).toBe(selector);
                });
        
                visibleTag.update();
        
                expect($.prototype.show).toHaveBeenCalledWith();
        
                expect(jasmineUtil.expectationCount).toBe(2);
            });
            
            it("correctly hides the element", function () {
                const visibleTag = new Tag(new Token(constants.TAG.VISIBLE, constants.TYPE.KEYWORD), new Scope());
                visibleTag.initDependable(() => new Token(false, constants.TYPE.BOOL));
        
                const selector = "#selector";
                const selectorTag = new Tag(new Token(constants.TAG.SELECTOR, constants.TYPE.KEYWORD));
                selectorTag.initDependable(() => new Token(selector, constants.TYPE.STRING));
                selectorTag.update(); // Initialize value
                spyOn(Scope.prototype, "findTag").and.returnValue(selectorTag);
        
                spyOn($.prototype, "hide").and.callFake(function () {
                    expect(this.sel).toBe(selector);
                });
        
                visibleTag.update();
        
                expect($.prototype.hide).toHaveBeenCalledWith();
        
                expect(jasmineUtil.expectationCount).toBe(2);
            });
        });
        
        it("which throws an UndeclaredError on an enabled or visible tag when unable to infer the selector", function () {
            const variable = new BlockVariable(new Token("test", constants.TYPE.VARIABLE));
            
            const enabledTag = new Tag(new Token(constants.TAG.ENABLED, constants.TYPE.KEYWORD), new Scope(variable));
            enabledTag.initDependable(() => new Token(true, constants.TYPE.BOOL));
            
            spyOn(Scope.prototype, "findTag").and.returnValue(null);
            
            expect(() => enabledTag.update()).toThrowUfmError(UndeclaredError);
        });
    	
        it("which does not trigger jQuery if it is not a root-level tag", function () {
            let tag = new Tag(new Token(constants.TAG.VALID, constants.TYPE.KEYWORD));
            tag.initDependable(() => null);
            
            jasmineUtil.spyOnProp(Scope, "rootScope", "get", function (spy) {
                spy.and.returnValue({
                    tags: {
                        valid: { } // Some other object
                    }
                });
                spyOn($.prototype, "trigger");
                
                tag.update();
                
                expect($.prototype.trigger).not.toHaveBeenCalled();
            });
        });
        
        it("which updates itself and triggers a \"ufm:update\" event if it is a root-level tag", function () {
            let tag = new Tag(new Token("valid", constants.TYPE.KEYWORD));
            let token = new Token(true, constants.TYPE.BOOL);
            tag.initDependable(() => token);
    
            jasmineUtil.spyOnProp(Scope, "rootScope", "get", function (spy) {
                spy.and.returnValue({
                    tags: {
                        valid: tag // Same tag object
                    }
                });
                spyOn($.prototype, "trigger");
                
                tag.update();
                
                expect($.prototype.trigger).toHaveBeenCalledWith("ufm:update", [ "valid", token ]);
            });
        });
    });
    
    describe("exposes the \"expectedType\" property", function () {
        describe("with a getter", function () {
            it("defined as a function", function () {
                expect(Tag.prototype).toHaveGetter("expectedType");
            });
            
            it("which returns the the expected type for valid as boolean", function () {
                expect(new Tag(new Token(constants.TAG.VALID, constants.TYPE.KEYWORD)).expectedType).toBe(constants.TYPE.BOOL);
            });
    
            it("which returns the the expected type for enabled as boolean", function () {
                expect(new Tag(new Token(constants.TAG.ENABLED, constants.TYPE.KEYWORD)).expectedType).toBe(constants.TYPE.BOOL);
            });
    
            it("which returns the the expected type for visible as boolean", function () {
                expect(new Tag(new Token(constants.TAG.VISIBLE, constants.TYPE.KEYWORD)).expectedType).toBe(constants.TYPE.BOOL);
            });
    
            it("which returns the the expected type for selector as string", function () {
                expect(new Tag(new Token(constants.TAG.SELECTOR, constants.TYPE.KEYWORD)).expectedType).toBe(constants.TYPE.STRING);
            });
    
            it("which returns the the expected type for result as any type (null)", function () {
                expect(new Tag(new Token(constants.TAG.RESULT, constants.TYPE.KEYWORD)).expectedType).toBe(null);
            });
        });
        
        it("withOUT a setter", function () {
            expect(Tag.prototype).not.toHaveSetter("expectedType");
        });
    });
});