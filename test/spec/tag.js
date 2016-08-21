describe("The Tag class", function () {
	let uniform = window.uniform;
	
	it("is exposed as a function", function () {
		expect(uniform.Tag).toEqual(jasmine.any(Function));
	});
	
	let { Tag, Token, constants, dependable } = uniform;
	
	it("constructs from a token", function () {
		expect(() => new Tag(new Token("valid", constants.TYPE.KEYWORD))).not.toThrow();
	});
    
    it("implements the dependable interface", function () {
        let tag = new Tag(new Token("valid", constants.TYPE.KEYWORD));
        tag.initDependable(() => null); // Initialize the tag because the constructor does not do this
        
    	expect(dependable.instanceof(tag)).toBe(true);
    });
    
    describe("exposes the \"setExpression\" member", function () {
    	it("as a function", function () {
    		expect(Tag.prototype.setExpression).toEqual(jasmine.any(Function));
    	});
        
        it("which initializes the dependable with the given expression", function () {
            let tag = new Tag(new Token("valid", constants.TYPE.KEYWORD));
            let expr = () => null;
            
            spyOn(tag, "initDependable");
            
            tag.setExpression(expr);
            
            expect(tag.initDependable).toHaveBeenCalledWith(expr);
        });
    });
});