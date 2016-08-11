describe("The Identifier class", function () {
	var uniform = window.uniform;
	
	it("is exposed as a function", function () {
		expect(uniform.Identifier).toEqual(jasmine.any(Function));
	});
	
	let Identifier = uniform.Identifier;
	let Scope = uniform.Scope;
	
	it("inserts itself into the current scope on construction", function () {
		let identifier;
		let scope = new Scope(function (s) {
			spyOn(s, "insert");
			
			identifier = new Identifier("test", 0, 1);
		});
		
		expect(identifier.scope.parentScope).toBe(scope);
	});
});