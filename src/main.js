var priv = {
	browser: null,

	// Clear the require cache for a particular file
	clearRequireCache: function (file) {
		delete require.cache[require.resolve(file)];
	},

	// Clear require cache
	clearUfmRequireCache: function () {
		priv.clearRequireCache("./env.js");
		priv.clearRequireCache("./plugin.js");
		priv.clearRequireCache("./evaluator.js");
		priv.clearRequireCache("./parser.js");
		priv.clearRequireCache("./options.js");
		priv.clearRequireCache("./lexer.js");
		priv.clearRequireCache("./scope.js");
		priv.clearRequireCache("./listeners.js");
		priv.clearRequireCache("./submit.js");
	},

	// Initialize Uniform
	init: function () {
		return {
			plugin: require("./plugin.js"),
			evaluator: require("./evaluator.js"),
			parser: require("./parser.js"),
			options: require("./options.js"),
			lexer: require("./lexer.js"),
			scope: require("./scope.js"),
			listeners: require("./listeners.js"),
			submit: require("./submit.js"),
			env: require("./env.js")
		};
	}
};

// Determine if running in the browser or not
try {
	priv.browser = window ? true : false;
} catch (err) {
	priv.browser = false;
}

if (priv.browser) {
	// In browser environment, load Uniform immediately
	module.exports = priv.init();
	module.exports._priv = priv; // Expose private variables for testing purposes
	window.uniform = module.exports;
} else {
	// In NodeJS environment, return function to load Uniform
	module.exports = function (doc, $) {
		if (!priv.browser) priv.clearUfmRequireCache();

		// Set environment to use given doc and jQuery for injection
		require("./env.js").set(doc, $);

		// NOW load Uniform
		return priv.init();
	};
}