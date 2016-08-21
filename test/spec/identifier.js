var uniform = window.uniform;
let { dependable, Token, constants, Scope, } = uniform;

describe("The Identifier class", function () {
	it("is exposed as a function", function () {
		expect(uniform.Identifier).toEqual(jasmine.any(Function));
	});
    
    let { Identifier } = uniform;
    
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
	it("is exposed as a function", function () {
		expect(uniform.BlockIdentifier).toEqual(jasmine.any(Function));
	});
    
    let { BlockIdentifier } = uniform;
    
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
        });
        
        it("which returns null if the requested tag is not in its scope", function () {
        	expect(new BlockIdentifier(new Token("test", constants.TYPE.IDENTIFIER)).getTag("valid")).toBeNull();
        });
    });
});

describe("The ExpressionIdentifier class", function () {
	it("is exposed as a function", function () {
		expect(uniform.ExpressionIdentifier).toEqual(jasmine.any(Function));
	});
	
    let { ExpressionIdentifier } = uniform;
    
    it("constructs an instance and initializes it", function () {
        let selector = "[name=\"test\"]";
        spyOn(Token.prototype, "getSelector").and.returnValue(selector);
        
        // Store callback given to initDependable(...) for an assertion later
        let expression = null;
        spyOn(ExpressionIdentifier.prototype, "initDependable").and.callFake((expr) => expression = expr);
        spyOn(ExpressionIdentifier.prototype, "update");
        
        // Store callback given to $.on(...) for an assertion later
        let onChange = null;
        spyOn($, "on").and.callFake((evt, sel, cb) => onChange = cb);
        
        spyOn($.prototype, "val").and.returnValue("foo");
        
    	let identifier = new ExpressionIdentifier(new Token("test", constants.TYPE.IDENTIFIER));
        
        // Test that external functions were called correctly
        expect(ExpressionIdentifier.prototype.initDependable).toHaveBeenCalledWith(jasmine.any(Function));
        expect(identifier.update).toHaveBeenCalled();
        expect($.on).toHaveBeenCalledWith("change", selector, jasmine.any(Function));
        
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
    
	it("implements the dependable interface", function () {
		spyOn($.prototype, "val").and.returnValue("foo");
		
		expect(dependable.instanceof(new ExpressionIdentifier(new Token("test", constants.TYPE.IDENTIFIER)))).toBe(true);
	});
});