import Tag from "../../src.es5/tag.js";

import constants from "../../src.es5/constants.js";
import Token from "../../src.es5/token.js";
import Scope from "../../src.es5/scope.js";
import Dependable from "../../src.es5/dependable.js";

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
        
        it("which only updates itself if it is not a root-level tag", function () {
            let tag = new Tag(new Token("valid", constants.TYPE.KEYWORD));
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
});