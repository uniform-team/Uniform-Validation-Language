describe("The \"validator\" variable", function () {
    it("is exposed globally as an object", function () {
        expect(uniform.validator).toEqual(jasmine.any(Object));
    });

    describe("creates the ufm plugin", function () {
        describe("which attaches the type member", function () {
            it("defined as a function", function () {

            });
            //it("returns a boolean if the control is a checkbox", function () {
            //    var $selector = $("#mySelector");
            //
            //    spyOn($selector, "attr").and.returnValue("checkbox");
            //
            //    expect($selector.ufm().type()).toBe(lexer.TOKEN.TYPE.BOOL);
            //});
        });
    });
});