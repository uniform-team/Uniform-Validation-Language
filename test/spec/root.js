import root from "../../src.es5/root.js";

import Scope from "../../src.es5/scope.js";

describe("The root getter", function () {
    it("is exposed as a function", function () {
        expect(root).toEqual(jasmine.any(Function));
    });
    
    it("returns the root-level tag values", function () {
        jasmineUtil.spyOnProp(Scope, "rootScope", "get", function (spy) {
            let validToken = { }, enabledToken =  {};
            spy.and.returnValue({
                tags: {
                    valid: { value: validToken },
                    enabled: { value: enabledToken }
                }
            });

            expect(root().valid).toBe(validToken);
            expect(root().enabled).toBe(enabledToken);
        });
    });
});