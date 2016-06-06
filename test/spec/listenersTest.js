describe("The \"listeners\" module", function () {
	it("is exposed as an object", function () {
		expect(uniform.listeners).toEqual(jasmine.any(Object));
	});

	var listeners = uniform.listeners;
	var EVENTS = listeners.EVENTS;

	// Create a mocked scope for the given selector
	var mockScope = function (sel) {
		var mockToken = { value: true };
		var mockExpr = { expression: function () { return mockToken } };

		return {
			selector: {
				value: sel
			},
			tagTable: {
				valid: mockExpr,
				enabled: mockExpr,
				visible: mockExpr,
				optional: mockExpr
			}
		};
	};

	describe("exposes the \"init\" member", function () {
		it("as a function", function () {
			expect(listeners.init).toEqual(jasmine.any(Function));
		});
		
		it("which triggers \"" + EVENTS.REFRESH + "\" on the $(document) when ready", function () {
			spyOn($.$mock, "ready").and.callFake(function (onReady) {
				onReady();
			});
			spyOn($.$mock, "trigger");

			listeners.init();

			expect($.$mock.trigger).toHaveBeenCalledWith(EVENTS.REFRESH); // Callback should have triggered "ufm:refresh"
		});

		it("which triggers \"" + EVENTS.VALIDATE + "\" on an element when changed", function () {
			spyOn($.$mock, "on").and.callFake(function (evt, listener) {
				listener({ target: "#selector" }); // Automatically execute callback given to on()
			});
			spyOn($.$mock, "trigger");

			listeners.init();

			expect($.$mock.on).toHaveBeenCalledWith(EVENTS.CHANGE, jasmine.any(Function));
			expect($.$mock.on).toHaveBeenCalledWith(EVENTS.NG_CHANGE, jasmine.any(Function));
			expect($.$mock.trigger).toHaveBeenCalledWith(EVENTS.VALIDATE); // Callback should have triggered "ufm:validate"
		});
	});

	describe("exposes the \"updateOnChange\" member", function () {
		it("as a function", function () {
			expect(listeners.updateOnChange).toEqual(jasmine.any(Function));
		});

		it("which refreshes the given scope when its selector changes", function () {
			var sel = "#selector";
			var scope = mockScope(sel);

			var refresh = jasmine.createSpy("refresh");
			spyOn(listeners._priv, "createRefreshListener").and.returnValue(refresh);
			spyOn($.$mock, "on").and.callFake(function (evt, target, listener) {
				listener({ target: target }); // Immediately trigger listener on correct selector
			});
			spyOn($.$mock, "is").and.returnValue(true);

			listeners.updateOnChange(scope);

			expect(listeners._priv.createRefreshListener).toHaveBeenCalledWith(scope);
			expect($.$mock.on).toHaveBeenCalledWith(EVENTS.CHANGE, sel, jasmine.any(Function));
			expect($.$mock.on).toHaveBeenCalledWith(EVENTS.NG_CHANGE, sel, jasmine.any(Function));
			expect(refresh.calls.mostRecent().args[0]).$toEqual($(sel));
		});

		it("which does NOT refresh the current scope when a different selector changes", function () {
			var sel = "#selector";
			var scope = mockScope(sel);

			var refresh = jasmine.createSpy("refresh");
			spyOn(listeners._priv, "createRefreshListener").and.returnValue(refresh);

			spyOn($.$mock, "on").and.callFake(function (evt, target, listener) {
				listener({ target: "#sel" }); // Immediately trigger listener on incorrect selector
			});
			spyOn($.$mock, "is").and.returnValue(false);

			listeners.updateOnChange(scope);

			expect(listeners._priv.createRefreshListener).toHaveBeenCalledWith(scope);
			expect($.$mock.on).toHaveBeenCalledWith(EVENTS.CHANGE, sel, jasmine.any(Function));
			expect($.$mock.on).toHaveBeenCalledWith(EVENTS.NG_CHANGE, sel, jasmine.any(Function));
			expect(refresh).not.toHaveBeenCalled();
		});
	});

	describe("exposes the \"updateOnRefresh\" member", function () {
		it("as a function", function () {
			expect(listeners.updateOnRefresh).toEqual(jasmine.any(Function));
		});

		it("which updates the given scope when the document is refreshed", function () {
			var scope = mockScope("#selector");

			var refresh = jasmine.createSpy("refresh");
			spyOn(listeners._priv, "createRefreshListener").and.returnValue(refresh);

			spyOn($.$mock, "on").and.callFake(function (evt, listener) {
				listener(); // Immediately trigger listener
			});

			listeners.updateOnRefresh(scope);

			expect(listeners._priv.createRefreshListener).toHaveBeenCalledWith(scope);
			expect($.$mock.on).toHaveBeenCalledWith("ufm:refresh", jasmine.any(Function));
			expect(refresh).toHaveBeenCalled()
		});
	});

	describe("exposes the \"updateOnAllValidations\" member", function () {
		it("as a function", function () {
			expect(listeners.updateOnAllValidations).toEqual(jasmine.any(Function));
		});

		it("which refreshes the given scope when the $(document) triggers \"" + EVENTS.VALIDATE + "\"", function () {
			var sel = "#selector";
			var scope = mockScope(sel);

			var refresh = jasmine.createSpy("refresh");
			spyOn(listeners._priv, "createRefreshListener").and.returnValue(refresh);

			spyOn($.$mock, "on").and.callFake(function (evt, listener) {
				listener({ target: "#other" }); // Immediately invoke listener with different target
			});

			listeners.updateOnAllValidations(scope);

			expect(listeners._priv.createRefreshListener).toHaveBeenCalledWith(scope);
			expect($.$mock.on).toHaveBeenCalledWith(EVENTS.VALIDATE, jasmine.any(Function));
			expect(refresh.calls.mostRecent().args[0]).$toEqual($(sel));
		});
	});

	describe("exposes the \"setDependency\" member", function () {
		it("as a function", function () {
			expect(listeners.setDependency).toEqual(jasmine.any(Function));
		});

		it("which sets up an event listener so the given scope updates itself when the dependent validates", function () {
			var sel = "#selector";
			var dependent = "#dependent";
			var scope = mockScope(sel);

			var refresh = jasmine.createSpy("refresh");
			spyOn(listeners._priv, "createRefreshListener").and.returnValue(refresh);

			spyOn($.$mock, "on").and.callFake(function (evt, selector, listener) {
				listener(); // Immediately trigger listener
			});

			listeners.setDependency(dependent, scope);

			expect(listeners._priv.createRefreshListener).toHaveBeenCalledWith(scope);
			expect($.$mock.on).toHaveBeenCalledWith(EVENTS.VALIDATE, dependent, jasmine.any(Function));
			expect(refresh.calls.mostRecent().args[0]).$toEqual($(sel));
		});
	});

	describe("exposes the \"reset\" member", function () {
		it("as a function", function () {
			expect(listeners.reset).toEqual(jasmine.any(Function));
		});

		it("which removes all previously set event listeners", function () {
			var listen = listeners._priv.listen;

			var firstArgs = {
				event: "myEvent",
				selector: "#selector",
				listener: function () { }
			};
			var secondArgs = {
				event: "myOtherEvent",
				listener: function () { }
			};

			spyOn($.$mock, "off");

			listeners._priv.listeners = []; // Reset

			listen(firstArgs.event, firstArgs.selector, firstArgs.listener);
			listen(secondArgs.event, secondArgs.listener);

			listeners.reset();

			expect($.$mock.off).toHaveBeenCalledWith(firstArgs.event, firstArgs.selector, firstArgs.listener);
			expect($.$mock.off).toHaveBeenCalledWith(secondArgs.event, null, secondArgs.listener);
		});
	});
});