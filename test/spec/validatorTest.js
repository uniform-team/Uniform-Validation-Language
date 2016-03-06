describe("The \"validator\" variable", function () {
    it("is exposed globally as an object", function () {
        expect(uniform.validator).toEqual(jasmine.any(Function));
    });
});