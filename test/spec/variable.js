describe("The variable module", function () {
	var uniform = window.uniform;
	
	describe("exposes the Variable class", function () {
		it("is exposed as a function", function () {
			expect(uniform.Variable).toEqual(jasmine.any(Function));
		});
	});
});