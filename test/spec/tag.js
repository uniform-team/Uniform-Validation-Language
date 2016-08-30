import Tag from "../../src.es5/tag.js";

import constants from "../../src.es5/constants.js";
import Token from "../../src.es5/token.js";
import Scope from "../../src.es5/scope.js";
import dependable from "../../src.es5/dependable.js";

describe("The Tag class", function () {
	it("constructs from a token", function () {
		expect(() => new Tag(new Token("valid", constants.TYPE.KEYWORD))).not.toThrow();
	});
    
    it("implements the dependable interface", function () {
        let tag = new Tag(new Token("valid", constants.TYPE.KEYWORD));
        tag.initDependable(() => null); // Initialize the tag because the constructor does not do this
        
    	expect(dependable.instanceof(tag)).toBe(true);
    });
    
    describe("exposes the \"setExpression\" member", function () {
    	it("as a function", function () {
    		expect(Tag.prototype.setExpression).toEqual(jasmine.any(Function));
    	});
        
        it("which initializes the dependable with the given expression", function () {
            let tag = new Tag(new Token("valid", constants.TYPE.KEYWORD));
            let expr = () => null;
            
            spyOn(tag, "initDependable");
            
            tag.setExpression(expr);
            
            expect(tag.initDependable).toHaveBeenCalledWith(expr);
        });
    });
    
    describe("overrides the dependable \"update\" member", function () {
    	it("as a function", function () {
    		expect(Tag.prototype.update).toEqual(jasmine.any(Function));
    	});
        
        it("which only updates itself if it is not a root-level tag", function () {
            let tag = new Tag(new Token("valid", constants.TYPE.KEYWORD));
            
            jasmineUtil.spyOnProp(Scope, "rootScope", "get", function (spy) {
                spy.and.returnValue({
                    tags: {
                        valid: { } // Some other object
                    }
                });
                spyOn(dependable.prototype, "update");
                spyOn($.prototype, "trigger");
    
                tag.update();
    
                expect(dependable.prototype.update).toHaveBeenCalled(); // Expect super.update() call
                expect($.prototype.trigger).not.toHaveBeenCalled();
            });
        });
        
        it("which updates itself and triggers a \"ufm:update\" event if it is a root-level tag", function () {
            let tag = new Tag(new Token("valid", constants.TYPE.KEYWORD));
            let token = new Token(true, constants.TYPE.BOOL);
            tag.setExpression(() => token);
    
            jasmineUtil.spyOnProp(Scope, "rootScope", "get", function (spy) {
                spy.and.returnValue({
                    tags: {
                        valid: tag // Same tag object
                    }
                });
                spyOn(dependable.prototype, "update").and.callThrough();
                spyOn($.prototype, "trigger");
        
                tag.update();
        
                expect(dependable.prototype.update).toHaveBeenCalled(); // Expect super.update() call
                expect($.prototype.trigger).toHaveBeenCalledWith("ufm:update", [ "valid", token ]);
            });
        });
    });
});