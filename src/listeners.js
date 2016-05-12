var EVENTS = {
	VALIDATE: "ufm:validate",
	REFRESH: "ufm:refresh",
	CHANGE: "change",
	NG_CHANGE: "ng-change"
};

//exposed for testing purposes only
var priv = {
	//refreshes the boolean value of the selector for each tag in the scope
	createRefreshListener: function (scope) {
		return function (self) {
			try {
				var selector = scope.selector.value;
				var $selector = $(selector).ufm();
				var prevState = $selector.getState();
				self = self || $selector;

				//enabled
				var enabledVal = scope.tagTable["enabled"].expression(self).value;
				$selector.enabled(enabledVal);
				if (enabledVal)
					$selector.prop("disabled", false);
				else
					$selector.prop("disabled", true);

				//visible
				var visibleVal = scope.tagTable["visible"].expression(self).value;
				$selector.visible(visibleVal);
				if (visibleVal)
					$selector.show();
				else
					$selector.hide();

				//optional
				var optionalVal = scope.tagTable["optional"].expression(self).value;
				$selector.optional(optionalVal);

				//valid
				$selector.valid(scope.tagTable["valid"].expression(self).value);

				console.log("Uniform tags for selector \"" + selector + "\" have been updated");

				// Only notify those dependent on $selector if its state has changed
				var nextState = $selector.getState();
				if (nextState.different(prevState)) {
					$selector.trigger(EVENTS.VALIDATE);
				}
			}
			catch (err) {
				console.error(err);
			}
		};
	},

	// Add a listener for the given event, filtered by the given selector, calling back to the given listener
	listeners: [],
	listen: function (evt, selector, listener) {
		var $document = $(document);
		if (listener === undefined) {
			// Selector was not passed in, callback is stored in "selector" argument
			listener = selector;
			selector = null;
			$document.on(evt, listener);
		} else {
			// Selector was passed in, add listener normally
			$document.on(evt, selector, listener);
		}

		// Track each listener added so it can be removed later
		priv.listeners.push({
			evt: evt,
			selector: selector,
			func: listener
		});
	}
};

module.exports = {
	EVENTS: EVENTS,

	// Initialize global event listeners
	init: function () {
		// Refresh all controls on document ready by default
		var $document = $(document);
		$document.ready(function () {
			$document.trigger(EVENTS.REFRESH);
		});

		// Call validate on any element that changes
		var onChange = function (evt) {
			$(evt.target).trigger(EVENTS.VALIDATE);
		};
		priv.listen(EVENTS.CHANGE, onChange);
		priv.listen(EVENTS.NG_CHANGE, onChange); // AngularJS support
	},

	// Update the given scope when its selector changes
	updateOnChange: function (scope) {
		var sel = scope.selector.value;

		// Generate event listeners for the given scope
		var refresh = priv.createRefreshListener(scope);
		var onChange = function (evt) {
			var $target = $(evt.target).ufm();

			// Check that this element is the one that changed, not a child
			if ($target.is(sel)) {
				refresh($target);
			}
		};

		// Update the given scope's states when it changes
		priv.listen("change", sel, onChange);
		priv.listen("ng-change", sel, onChange); // Angular support
	},

	// Update the given scope when the document refreshes
	updateOnRefresh: function (scope) {
		var refresh = priv.createRefreshListener(scope);

		// Listen for document to refresh
		priv.listen(EVENTS.REFRESH, function () {
			refresh(); // Wrap in anonymous function to avoid passing event
		});
	},

	// Update the given scope when ANY DOM element validates, useful when there is no way to identify individual
	// dependencies such as those hidden within the dot operator
	updateOnAllValidations: function (scope) {
		var refresh = priv.createRefreshListener(scope);

		// Listen for any validate event
		priv.listen(EVENTS.VALIDATE, function (evt) {
			var $self = $(scope.selector.value);
			var $target = $(evt.target);

			// Don't allow element to trigger update on itself
			if ($self[0] !== $target[0]) {
				refresh($self.ufm());
			}
		});
	},

	// Setup a dependency where the given scope listens for changes in the dependent to refresh itself
	setDependency: function (dependent, scope) {
		if (dependent === scope.selector.value) return; // Ignore if trying to set a selector to be dependent on itself

		// Add event listener for scope to update when the dependent triggers validate
		var refresh = priv.createRefreshListener(scope);
		priv.listen(EVENTS.VALIDATE, dependent, function () {
			var selector = scope.selector.value;

			// Refresh scope
			console.log("$(\"" + dependent + "\") is updating $(\"" + selector + "\").");
			refresh($(selector).ufm());
		});
	},

	// Remove the existing event listeners to clear all existing Uniform logic
	reset: function () {
		var $document = $(document);

		// Remove each previously placed event listener
		while (priv.listeners.length > 0) {
			var listener = priv.listeners.pop();
			$document.off(listener.evt, listener.selector, listener.func);
		}
	},

	// Expose private variables for testing access
	_priv: priv
};