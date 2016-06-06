var lexer = require("../lexer.js");

// Constructor for a mock of a client-side jQuery object
function jQuery(input, fn) {
	// Link to plugin functions
	this.fn = fn;
	
	if (typeof input === "object") { // $(<DOMElement>)
		this.object = input;
	} else { // $("selector")
		this.selector = input;
	}
}

// jQuery prototype functions
var mockFunc = function () { };
jQuery.prototype = {
	// Extend Array type
	__proto__: Array.prototype,

	// Overload type to return the one given by the client
	type: function () {
		if (!this.object) throw new Error("Cannot get type of jQuery object created by a selector");

		return this.object.type;
	},

	// Overload value to return the one given by the client
	value: function (token) {
		if (!this.object) throw new Error("Cannot get value of jQuery object created by a selector");

		var line = token && token.line;
		var col = token && token.col;

		return new lexer.Token(this.object.value, this.object.type, line, col);
	},

	// Invoke plugin for Uniform language
	ufm: function () {
		return this.fn.ufm.apply(this);
	},

	// Mock jQuery functions to avoid errors
	val: mockFunc,
	attr: mockFunc,
	ready: mockFunc,
	trigger: mockFunc,
	prop: mockFunc,
	find: mockFunc,
	is: mockFunc,
	on: mockFunc,
	off: mockFunc,
	show: mockFunc,
	hide: mockFunc
};

// Constructor for a mock of a client-side DOMElement object
function DOMElement(value, type) {
	this.value = value;
	this.type = type;
}

// Constructor for a new jQuery environment, returns the function to create a jQuery object $(...)
// which pulls all its data from the client's request
// There should be one environment for every request to validate
function jQueryEnv(reqData) {
	// Wrap individual jQuery object constructor to use request data
	var jq = function (input) {
		if (typeof input === "object") { // $(<DOMElement>)
			return new jQuery(input, jq.fn);
		}

		// $("selector")
		// Get all data for the given selector from the original request
		var selector = input;
		var selData = reqData[selector] || [ ];
		var $arr = new jQuery(selector, jq.fn);
		selData.forEach(function (input) {
			$arr.push(new DOMElement(input.value, input.type));
		});

		return $arr;
	};

	// Attach global properties
	jq.fn = { };
	jq.ajax = mockFunc;

	// Return function to create a specific jQuery object $(...)
	return jq;
}

module.exports = jQueryEnv;