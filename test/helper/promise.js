var KeptPromise = function (data) {
	this.data = data;
};

KeptPromise.prototype = {
	then: function (success) { success(this.data); }
};

var BrokenPromise = function (data) {
	this.data = data;
};

BrokenPromise.prototype = {
	then: function (success, failure) { failure(this.data); }
};