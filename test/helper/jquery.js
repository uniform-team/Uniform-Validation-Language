// Create global jQuery mock
var $ = (function () {
	var mockFunc = function () {};

	// Create instance jQuery object
	var $obj = function (input) {
		this[0] = this;
		if (typeof input === "string") this.selector = input;
		else this.object = input;
	};
	
	// Return instance object whenever $(...) is executed
	var $jQuery = function (selector) {
		return new $obj(selector);
	};

	// Define instance jQuery object functions
	$obj.prototype = {
		append: mockFunc,
		trigger: mockFunc,
		attr: mockFunc,
		prop: mockFunc,
		find: mockFunc,
		is: mockFunc,
		on: mockFunc,
		off: mockFunc,
		show: mockFunc,
		hide: mockFunc,
		val: mockFunc,
		ufm: function () { return $jQuery.fn.ufm.apply(this); },
		each: function (cb) {
			for (var i = 0; i < this.length; ++i) {
				if (this[i]) cb(i, this[i]);
			}
		},
		__proto__: $jQuery
	};

	// Attach static jQuery attributes
	$jQuery.ajax = mockFunc;
	$jQuery.on = mockFunc;
	$jQuery.off = mockFunc;
	$jQuery.ready = mockFunc;
	$jQuery.fn = {};

	// Attach prototype to instance functions $(...).func() for mocking
	$jQuery.$mock = $obj.prototype;

	// Return mock to global variable
	return $jQuery;
}());