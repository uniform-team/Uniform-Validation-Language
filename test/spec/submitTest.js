describe("The \"submit\" module", function () {
	it("is defined as an object", function () {
		expect(uniform.submit).toEqual(jasmine.any(Object));
	});

	var lexer = uniform.lexer;
	var submit = uniform.submit;

	describe("exposes the \"init\" member", function () {
		it("as a function", function () {
			expect(submit.init).toEqual(jasmine.any(Function));
		});

		it("which attaches the form submission event listener", function () {
			spyOn($.$mock, "on");

			submit.init();

			expect($.$mock.on).toHaveBeenCalledWith("submit", "form", jasmine.any(Function));
		});
	});

	describe("exposes the \"ajax\" member", function () {
		it("as a function", function () {
			expect(submit.ajax).toEqual(jasmine.any(Function));
		});

		it("which sends an AJAX request with the given options and Uniform encoded data", function () {
			var options = {
				method: "POST",
				url: "/submit"
			};
			var data = {
				"#hasCar": [ { value: true, type: "boolean" } ]
			};

			spyOn($, "ajax");
			spyOn(submit._priv, "buildSelectorMap").and.returnValue(data);

			submit.ajax(options);

			expect(options.data).toBe("ufm=" + JSON.stringify(data));
			expect($.ajax).toHaveBeenCalledWith(options);
		});
	});

	describe("exposes the \"reset\" member", function () {
		it("as a function", function () {
			expect(submit.reset).toEqual(jasmine.any(Function));
		});
		
		it("which detaches the form submission event listener", function () {
			spyOn($.$mock, "off");
			
			submit.reset();
			
			expect($.$mock.off).toHaveBeenCalledWith("submit", "form", jasmine.any(Function));
		});
	});

	describe("exposes the \"mark\" member", function () {
		it("as a function", function () {
			expect(submit.mark).toEqual(jasmine.any(Function));
		});

		it("which marks selectors which need to be sent", function () {
			submit._priv.selectorsToSend = []; // Reset

			submit.mark("#mySelector");
			submit.mark(".myOtherSelector");

			expect(submit._priv.selectorsToSend.length).toBe(2);
			expect(submit._priv.selectorsToSend[0]).toBe("#mySelector");
			expect(submit._priv.selectorsToSend[1]).toBe(".myOtherSelector");
		});
	});

	describe("listens for form submission", function () {
		it("and sends valid Uniform data to the server", function () {
			var event = {
				target: "#myForm",
				preventDefault: jasmine.createSpy("preventDefualt")
			};
			var selectorMap = {
				"#make": [ "Mitsubishi" ],
				"#model": [ "Eclipse" ],
				"#year": [ 2006 ]
			};
			var form = { submit: jasmine.createSpy("submit") };

			spyOn($.$mock, "attr").and.callFake(function (key) {
				switch (key) {
					case "ufm-submit": return undefined; // Not the recursive case
					case "ufm-valid": return "true"; // Form is valid
					case "method": return "POST"; // Submission is POST
					case "action": return "/submit"; // Url is /submit
					default: throw new Error("Unknown attribute \"" + key + "\".");
				}
			});
			spyOn(uniform.options, "getSettings").and.returnValue({ validateClient: true });
			spyOn(submit._priv, "buildSelectorMap").and.returnValue(selectorMap);
			spyOn(submit._priv, "buildSubmitForm").and.returnValue(form);

			submit._priv.onSubmit(event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(submit._priv.buildSelectorMap).toHaveBeenCalled();
			expect(submit._priv.buildSubmitForm).toHaveBeenCalledWith("POST", "/submit", selectorMap);
			expect(form.submit).toHaveBeenCalled();
		});

		it("and alerts the user on invalid data", function () {
			var event = {
				target: "#myForm",
				preventDefault: jasmine.createSpy("preventDefualt")
			};

			spyOn($.$mock, "attr").and.callFake(function (key) {
				switch (key) {
					case "ufm-submit": return undefined; // Not the recursive case
					case "ufm-valid": return "false"; // Form is invalid
					default: throw new Error("Unknown attribute \"" + key + "\".");
				}
			});
			spyOn(uniform.options, "getSettings").and.returnValue({ validateClient: true });
			spyOn(submit._priv, "buildSelectorMap");
			spyOn(submit._priv, "buildSubmitForm");
			spyOn(window, "alert");

			submit._priv.onSubmit(event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(submit._priv.buildSelectorMap).not.toHaveBeenCalled();
			expect(submit._priv.buildSubmitForm).not.toHaveBeenCalled();
			expect(window.alert).toHaveBeenCalled();
		});

		it("and sends invalid data if set to do so", function () {
			var event = {
				target: "#myForm",
				preventDefault: jasmine.createSpy("preventDefualt")
			};
			var selectorMap = {
				"#make": [ "Mitsubishi" ],
				"#model": [ "Eclipse" ],
				"#year": [ 2006 ]
			};
			var form = { submit: jasmine.createSpy("submit") };

			spyOn($.$mock, "attr").and.callFake(function (key) {
				switch (key) {
					case "ufm-submit": return undefined; // Not the recursive case
					case "ufm-valid": return "false"; // Form is invalid
					case "method": return "POST"; // Submission is POST
					case "action": return "/submit"; // Url is /submit
					default: throw new Error("Unknown attribute \"" + key + "\".");
				}
			});
			spyOn(uniform.options, "getSettings").and.returnValue({ validateClient: false }); // Ignore client errors
			spyOn(submit._priv, "buildSelectorMap").and.returnValue(selectorMap);
			spyOn(submit._priv, "buildSubmitForm").and.returnValue(form);

			submit._priv.onSubmit(event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(submit._priv.buildSelectorMap).toHaveBeenCalled();
			expect(submit._priv.buildSubmitForm).toHaveBeenCalledWith("POST", "/submit", selectorMap);
			expect(form.submit).toHaveBeenCalled();
		});

		it("and builds a selector map of the form's data", function () {
			submit._priv.selectorsToSend = [ "#myForm", "#make", "#model", "#year" ];

			var myFormToken = new lexer.Token({
				valid: true,
				visible: true,
				enabled: true,
				optional: false
			}, lexer.TOKEN.TYPE.STATE_OBJECT);
			var makeToken = new lexer.Token("Mitsubishi", lexer.TOKEN.TYPE.STRING);
			var modelToken = new lexer.Token("Eclipse", lexer.TOKEN.TYPE.STRING);
			var yearToken = new lexer.Token(2006, lexer.TOKEN.TYPE.NUMBER);

			$.$mock.value = function () {
				switch (this.object.selector) {
					case "#myForm": return myFormToken;
					case "#make": return makeToken;
					case "#model": return modelToken;
					case "#year": return yearToken;
					default: throw new Error("Unknown selector \"" + this.object.selector + "\"");
				}
			};

			var selMap = submit._priv.buildSelectorMap();

			expect(selMap).toEqual({
				"#myForm": [ myFormToken ],
				"#make": [ makeToken ],
				"#model": [ modelToken ],
				"#year": [ yearToken ]
			});
		});

		it("and builds a new form to submit the encoded data", function () {
			var data = { foo: "bar" };

			spyOn($.$mock, "attr");
			spyOn($.$mock, "val");
			spyOn($.$mock, "append");

			var form = submit._priv.buildSubmitForm("POST", "/submit", data);

			expect($.$mock.attr).toHaveBeenCalledWith("method", "POST");
			expect($.$mock.attr).toHaveBeenCalledWith("action", "/submit");
			expect($.$mock.val).toHaveBeenCalledWith(JSON.stringify(data));
			expect($.$mock.append).toHaveBeenCalled();

			expect($.$mock.append.calls.mostRecent().args[0]).$toEqual($("<input type=\"hidden\" name=\"ufm\" />"));
			expect(form).$toEqual($("<form ufm-submit=\"true\"></form>"));
		});
	});
});