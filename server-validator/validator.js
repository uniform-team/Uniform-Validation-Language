require("./jquery.js"); // Overload jQuery ($) operator
var ufm = require("../src/main.js");

module.exports = {
	validate: function (req, script) {
		return true;
	}
};