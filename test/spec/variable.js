import { Variable, BlockVariable, ExpressionVariable } from "../../src.es5/variable.js";

import constants from "../../src.es5/constants.js";
import Token from "../../src.es5/token.js";
import Dependable from "../../src.es5/dependable.js";

describe("The variable module", function () {
	describe("exposes the Variable class", function () {
		it("as a function", function () {
			expect(Variable).toEqual(jasmine.any(Function));
		});
	});
	
	describe("exposes the BlockVariable class", function () {
		it("as a function", function () {
			expect(BlockVariable).toEqual(jasmine.any(Function));
		});
	});
    
    describe("exposes the ExpressionVariable class", function () {
    	it("as a function", function () {
    		expect(ExpressionVariable).toEqual(jasmine.any(Function));
    	});
        
        it("which mixes in Dependable", function () {
            let variable = new ExpressionVariable(new Token("valid", constants.TYPE.KEYWORD));
            variable.initDependable(() => null); // Initialize the tag because the constructor does not do this
    
            expect(Dependable.instanceof(variable)).toBe(true);
        });
    });
});