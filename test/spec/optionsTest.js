describe("The \"options\" module", function () {
	it("is exposed as an object", function () {
		expect(uniform.options).toEqual(jasmine.any(Object));
	});

	var options = uniform.options;

	var parser = uniform.parser;
	var listeners = uniform.listeners;
	var lexer = uniform.lexer;
	var scope = uniform.scope;
	var submit = uniform.submit;

	describe("exposes the \"href\" member", function () {
		it("as a function", function () {
			expect(options.href).toEqual(jasmine.any(Function));
		});

		describe("which sends an AJAX request for a Uniform script", function () {
			it("parsing it when successful", function () {
				var script = "$(\"#myForm\") { valid: true; }";

				spyOn($, "ajax").and.returnValue(new KeptPromise(script));
				spyOn(parser, "parse");

				options.href("myScript.ufm");

				expect(parser.parse).toHaveBeenCalled();
			});

			it("logging an error when unsuccessful", function () {
				var err = new Error("Uh oh");

				spyOn($, "ajax").and.returnValue(new BrokenPromise(err));

				options.href("myScript.ufm");

				expect(console.log).toHaveBeenCalledWith(err); // Log is automatically spied on to suppress output
			});
		});
	});

	describe("exposes the \"refresh\" member", function () {
		it("as a function", function () {
			expect(options.refresh).toEqual(jasmine.any(Function));
		});

		it("which triggers the \"" + listeners.EVENTS.REFRESH + "\" event", function () {
			spyOn($.$mock, "trigger");

			options.refresh();

			expect($.$mock.trigger).toHaveBeenCalledWith(listeners.EVENTS.REFRESH);
		});
	});

	describe("exposes the \"reset\" member", function () {
		it("as a function", function () {
			expect(options.reset).toEqual(jasmine.any(Function));
		});

		it("which invokes the reset function for other modules which require it", function () {
			spyOn(listeners, "reset");
			spyOn(lexer, "reset");
			spyOn(scope, "reset");
			spyOn(submit, "reset");

			options.reset();

			expect(listeners.reset).toHaveBeenCalled();
			expect(lexer.reset).toHaveBeenCalled();
			expect(scope.reset).toHaveBeenCalled();
			expect(submit.reset).toHaveBeenCalled();
		});
	});

	describe("exposes the \"getSettings\" member", function () {
		it("as a function", function () {
			expect(options.getSettings).toEqual(jasmine.any(Function));
		});

		it("which returns the settings data", function () {
			expect(options.getSettings()).toBe(options._priv.settings);
		});
	});

	describe("exposes the \"disableClientValidation\" member", function () {
		it("as a function", function () {
			expect(options.disableClientValidation).toEqual(jasmine.any(Function));
		});

		it("which sets the client validation setting to false", function () {
			options._priv.settings.validateClient = true; // Reset

			options.disableClientValidation();

			expect(options._priv.settings.validateClient).toBe(false);
		});
	});
});