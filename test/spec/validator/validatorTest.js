var rewire = require("rewire");

var mocks = require("../../helper/validator/mocks.js");

var validate = rewire("../../../src/validator/validator.js");

beforeEach(function () {
	spyOn(console, "log");
});

describe("The \"validator\" module", function () {
	it("is exposed as a function", function () {
		expect(validate).toEqual(jasmine.any(Function));
	});

	it("reads the file at the path given", function () {
		var filePath = "www/ufm/script.ufm";
		var script = "$(\"#rootForm\") { valid: true; }";
		var main = "#rootForm";

		var readFile = mocks.createReadFile(script);
		validate.__set__("fs", { readFile: readFile });

		validate({ path: filePath, main: main });

		expect(readFile).toHaveBeenCalledWith(filePath, { encoding: "utf8" }, jasmine.any(Function));
	});

	it("reads all files at the paths given", function () {
		var filePaths = [ "www/ufm/script.ufm", "www/ufm/script2.ufm" ];
		var scripts = [ "$(\"#rootForm\") { valid: $(\"#carForm\") is valid; }", "$(\"#carForm\") { valid: true; }" ];

		var readFile = mocks.createReadFiles(scripts);
		validate.__set__("fs", { readFile: readFile });
		var main = "#rootForm";

		validate({ path: filePaths, main: main });

		var fileOptions = { encoding: "utf8" };
		expect(readFile).toHaveBeenCalledWith(filePaths[0], fileOptions, jasmine.any(Function));
		expect(readFile).toHaveBeenCalledWith(filePaths[1], fileOptions, jasmine.any(Function));
	});

	describe("returns a middleware function to parse the given script", function () {
		it("which calls back when successful", function () {
			var filePath = "www/ufm/script.ufm";
			var script = "$(\"#rootForm\") { valid: true; }";
			var main = "#rootForm";
			var req = { body: { ufm: JSON.stringify({ }) } };
			var res = { };

			validate.__set__("fs", { readFile: mocks.createReadFile(script) });
			validate.__set__("uniform", mocks.createUniform(main, true));
			validate.__set__("jQuery", mocks.createjQueryEnv());

			var cb = jasmine.createSpy("callback");
			validate({ path: filePath, main: main })(req, res, cb);

			expect(cb).toHaveBeenCalledWith(); // Called without error
		});

		it("which calls back with an error when unable to validate", function () {
			var filePath = "www/ufm/script.ufm";
			var script = "$(\"#rootForm\") { valid: false; }"; // Invalid
			var main = "#rootForm";
			var req = { body: { ufm: JSON.stringify({ }) } };
			var res = { };

			validate.__set__("fs", { readFile: mocks.createReadFile(script) });
			validate.__set__("uniform", mocks.createUniform(main, false));
			validate.__set__("jQuery", mocks.createjQueryEnv());

			var cb = jasmine.createSpy("callback");
			validate({ path: filePath, main: main })(req, res, cb);

			expect(cb).toHaveBeenCalledWith(jasmine.any(Error)); // Called with error
		});

		it("which calls back with an error when unable to find the main selector", function () {
			var filePath = "www/ufm/script.ufm";
			var script = "$(\"#carForm\") { valid: true; }"; // Wrong main
			var main = "#rootForm";
			var req = { body: { ufm: JSON.stringify({ }) } };
			var res = { };

			validate.__set__("fs", { readFile: mocks.createReadFile(script) });
			validate.__set__("uniform", mocks.createUniform(main));
			validate.__set__("jQuery", mocks.createjQueryEnv());

			var cb = jasmine.createSpy("callback");
			validate({ path: filePath, main: main })(req, res, cb);

			expect(cb).toHaveBeenCalledWith(jasmine.any(Error)); // Called with error
		});

		it("which calls back with an error when unable to parse script", function () {
			var filePath = "www/ufm/script.ufm";
			var script = "$(\"#rootForm\") { "; // Bad UFM script
			var main = "#rootForm";
			var req = { body: { ufm: JSON.stringify({ }) } };
			var res = { };
			var error = new Error("Uh oh");

			validate.__set__("fs", { readFile: mocks.createReadFile(script) });
			validate.__set__("uniform", mocks.createUniform(main, error));
			validate.__set__("jQuery", mocks.createjQueryEnv());

			var cb = jasmine.createSpy("callback");
			validate({ path: filePath, main: main })(req, res, cb);

			expect(cb).toHaveBeenCalledWith(error); // Called with error
		});

		it("which parses the request body when not already parsed", function () {
			var filePath = "www/ufm/script.ufm";
			var script = "$(\"#rootForm\") { valid: true; }";
			var main = "#rootForm";
			var req = { };
			var res = { };

			var bodyParser = mocks.createBodyParser({ ufm: JSON.stringify({ }) });
			validate.__set__("fs", { readFile: mocks.createReadFile(script) });
			validate.__set__("bodyParser", bodyParser);
			validate.__set__("uniform", mocks.createUniform(main));
			validate.__set__("jQuery", mocks.createjQueryEnv());

			validate({ path: filePath, main: main })(req, res, function () { });

			expect(bodyParser).toHaveBeenCalledWith(req, res, jasmine.any(Function));
		});

		it("which does NOT parse the request body when it is already parsed", function () {
			var filePath = "www/ufm/script.ufm";
			var script = "$(\"#rootForm\") { valid: true; }";
			var main = "#rootForm";
			var req = { body: { ufm: JSON.stringify({ }) } };
			var res = { };

			var bodyParser = mocks.createBodyParser({ ufm: JSON.stringify({ }) });
			validate.__set__("fs", { readFile: mocks.createReadFile(script) });
			validate.__set__("bodyParser", bodyParser);
			validate.__set__("uniform", mocks.createUniform(main));
			validate.__set__("jQuery", mocks.createjQueryEnv());

			validate({ path: filePath, main: main })(req, res, function () { });

			expect(bodyParser).not.toHaveBeenCalled();
		});
	});
});