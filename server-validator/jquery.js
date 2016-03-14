global.$ = function (str) {
	console.log(str);
	return {
		on: function () {
			return this;
		},
		ufm: function () {
			this.valid = function () {
				// Do nothing
			};
			this.enabled = function () {
				// Do nothing
			};
			this.visible = function () {
				// Do nothing
			};
			this.optional = function () {
				// Do nothing
			};
			return this;
		}
	}
};