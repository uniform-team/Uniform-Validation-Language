describe("The \"main\" module", function () {
	it("exposes Uniform globally as an object", function () {
		expect(uniform).toEqual(jasmine.any(Object));
	});

	it("determines that it is running in a browser", function () {
		expect(uniform._priv.browser).toBe(true);
	});
});