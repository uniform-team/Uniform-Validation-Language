import jQueryEnv from "../../../src/validator.es5/jquery.js";

describe("The jQuery module", function () {
	it("is exposed as a function", function () {
		expect(jQueryEnv).toEqual(jasmine.any(Function));
	});
    
    describe("returns a jQuery mock object", function () {
    	describe("which exposes the \"val\" member", function () {
    		it("as a function", function () {
    		    let $ = jQueryEnv();
                
    			expect($("#selector").val).toEqual(jasmine.any(Function));
    		});
            
            it("which looks up the data for the element named in its selector", function () {
            	let $ = new jQueryEnv({ foo: "bar" });
                
                expect($("[name=\"foo\"]").val()).toBe("bar");
            });
    	});
        
        describe("which exposes the \"on\" member", function () {
        	it("as a function", function () {
        		let $ = jQueryEnv();
                
                expect($("#selector").on).toEqual(jasmine.any(Function));
        	});
        });
        
        describe("which exposes the \"trigger\" member", function () {
        	it("as a function", function () {
                let $ = jQueryEnv();
                
                expect($("#selector").trigger).toEqual(jasmine.any(Function));
        	});
        });
    });
    
    describe("exposes the \"ajax\" member", function () {
    	it("as a function", function () {
    	    let $ = jQueryEnv();
    	    
    		expect($.ajax).toEqual(jasmine.any(Function));
    	});
    });
});