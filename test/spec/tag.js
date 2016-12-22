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

        it("which triggers an update on the DOM for an enabled tag", function () {
            const scope = new Scope();
            const enabled = true;
            const tag = new Tag(new Token(constants.TAG.ENABLED, constants.TYPE.KEYWORD), scope);
            tag.initDependable(() => new Token(enabled, constants.TYPE.BOOL));

            const selector = "#selector";
            spyOn(Scope.prototype, "getOrInferSelector").and.returnValue(new Token(selector, constants.TYPE.STRING));
            spyOn(Tag, "updateEnabled");

            tag.update();

            expect(Tag.updateEnabled).toHaveBeenCalledWith(selector, enabled);
        });

        it("which triggers an update on the DOM for a visible tag", function () {
            const scope = new Scope();
            const visible = true;
            const tag = new Tag(new Token(constants.TAG.VISIBLE, constants.TYPE.KEYWORD), scope);
            tag.initDependable(() => new Token(visible, constants.TYPE.BOOL));

            const selector = "#selector";
            spyOn(Scope.prototype, "getOrInferSelector").and.returnValue(new Token(selector, constants.TYPE.STRING));
            spyOn(Tag, "updateVisible");

            tag.update();

            expect(Tag.updateVisible).toHaveBeenCalledWith(selector, visible);
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

    describe("exposes the \"updateEnabled\" member", function () {
        it("as a static function", function () {
            expect(Tag.updateEnabled).toEqual(jasmine.any(Function));
        });

        it("which sets the element's enabled state if it is an <input /> tag", function () {
            const selector = "#selector";
            const enabled = true;

            spyOn($.prototype, "is").and.callFake(function () {
                expect(this.sel).toBe(selector);
                return true; // Is an <input /> element
            });
            spyOn($.prototype, "prop").and.callFake(function () {
                expect(this.sel).toBe(selector);
                return this; // Chain
            });
            spyOn($.prototype, "attr").and.callFake(function () {
                expect(this.sel).toBe(selector);
            });

            Tag.updateEnabled(selector, enabled);

            expect($.prototype.is).toHaveBeenCalledWith(":input");
            expect($.prototype.prop).toHaveBeenCalledWith("disabled", !enabled);
            expect($.prototype.attr).toHaveBeenCalledWith("ufm-enabled", enabled);

            expect(jasmineUtil.expectationCount).toBe(6);
        });

        it("which sets the element's <input /> descendants' enabled state", function () {
            const parentSel = "div#parent";
            const parent = new DomElem();
            const childSel = "input#child";
            const child = new DomElem();
            const enabled = true;

            jQueryMap.put(parentSel, [ parent ]);
            jQueryMap.put(childSel, [ child ]);

            spyOn($.prototype, "is").and.callFake(function (query) {
                if (query === ":input") {
                    return false; // Not an <input /> element
                } else if (query === `[ufm-enabled="${!enabled}"]`) {
                    return false; // No element overrides the one being set
                } else {
                    throw new Error(`Unknown query "${query}".`);
                }
            });
            spyOn($.prototype, "find").and.callFake(function () {
                expect(this.sel).toBe(parentSel);
                return $(child);
            });
            spyOn($.prototype, "each").and.callFake(function (cb) {
                expect(this[0]).toBe(child);
                cb(0, this[0]);
            });
            spyOn($.prototype, "parent").and.callFake(function () {
                expect(this[0]).toBe(child);
                return $(parent);
            });
            spyOn($.prototype, "prop").and.callFake(function () {
                expect(this[0]).toBe(child);
            });

            Tag.updateEnabled(parentSel, enabled);

            expect($.prototype.is).toHaveBeenCalledWith(":input");
            expect($.prototype.find).toHaveBeenCalledWith(":input");
            expect($.prototype.prop).toHaveBeenCalledWith("disabled", !enabled);

            expect(jasmineUtil.expectationCount).toBe(7);
        });

        it("which ignores any descendant <input /> elements, if that child is directly overridden by another enabled tag", function () {
            const parentSel = "div#parent";
            const parent = new DomElem();
            const childSel = "input#child";
            const child = new DomElem();
            const enabled = true;

            jQueryMap.put(parentSel, [ parent ]);
            jQueryMap.put(childSel, [ child ]);

            spyOn($.prototype, "is").and.callFake(function (query) {
                if (query === ":input") {
                    return false; // Not an <input /> element
                } else if (query === `[ufm-enabled="${!enabled}"]`) {
                    return true; // Child element overrides the one being set
                } else {
                    throw new Error(`Unknown query "${query}".`);
                }
            });
            spyOn($.prototype, "find").and.callFake(function () {
                expect(this.sel).toBe(parentSel);
                return $(child);
            });
            spyOn($.prototype, "each").and.callFake(function (cb) {
                expect(this[0]).toBe(child);
                cb(0, this[0]);
            });
            spyOn($.prototype, "prop");

            Tag.updateEnabled(parentSel, enabled);

            expect($.prototype.is).toHaveBeenCalledWith(":input");
            expect($.prototype.find).toHaveBeenCalledWith(":input");
            expect($.prototype.prop).not.toHaveBeenCalledWith();

            expect(jasmineUtil.expectationCount).toBe(5);
        });

        it("which ignores any descendant <input /> elements, if that child is indirectly overridden by another enabled tag", function () {
            const parentSel = "div#parent";
            const parent = new DomElem();
            const middleSel = "div#middle";
            const middle = new DomElem();
            const childSel = "input#child";
            const child = new DomElem();
            const enabled = true;

            jQueryMap.put(parentSel, [ parent ]);
            jQueryMap.put(middleSel, [ middle ]);
            jQueryMap.put(childSel, [ child ]);

            spyOn($.prototype, "is").and.callFake(function (query) {
                if (query === ":input") {
                    return false; // Not an <input /> element
                } else if (query === `[ufm-enabled="${!enabled}"]`) {
                    if (this[0] === child) return false; // Child is NOT overridden
                    else if (this[0] === middle) return true; // Middle element IS overridden
                    else throw new Error("Unknown jQuery object: " + this);
                } else {
                    throw new Error(`Unknown query "${query}".`);
                }
            });
            spyOn($.prototype, "find").and.callFake(function () {
                expect(this.sel).toBe(parentSel);
                return $(child);
            });
            spyOn($.prototype, "each").and.callFake(function (cb) {
                expect(this[0]).toBe(child);
                cb(0, this[0]);
            });
            spyOn($.prototype, "parent").and.callFake(function () {
                if (this[0] === child) return $(middle);
                else if (this[0] === middle) return $(parent);
                else throw new Error("Unknown jQuery object: " + this);
            });
            spyOn($.prototype, "prop");

            Tag.updateEnabled(parentSel, enabled);

            expect($.prototype.is).toHaveBeenCalledWith(":input");
            expect($.prototype.find).toHaveBeenCalledWith(":input");
            expect($.prototype.prop).not.toHaveBeenCalledWith();

            expect(jasmineUtil.expectationCount).toBe(5);
        });
    });

    describe("exposes the \"updateVisible\" member", function () {
        it("as a static function", function () {
            expect(Tag.updateVisible).toEqual(jasmine.any(Function));
        });

        it("which shows the given selector", function () {
            const selector = "#selector";

            spyOn($.prototype, "show").and.callFake(function () {
                expect(this.sel).toBe(selector);
            });

            Tag.updateVisible(selector, true);

            expect($.prototype.show).toHaveBeenCalled();

            expect(jasmineUtil.expectationCount).toBe(2);
        });

        it("which hides the given selector", function () {
            const selector = "#selector";

            spyOn($.prototype, "hide").and.callFake(function () {
                expect(this.sel).toBe(selector);
            });

            Tag.updateVisible(selector, false);

            expect($.prototype.hide).toHaveBeenCalled();

            expect(jasmineUtil.expectationCount).toBe(2);
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