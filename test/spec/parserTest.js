describe("The \"parser\" module", function () {
	it("is exposed as an object", function () {
		expect(uniform.parser).toEqual(jasmine.any(Object));
	});

	describe("exposes the \"parse\" member", function () {
		it("as a function", function () {
			expect(uniform.parser.parse).toEqual(jasmine.any(Function));
		});
	});
});