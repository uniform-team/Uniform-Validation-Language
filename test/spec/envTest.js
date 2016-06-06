describe("The \"env\" module", function () {
	it("is defined as a function", function () {
		expect(uniform.env).toEqual(jasmine.any(Function));
	});

	var env = uniform.env;

	it("calls back with the environment given in a previous \"set\" call", function () {
		var doc = {};
		var $jQuery = {};

		env.set(doc, $jQuery);

		var spy = jasmine.createSpy("callback").and.callFake(function (d, $) {
			expect(d).toBe(doc);
			expect($).toBe($jQuery);
		});

		env(spy);

		expect(spy).toHaveBeenCalled();
	});
});