var listeners = require("./listeners.js");

module.exports = {
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
	refresh: function () {
		$(document).trigger(listeners.EVENTS.REFRESH);
	},
	resetParse: function () {
       uniform.parser.reset();
    }
};