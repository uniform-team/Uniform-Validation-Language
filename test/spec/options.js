import * as options from "../../src.es5/options.js";

import parser from "../../src.es5/parser.js";

describe("The options module", function () {
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
    
    describe("exposes the \"validateClient\" member", function () {
    	it("as a boolean defaulting to true", function () {
    		expect(options.validateClient).toBe(true);
    	});
    });
});