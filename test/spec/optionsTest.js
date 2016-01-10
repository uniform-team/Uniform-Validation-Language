describe("The \"options\" module", function () {
	it("is exposed as an object", function () {
		expect(uniform.options).toEqual(jasmine.any(Object));
	});

	describe("exposes the \"href\" member", function () {
		it("as a function", function () {
			expect(uniform.options.href).toEqual(jasmine.any());
		});
	});
});