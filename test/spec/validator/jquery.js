import jQueryEnv from "../../../src.es5/validator/jquery.js";

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
        
        describe("which exposes the \"is\" member", function () {
        	it("as a function", function () {
        		let $ = jQueryEnv();
                
                expect($("#selector").is).toEqual(jasmine.any(Function));
        	});
    
            // See GitHub #36 for bitching
            it("which returns true if it has the value \"on\" in the request body", function () {
            	let $ = jQueryEnv({ foo: "on" });
                
                expect($("[name=\"foo\"]").is(":checked")).toBe(true);
            });
    
            // See GitHub #36 for bitching
            it("which returns false if this selector does not exist in the request body", function () {
            	let $ = jQueryEnv({ });
                
                expect($("[name=\"foo\"]").is(":checked")).toBe(false);
            });
            
            it("which throws an error if not given the input specifier of \":checked\"", function () {
            	let $ = jQueryEnv();
                
                expect(() => $("[name=\"foo\"]").is("input")).toThrowError();
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
        
        describe("which exposes the \"ready\" member", function () {
            it("as a function", function () {
                let $ = jQueryEnv();
                
                expect($("#selector").ready).toEqual(jasmine.any(Function));
            });
            
            it("which immediately invokes the function it is given", function () {
                let $ = jQueryEnv();
                
                let callback = jasmine.createSpy("callback");
                $("#selector").ready(callback);
                expect(callback).toHaveBeenCalled();
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