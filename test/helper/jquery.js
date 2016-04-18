// Create global jQuery mock
var $ = (function () {
	var mockFunc = function () {};

	// Create instance jQuery object
	var $obj = function (selector) {
		this.selector = selector
	};

	// Define instance jQuery object functions
	$obj.prototype = {
		ready: mockFunc,
		trigger: mockFunc,
		attr: mockFunc,
		prop: mockFunc,
		find: mockFunc,
		is: mockFunc,
		on: mockFunc,
		off: mockFunc,
		show: mockFunc,
		hide: mockFunc,
		ufm: function () { return $jQuery.fn.ufm.apply(this); }
	};

	// Return instance object whenever $(...) is executed
	var $jQuery = function (selector) {
		return new $obj(selector);
	};

	// Attach static jQuery attributes
	$jQuery.on = mockFunc;
	$jQuery.off = mockFunc;
	$jQuery.fn = {};

	// Return mock to global variable
	return $jQuery;
}());

// Create mock for an individual selector, created later, which can be used for spies
// Usage:
// jQuerySpy(function ($mock) {
//     spyOn($mock, "attr").and.returnValue("test");
// });
//
// expect($("#blarg").attr()).toBe("test");
var jQuerySpy = function (cb) {
	var $mock = $();

	// Call back with mock
	cb($mock);

	// Attach mock to global $ operator
	spyOn(window, "$").and.callFake(function (sel) {
		var $el = {
			selector: sel,
			__proto__: $mock
		};
		$el[0] = $el; // Loop first object into itself for array evaluation
		return $el;
	});
};