var createjQuery = function () {
	return function () {
		return {
			ufm: function () {
				return this;
			}
		}
	}
};

module.exports = {
	createReadFile: function (script) {
		return jasmine.createSpy("readFile").andCallFake(function (file, options, cb) {
			cb(null, script);
		});
	},

	createReadFiles: function (scripts) {
		var call = 0;

		return jasmine.createSpy("readFile").andCallFake(function (file, options, cb) {
			cb(null, scripts[call++]);
		});
	},

	createBodyParser: function (body) {
		return jasmine.createSpy("bodyParser").andCallFake(function (req, res, next) {
			req.body = body;

			next();
		});
	},

	createUniform: function (main, valid) {
		if (valid instanceof Error) {
			var error = valid;

			return function () {
				return {
					parser: {
						parse: jasmine.createSpy("parse").andThrow(error)
					}
				}
			}
		}

		var scope = {
			selectorTable: {}
		};
		scope.selectorTable[main] = {
			expression: function () {
				return {value: valid};
			}
		};

		return function () {
			return {
				parser: {
					parse: jasmine.createSpy("parse").andReturn(scope)
				}
			};
		}
	},

	createjQueryEnv: function () {
		return function () {
			return createjQuery();
		}
	}
};