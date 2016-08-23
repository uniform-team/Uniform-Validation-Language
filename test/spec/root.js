describe("The root property", function () {
	let uniform = window.uniform;
    
    let { Scope } = uniform;
    
    describe("exposes a getter", function () {
        it("as a function", function () {
            expect(Object.getOwnPropertyDescriptor(uniform, "root").get).toEqual(jasmine.any(Function));
        });
        
        it("which returns the root-level tag values", function () {
            jasmineUtil.spyOnProp(Scope, "rootScope", "get", function (spy) {
                let validToken = { }, enabledToken =  {};
                spy.and.returnValue({
                    tags: {
                        valid: { value: validToken },
                        enabled: { value: enabledToken }
                    }
                });
    
                let root = uniform.root;
    
                expect(root.valid).toBe(validToken);
                expect(root.enabled).toBe(enabledToken);
            });
        });
	});
    
    it("does NOT expose a setter", function () {
        expect(Object.getOwnPropertyDescriptor(uniform, "root").set).toBeUndefined();
    });
});