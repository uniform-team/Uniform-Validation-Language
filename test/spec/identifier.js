import Identifier from "../../src.es5/identifier.js";

import Dependable from "../../src.es5/dependable.js";
import Token from "../../src.es5/token.js";
import constants from "../../src.es5/constants.js";
import Scope from "../../src.es5/scope.js";
import { RedeclaredError } from "../../src.es5/errors.js";

describe("The Identifier class", function () {
    beforeEach(() => Identifier._map = { });
    
    it("constructs an instance and initializes it", function () {
        let selector = "[name=\"test\"]";
        spyOn(Token.prototype, "getSelector").and.returnValue(selector);
        
        // Store callback given to initDependable(...) for an assertion later
        let expression = null;
        spyOn(Identifier.prototype, "initDependable").and.callFake((expr) => expression = expr);
        spyOn(Identifier.prototype, "update");
        
        // Store callback given to $.on(...) for an assertion later
        let onChange = null;
        spyOn($.prototype, "on").and.callFake((evt, sel, cb) => onChange = cb);
        
        let dataToken = new Token("foo", constants.TYPE.STRING);
        spyOn(Identifier.prototype, "getToken").and.returnValue(dataToken);
        
        let token = new Token("test", constants.TYPE.IDENTIFIER);
        let identifier = new Identifier(token);
        
        expect(identifier.token).toBe(token);
        
        // Test that external functions were called correctly
        expect(Identifier.prototype.initDependable).toHaveBeenCalledWith(jasmine.any(Function));
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
        
        expect(Dependable.instanceof(new Identifier(new Token("test", constants.TYPE.IDENTIFIER), constants.TYPE.STRING))).toBe(true);
    });
    
    describe("exposes the \"init\" member", function () {
        it("as a static function", function () {
            expect(Identifier.init).toEqual(jasmine.any(Function));
        });
        
        it("which resets the global identifier map", function () {
            let map = {};
            Identifier._map = map;
            Identifier.init();
            expect(Identifier._map).not.toBe(map);
        });
    });
    
    describe("exposes the \"declare\" member", function () {
        beforeEach(function () {
            // Reset global declaration map before each test
            Identifier.init();
        });
        
        it("as a static function", function () {
            expect(Identifier.declare).toEqual(jasmine.any(Function));
        });
        
        it("which inserts a new identifier into the global map", function () {
            let name = "test";
            let identifier = new Identifier(new Token(name, constants.TYPE.IDENTIFIER), constants.TYPE.STRING);
            
            Identifier.declare(identifier);
            
            expect(Identifier._map[name]).toBe(identifier);
        });
        
        it("which throws a RedeclarationError if an identifier is declared twice", function () {
            let name = "test";
            let identifier1 = new Identifier(new Token(name, constants.TYPE.IDENTIFIER), constants.TYPE.STRING);
            let identifier2 = new Identifier(new Token(name, constants.TYPE.IDENTIFIER), constants.TYPE.STRING);
            
            Identifier.declare(identifier1);
            
            expect(() => Identifier.declare(identifier2)).toThrowUfmError(RedeclaredError)
        });
    });
    
    describe("exposes the \"find\" member", function () {
        it("as a static function", function () {
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
    
    describe("exposes the \"getTag\" member", function () {
        it("as a function", function () {
            expect(Identifier.prototype.getTag).toEqual(jasmine.any(Function));
        });
        
        it("which finds the requested tag in its scope and returns it", function () {
            let tag = { };
            let identifier = { scope: new Scope() };
            spyOn(Scope.prototype, "findTag").and.returnValue(tag);
            
            expect(Identifier.prototype.getTag.call(identifier, "valid")).toBe(tag);
            expect(identifier.scope.findTag).toHaveBeenCalledWith("valid");
        });
        
        it("which returns null if the requested tag is not in its scope", function () {
            spyOn($.prototype, "val").and.returnValue("hello");
            
            expect(new Identifier(new Token("test", constants.TYPE.IDENTIFIER), constants.TYPE.STRING).getTag("valid")).toBeNull();
        });
    });
    
    describe("exposes the \"getToken\" member", function () {
        it("as a function", function () {
            expect(Identifier.prototype.getToken).toEqual(jasmine.any(Function));
        });
    
        it("returns the identifier's $(...).is(\":checked\") if it is a boolean", function () {
            let identifier = {
                type: constants.TYPE.BOOL,
                token: new Token("test", constants.TYPE.IDENTIFIER)
            };
            
            spyOn($.prototype, "is").and.returnValue(true);
            
            // Execute getToken() using the stub to avoid complications from using constructor
            let token = Identifier.prototype.getToken.apply(identifier);
            
            expect(token).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
            
            expect($.prototype.is).toHaveBeenCalledWith(":checked");
        });
        
        it("returns the identifier's $(...).val() if it is a string", function () {
            let identifier = {
                type: constants.TYPE.STRING,
                token: new Token("test", constants.TYPE.IDENTIFIER)
            };
    
            spyOn($.prototype, "val").and.returnValue("foo");
    
            // Execute getToken() using the stub to avoid complications from using constructor
            let token = Identifier.prototype.getToken.apply(identifier);
    
            expect(token).toEqualToken({
                value: "foo",
                type: constants.TYPE.STRING
            });
        });
    });
});