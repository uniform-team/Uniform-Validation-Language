describe("The errors module", function () {
	let uniform = window.uniform;
	
	it("is defined as an object", function () {
		expect(uniform.errors).toEqual(jasmine.any(Object));
	});
	
	let errors = uniform.errors;
	describe("exposes the \"UfmError\" member", function () {
		it("as a class extending Error", function () {
			expect(errors.UfmError).toExtend(Error);
		});
		
		let UfmError = errors.UfmError;
		describe("which can be constructed", function () {
			it("from a message", function () {
				let error = new UfmError("test", 0, 1);
				
				expect(error.name).toBe("UfmError");
				expect(error.lineNumber).toBe(0);
				expect(error.colNumber).toBe(1);
				expect(error.innerError).toBe(null);
			});
			
			it("from an Error", function () {
				let innerErr = new Error("test");
				let error = new UfmError(innerErr, 0, 1);
				
				expect(error.name).toBe("UfmError");
				expect(error.lineNumber).toBe(0);
				expect(error.colNumber).toBe(1);
				expect(error.innerError).toBe(innerErr);
			});
		});
	});
	
	describe("exposes the \"SyntaxError\" member", function () {
		it("as a class extending UfmError", function () {
			expect(errors.SyntaxError).toExtend(errors.UfmError);
		});
	});
	
	describe("exposes the \"ParsingError\" member", function () {
		it("as a class extending UfmError", function () {
			expect(errors.ParsingError).toExtend(errors.UfmError);
		});
	});
	
	describe("exposes the \"AssertionError\" member", function () {
		it("as a class extending UfmError", function () {
			expect(errors.AssertionError).toExtend(errors.UfmError);
		});
	});
	
	describe("exposes the \"TypeError\" member", function () {
		it("as a class extending UfmError", function () {
			expect(errors.TypeError).toExtend(errors.UfmError);
		});
	});
});