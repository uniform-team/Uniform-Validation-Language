import { BlockVariable, ExpressionVariable } from "../../src.es5/variable.js";

import constants from "../../src.es5/constants.js";
import Token from "../../src.es5/token.js";
import Scope from "../../src.es5/scope.js";
import Dependable from "../../src.es5/dependable.js";

describe("The BlockVariable class", function () {
    describe("exposes the \"getTag\" member", function () {
        it("as a function", function () {
            expect(BlockVariable.prototype.getTag).toEqual(jasmine.any(Function));
        });
        
        it("which finds the requested tag in its scope and returns it", function () {
            let tag = { };
            spyOn(Scope.prototype, "findTag").and.returnValue(tag);
            
            let variable = new BlockVariable(new Token("test", constants.TYPE.VARIABLE));
            
            expect(variable.getTag("valid")).toBe(tag);
            expect(Scope.prototype.findTag).toHaveBeenCalledWith("valid");
        });
        
        it("which returns null if the requested tag is not in its scope", function () {
            expect(new BlockVariable(new Token("test", constants.TYPE.VARIABLE)).getTag("valid")).toBeNull();
        });
    });
});

describe("The ExpressionVariable class", function () {
    it("mixes in Dependable", function () {
        let variable = new ExpressionVariable(new Token("valid", constants.TYPE.KEYWORD));
        variable.initDependable(() => null); // Initialize the tag because the constructor does not do this

        expect(Dependable.instanceof(variable)).toBe(true);
    });
});