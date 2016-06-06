var listeners = require("./listeners.js");

require("./env.js")(function (document, $) {
	var priv = {
		settings: {
			validateClient: true
		}
	};

	module.exports = {
		_priv: priv,

		// Send AJAX request to get ufm script and parse it
		href: function (href) {
			$.ajax({
				method: "GET",
				url: href
			}).then(function (data) {
				uniform.parser.parse(data);
			}, function (err) {
				console.log(err);
			});
		},

		// Refresh all elements
		refresh: function () {
			$(document).trigger(listeners.EVENTS.REFRESH);
		},

		// Reset the page and drop all internal data
		reset: function () {
			uniform.listeners.reset();
			uniform.lexer.reset();
			uniform.scope.reset();
			uniform.submit.reset();
		},

		// Get settings data
		getSettings: function () {
			return priv.settings;
		},

		// Set client to ignore form validation and submit the form regardless
		disableClientValidation: function () {
			priv.settings.validateClient = false;
		}
	};
});