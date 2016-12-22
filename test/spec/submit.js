import submit from "../../src.es5/submit.js";

import constants from "../../src.es5/constants.js";
import Token from "../../src.es5/token.js";
import * as options from "../../src.es5/options.js";

describe("The submit module", function () {
    describe("exposes the \"init\" member", function () {
        it("as a function", function () {
            expect(submit.init).toEqual(jasmine.any(Function));
        });
        
        afterEach(function () {
            options.validateClient = true;
        });
        
        it("which binds a callback to form submission which allows valid submissions", function () {
            let evt = { preventDefault: jasmine.createSpy("preventDefault") };
            
            spyOn($.prototype, "on").and.callFake((event, selector, cb) => cb(evt));
            submit._root = jasmine.createSpy("root").and.returnValue({
                valid: new Token(true, constants.TYPE.BOOL)
            });
            
            submit.init();
            
            expect($.prototype.on).toHaveBeenCalledWith("submit", "form", jasmine.any(Function));
            expect($).toHaveBeenCalledWith(document);
            expect(evt.preventDefault).not.toHaveBeenCalled();
        });
        
        it("which binds a callback to form submission which prevents submissions when no root-level valid tag was defined", function () {
            let evt = { preventDefault: jasmine.createSpy("preventDefault") };
            
            spyOn($.prototype, "on").and.callFake((event, selector, cb) => cb(evt));
            submit._root = jasmine.createSpy("root").and.returnValue({ });
            
            submit.init();
            
            expect(evt.preventDefault).toHaveBeenCalled();
        });
        
        it("which binds a callback to form submission which prevents submissions when the root-level is invalid", function () {
            let evt = { preventDefault: jasmine.createSpy("preventDefault") };
            
            spyOn($.prototype, "on").and.callFake((event, selector, cb) => cb(evt));
            submit._root = jasmine.createSpy("root").and.returnValue({
                valid: new Token(false, constants.TYPE.BOOL)
            });
            
            submit.init();
            
            expect(evt.preventDefault).toHaveBeenCalled();
        });
        
        it("which binds a callback to form submission which allows submissions with an invalid root-level when validateClient is false", function () {
            let evt = { preventDefault: jasmine.createSpy("preventDefault") };
            
            spyOn($.prototype, "on").and.callFake((event, selector, cb) => cb(evt));
            submit._root = jasmine.createSpy("root").and.returnValue({
                valid: new Token(false, constants.TYPE.BOOL)
            });
            
            options.validateClient = false;
            submit.init();
            
            expect(evt.preventDefault).not.toHaveBeenCalled();
        });
    });
});