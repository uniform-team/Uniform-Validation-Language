var fs = require("fs");

var bodyParser = require("body-parser").urlencoded({ extended: false });

var jQuery = require("./jquery.js");
var uniform = require("../main.js");

module.exports = function (options) {
	var main = options.main; // Load main selector
	var scripts = [];

	// Load files
	if (options.script) { // Load string Uniform content from options.script
		scripts.push(options.script);
	} else { // Load string or array of Uniform file paths from options.path
		var files;
		if (typeof options.path === "string") files = [options.path];
		else files = options.path;

		// Read the script file given
		files.forEach(function (file) {
			fs.readFile(file, { encoding: "utf8" }, function (err, script) {
				if (err) throw err; // Rethrow file reading error

				scripts.push(script);
			});
		});
	}

	// Validate against the request data given
	var validate = function (req, res, next) {
		// Read data from client
		try {
			var data = JSON.parse(req.body.ufm);
		} catch (err) {
			console.error("Unable to parse input, is the body parsed correctly?");

			next(err);
			return;
		}

		// Create mocks of document and jQuery
		var doc = {};
		var $ = new jQuery(data);

		// Inject Uniform code with mocked document and jQuery
		var ufm = uniform(doc, $);

		try {
			// Parse the given Uniform script
			var scope = null;
			scripts.forEach(function (script) {
				scope = ufm.parser.parse(script);
			});

			// Check if main selector is valid
			var $main = $(main).ufm();
			var selector = scope.selectorTable[main];
			if (!selector) throw new Error("Could not find selector $(\"" + main + "\") in loaded Uniform script(s).");
			var valid = selector.expression($main).value;

			// Check validity
			if (valid) next();
			else next(new Error("Data given is invalid."));
		} catch (err) {
			next(err);
		}
	};

	// Return middleware function to wrap validation
	return function (req, res, next) {
		var promise;
		if (!next) { // No callback given, return a promise
			promise = new Promise(function (success, failure) {
				next = function (err) {
					if (err) failure(err);
					else success();
				};
			});
		}

		// Parse request body if necessary
		if (!req.body) {
			bodyParser(req, res, function () {
				validate(req, res, next);
			});
		} else {
			validate(req, res, next);
		}

		return promise;
	};
};