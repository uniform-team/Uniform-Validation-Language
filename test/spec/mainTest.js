describe("The \"uniform\" variable", function () {
	it("is exposed globally as an object", function () {
		expect(uniform).toEqual(jasmine.any(Object));
	});
});