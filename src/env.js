var doc, jQuery;

// Default doc to global document object
try {
	doc = document;
} catch (err) {
	doc = null;
}

// Default jQuery to global $ object
try {
	jQuery = $;
} catch (err) {
	jQuery = null;
}

// Return a function for injecting document and jQuery environment
module.exports = function (cb) {
	cb(doc, jQuery);
};

// Set the values for document and $ to be injected into codebase
module.exports.set = function (d, $) {
	doc = d;
	jQuery = $;
};