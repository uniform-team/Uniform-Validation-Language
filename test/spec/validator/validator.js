import proxyquire from "proxyquire";

let fs = { };
let denodeify = (module) => module;
let bodyParser, jQueryEnv, uniform;

// Load validator while injecting dependencies
let validator = proxyquire.noCallThru().load("../../../src.es5/validator/validator.js", {
    fs: fs,
    denodeify: denodeify,
    "body-parser": { urlencoded: () => (req, res, next) => bodyParser(req, res, next) },
    "./jquery.js": (data) => jQueryEnv(data),
    "../main.js": (document, $) => uniform(document, $)
});

describe("The validator module", function () {
	it("is defined as a function", function () {
		expect(validator).toEqual(jasmine.any(Function));
	});
    
    beforeEach(function () {
        fs.readFile = null;
        bodyParser = null;
        jQueryEnv = null;
        uniform = null;
    });
    
    it("curries a function which calls back after successfully validating request data based on a Uniform script returning the result in req.ufmResult", function (done) {
        let req = { body: { } }, $ = () => null;
        let parse = jasmine.createSpy("parse");
        let content = "valid: true; result: \"test\";";
        
        fs.readFile = jasmine.createSpy("readFile").and.returnValue(jasmineUtil.KeptPromise(content));
        bodyParser = jasmine.createSpy("bodyParser");
        jQueryEnv = jasmine.createSpy("jQueryEnv").and.returnValue($);
        uniform = jasmine.createSpy("uniform").and.returnValue({
            parser: {
                parse: parse
            },
            root: {
                valid: {
                    value: true
                },
                result: {
                    value: "test"
                }
            }
        });
        
        validator("script.ufm")(req, null, function (err) {
            expect(err).toBeFalsy();
            
            expect(req.ufmResult).toBe("test");
            
            expect(fs.readFile).toHaveBeenCalledWith("script.ufm", { encoding: "utf8" });
            expect(bodyParser).not.toHaveBeenCalled();
            expect(jQueryEnv).toHaveBeenCalledWith(req.body);
            expect(uniform).toHaveBeenCalledWith({ }, $);
            expect(parse).toHaveBeenCalledWith(content);
            
            done();
        });
    });
    
    it("curries a function which calls back with an error after failing to validate request data based on a Uniform script", function (done) {
        let req = { body: { } }, $ = () => null;
        
        fs.readFile = jasmine.createSpy("readFile").and.returnValue(jasmineUtil.KeptPromise("valid: false;"));
        jQueryEnv = jasmine.createSpy("jQueryEnv").and.returnValue($);
        uniform = jasmine.createSpy("uniform").and.returnValue({
            parser: {
                parse: jasmine.createSpy("parse")
            },
            root: {
                valid: {
                    value: false
                }
            }
        });
        
        validator("script.ufm")(req, null, function (err) {
            expect(err).toBeTruthy();
            
            done();
        });
    });
    
    it("curries a function which calls back after parsing the request body and validating the request data based on a Uniform script", function (done) {
        let req = { }, res = { }, $ = () => null;
        
        fs.readFile = jasmine.createSpy("readFile").and.returnValue(jasmineUtil.KeptPromise("valid: false;"));
        bodyParser = jasmine.createSpy("bodyParser").and.callFake((req, res, cb) => cb());
        jQueryEnv = jasmine.createSpy("jQueryEnv").and.returnValue($);
        uniform = jasmine.createSpy("uniform").and.returnValue({
            parser: {
                parse: jasmine.createSpy("parse")
            },
            root: {
                valid: {
                    value: true
                }
            }
        });
    
        validator("script.ufm")(req, res, function (err) {
            expect(err).toBeFalsy();
            
            expect(bodyParser).toHaveBeenCalledWith(req, res, jasmine.any(Function));
            
            done();
        });
    });
    
    it("curries a function which calls back with an error when unable to read the Uniform script given", function (done) {
        let req = { body: { } };
        var error = new Error("Uh oh");
        
        fs.readFile = jasmine.createSpy("readFile").and.returnValue(jasmineUtil.BrokenPromise(error));
        
        validator("script.ufm")(req, null, function (err) {
            expect(err).toBe(error);
            
            done();
        });
    });
});