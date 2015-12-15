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
	}
};