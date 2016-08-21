// jQuery function
window.$ = jasmine.createSpy("jQuery").and.callFake(function (sel) {
	return {
		sel: sel,
		__proto__: window.$.prototype
	}
});

// jQuery member functions
window.$.prototype = {
	val: () => { },
	on: () => { }
};

// jQuery static functions
window.$.on = () => { };