var lexer = require("./lexer.js");
var options = require("./options.js");

require("./env.js")(function (document, $) {
	var priv = {
		selectorsToSend: [],

		// Builds and returns a new $(<form>) element for the method, url, and data given sent in UFM format
		buildSubmitForm: function (method, url, data) {
			// Create a new form to submit data
			var $submitForm = $("<form ufm-submit=\"true\"></form>");

			// Copy data from form to be submitted
			$submitForm.attr("method", method);
			$submitForm.attr("action", url);

			// Add Uniform input
			var $submitInput = $("<input type=\"hidden\" name=\"ufm\" />");
			$submitInput.val(JSON.stringify(data));
			$submitForm.append($submitInput);

			return $submitForm;
		},

		// Builds and returns a map of all selectors which must be sent and their values
		buildSelectorMap: function () {
			// Map selectors to their values
			var selMap = {};
			priv.selectorsToSend.forEach(function (sel) {
				var values = [];
				$(sel).each(function (index, el) {
					values.push($(el).ufm().value());
				});

				// Only send selectors with data
				if (values.length > 0) selMap[sel] = values;
			});

			return selMap;
		},

		// Define function to execute when the user submits
		onSubmit: function (evt) {
			// Get the submitting form
			var $form = $(evt.target).ufm();

			// Don't submit the form normally
			if ($form.attr("ufm-submit") === "true") {
				return; // Uniform is submitting (recursive case), allow it
			} else {
				evt.preventDefault(); // User is submitting, block and check if valid
			}

			// Check if form is valid
			var settings = options.getSettings();
			if (settings.validateClient && !$form.valid()) {
				alert("Invalid Form!");
				return;
			}

			// Submit the data to the server
			var method = $form.attr("method");
			var url = $form.attr("action");
			var selMap = priv.buildSelectorMap();
			priv.buildSubmitForm(method, url, selMap).submit(); // This recursively fires this onSubmit event, must be explicitly allowed
		}
	};

	var $document = $(document);
	module.exports = {
		// Expose testing values
		_priv: priv,

		// Initialize the submit module on the current page
		init: function () {
			// Create listener for any submitted form
			$document.on("submit", "form", priv.onSubmit);
		},

		// Mark the given selector as one to send to the server when the user submits
		mark: function (sel) {
			priv.selectorsToSend.push(sel);
		},

		// Remove submit listener to reset internal logic
		reset: function () {
			$document.off("submit", "form", priv.onSubmit);
		}
	};

	// Automatically initialize
	module.exports.init();
});