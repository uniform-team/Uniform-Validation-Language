import { Identifier, BlockIdentifier, ExpressionIdentifier } from "../../src.es5/identifier.js";

import Dependable from "../../src.es5/dependable.js";
import Token from "../../src.es5/token.js";
import constants from "../../src.es5/constants.js";
import Scope from "../../src.es5/scope.js";

describe("The Identifier class", function () {
    beforeEach(() => Identifier._map = { });
    
    describe("exposes the \"insert\" member", function () {
    	it("as a function", function () {
    		expect(Identifier.insert).toEqual(jasmine.any(Function));
    	});
        
        it("which inserts the given identifier into the global mapping by name", function () {
        	let identifier = { name: "test" };
        	
        	Identifier.insert(identifier);
            
            expect(Identifier._map.test).toBe(identifier);
        });
    });
    
    describe("exposes the \"find\" member", function () {
    	it("as a function", function () {
    		expect(Identifier.find).toEqual(jasmine.any(Function));
    	});
        
        it("which finds an identifier in the global mapping with the given name and returns it", function () {
        	let identifier = { name: "test" };
            
            Identifier._map.test = identifier;
            
            expect(Identifier.find("test")).toBe(identifier);
        });
        
        it("which returns null if no identifier with the given name exists in the global mapping", function () {
        	expect(Identifier.find("test")).toBeNull();
        });
    });
});

describe("The BlockIdentifier class", function () {
    it("constructs an instance from a token", function () {
    	expect(() => new BlockIdentifier(new Token("test", constants.TYPE.IDENTIFIER))).not.toThrow();
    });
    
    describe("exposes the \"getTag\" member", function () {
    	it("as a function", function () {
    		expect(BlockIdentifier.prototype.getTag).toEqual(jasmine.any(Function));
    	});
        
        it("which finds the requested tag in its scope and returns it", function () {
            let tag = { };
            spyOn(Scope.prototype, "findTag").and.returnValue(tag);
            
        	let identifier = new BlockIdentifier(new Token("test", constants.TYPE.IDENTIFIER));
            
            expect(identifier.getTag("valid")).toBe(tag);
            expect(Scope.prototype.findTag).toHaveBeenCalledWith("valid");
        });
        
        it("which returns null if the requested tag is not in its scope", function () {
        	expect(new BlockIdentifier(new Token("test", constants.TYPE.IDENTIFIER)).getTag("valid")).toBeNull();
        });
    });
});

describe("The ExpressionIdentifier class", function () {
    it("constructs an instance and initializes it", function () {
        let selector = "[name=\"test\"]";
        spyOn(Token.prototype, "getSelector").and.returnValue(selector);
        
        // Store callback given to initDependable(...) for an assertion later
        let expression = null;
        spyOn(ExpressionIdentifier.prototype, "initDependable").and.callFake((expr) => expression = expr);
        spyOn(ExpressionIdentifier.prototype, "update");
        
        // Store callback given to $.on(...) for an assertion later
        let onChange = null;
        spyOn($.prototype, "on").and.callFake((evt, sel, cb) => onChange = cb);
        
        let dataToken = new Token("foo", constants.TYPE.STRING);
        spyOn(ExpressionIdentifier.prototype, "getToken").and.returnValue(dataToken);
        
        let token = new Token("test", constants.TYPE.IDENTIFIER);
    	let identifier = new ExpressionIdentifier(token);
        
        expect(identifier.token).toBe(token);
        
        // Test that external functions were called correctly
        expect(ExpressionIdentifier.prototype.initDependable).toHaveBeenCalledWith(jasmine.any(Function));
        expect(identifier.update).toHaveBeenCalled();
        expect($.prototype.on).toHaveBeenCalledWith("change", selector, jasmine.any(Function));
        
        // Test that initDependable(...) was called with the correct expression callback which gets the identifier's value from jQuery
        expect(expression()).toEqualToken({
            value: "foo",
            type: constants.TYPE.STRING
        });
        
        // Test that $.on(...) was called with the correct callback which triggers an update() on this identifier
        identifier.update.calls.reset();
        onChange();
        expect(identifier.update).toHaveBeenCalled();
    });
    
	it("mixes in Dependable", function () {
		spyOn($.prototype, "val").and.returnValue("foo");
		
		expect(Dependable.instanceof(new ExpressionIdentifier(new Token("test", constants.TYPE.IDENTIFIER)))).toBe(true);
	});
    
    describe("exposes the \"getToken\" member", function () {
    	it("as a function", function () {
    		expect(ExpressionIdentifier.prototype.getToken).toEqual(jasmine.any(Function));
    	});
    
        it("returns the identifier's $(...).is(\":checked\") if it is a checkbox", function () {
            let identifier = {
                token: new Token("test", constants.TYPE.IDENTIFIER)
            };
            
            spyOn($.prototype, "attr").and.returnValue("checkbox");
            spyOn($.prototype, "is").and.returnValue(true);
            
            // Execute getToken() using the stub to avoid complications from using constructor
            let token = ExpressionIdentifier.prototype.getToken.apply(identifier);
            
            expect(token).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
            
            expect($.prototype.attr).toHaveBeenCalledWith("type");
            expect($.prototype.is).toHaveBeenCalledWith(":checked");
        });
        
        it("returns the identifier's $(...).val() if it is not a checkbox", function () {
            let identifier = {
                token: new Token("test", constants.TYPE.IDENTIFIER)
            };
    
            spyOn($.prototype, "attr").and.returnValue("text");
            spyOn($.prototype, "val").and.returnValue("foo");
    
            // Execute getToken() using the stub to avoid complications from using constructor
            let token = ExpressionIdentifier.prototype.getToken.apply(identifier);
    
            expect(token).toEqualToken({
                value: "foo",
                type: constants.TYPE.STRING
            });
    
            expect($.prototype.attr).toHaveBeenCalledWith("type");
        });
    });
});