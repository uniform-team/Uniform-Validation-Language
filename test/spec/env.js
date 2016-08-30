import * as env from "../../src.es5/env.js";

describe("The env module", function () {
	describe("exposes the \"init\" member", function () {
		it("as a function", function () {
			expect(env.init).toEqual(jasmine.any(Function));
		});
        
        afterEach(function () {
            env.document = window.document;
            env.$ = window.$;
        });
        
        it("which sets the document and $ values to the ones given", function () {
        	let document = {};
        	let $ = {};
        	
        	env.init(document, $);
            
            expect(env.document).toBe(document);
            expect(env.$).toBe($);
        });
        
        it("which sets the document and $ values to the window defaults when none are given", function () {
        	env.document = null;
            env.$ = null;
            
            env.init();
            
            expect(env.document).toBe(window.document);
            expect(env.$).toBe(window.$);
        });
	});
});