var lexer = require("../../../src/lexer.js");

var jQuery = require("../../../src/validator/jquery.js");

describe("The \"jQuery\" module", function () {
	it("is exposed as a function", function () {
		expect(jQuery).toEqual(jasmine.any(Function));
	});

	describe("creates a new jQuery environment for the given request data", function () {
		var TYPE = lexer.TOKEN.TYPE;

		var data = {
			"#hasCar": [ { value: true, type: TYPE.BOOL } ],
			".names": [
				{ value: "Doug Parker", type: TYPE.STRING },
				{ value: "Sawyer Novak", type: TYPE.STRING }
			]
		};

		var $ = new jQuery(data);

		it("which can be queried for a particular selector", function () {
			expect($("#hasCar")[0]).toEqual(data["#hasCar"][0]);
		});

		it("which can be queried for a particular array selector", function () {
			var $names = $(".names");
			expect($names[0]).toEqual(data[".names"][0]);
			expect($names[1]).toEqual(data[".names"][1]);
		});

		it("which can be queried for a particular element", function () {
			var domEl = data["#hasCar"][0];
			expect($(domEl).object).toEqual(data["#hasCar"][0]);
		});

		describe("which exposes a \"value\" member", function () {
			it("as a function", function () {
				expect($("#hasCar").value).toEqual(jasmine.any(Function));
			});

			it("that returns its data when created from a particular element", function () {
				var domEl = data["#hasCar"][0];
				expect($(domEl).value()).toEqual(data["#hasCar"][0]);
			});

			it("that throws an error when called on an object created from a selector", function () {
				expect($("#hasCar").value).toThrow();
			});
		});

		describe("which exposes a \"type\" member", function () {
			it("as a function", function () {
				expect($("#hasCar").type).toEqual(jasmine.any(Function));
			});

			it("that returns its type when created from a particular element", function () {
				var domEl = data["#hasCar"][0];
				expect($(domEl).type()).toEqual(data["#hasCar"][0].type);
			});

			it("that throws an error when called on an object created from a selector", function () {
				expect($("#hasCar").value).toThrow();
			});
		});
	});
});