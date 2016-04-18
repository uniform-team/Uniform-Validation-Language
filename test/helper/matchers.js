// Create custom Jasmine matchers
beforeEach(function () {
	jasmine.addMatchers({
		// Equivalence matcher for jQuery objects
		// Usage: expect($("#sel")).$toEqual($("#sel"))
		//        expect($("#sel")).not.$toEqual($("#sel2"))
		$toEqual: function () {
			return {
				compare: function ($self, $other) {
					var result = {
						pass: $self.selector === $other.selector
					};

					// Error messages for $toEqual() and not.$toEqual()
					if (result.pass) {
						result.message = "Expected $(\"" + $self.selector + "\") not to equal $(\"" + $other.selector + "\")";
					} else {
						result.message = "Expected $(\"" + $self.selector + "\") to equal $(\"" + $other.selector + "\")";
					}

					return result;
				}
			};
		}
	});
});