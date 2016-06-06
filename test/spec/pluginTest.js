describe("The \"plugin\" variable", function () {
    it("is exposed globally as an object", function () {
        expect(uniform.plugin).toEqual(jasmine.any(Object));
    });
});