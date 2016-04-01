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
		$(document).trigger("ufm:refresh");
	},
	resetParse: function () {
        $(document).trigger("ufm:resetParse");
    }
};