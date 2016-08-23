describe("The options module", function () {
	let uniform = window.uniform;
    
    it("is exposed as an object", function () {
		expect(uniform.options).toEqual(jasmine.any(Object));
	});
    
    let { options, parser } = uniform;
    
    describe("exposes the \"href\" member", function () {
    	it("as a function", function () {
    		expect(options.href).toEqual(jasmine.any(Function));
    	});
        
        it("which sends an AJAX request to the given URL and parses the result", function () {
        	let path = "file.ufm";
            let content = "test { }";
            
            spyOn($, "ajax").and.callFake(function ({ method, url, success }) {
        	    expect(method).toBe("GET");
                expect(url).toBe(path);
                success(content);
            });
            spyOn(parser, "parse");
            
            options.href(path);
            
            expect(parser.parse).toHaveBeenCalledWith(content);
            expect(jasmineUtil.expectationCount).toBe(3);
        });
    });
});