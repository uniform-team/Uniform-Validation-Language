import { Variable } from "../../src.es5/variable.js";

describe("The variable module", function () {
	describe("exposes the Variable class", function () {
		it("is exposed as a function", function () {
			expect(Variable).toEqual(jasmine.any(Function));
		});
	});
});