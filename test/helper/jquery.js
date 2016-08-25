// jQuery function
globalObj.$ = jasmine.createSpy("jQuery").and.callFake(function (sel) {
	return {
		sel: sel,
		__proto__: window.$.prototype
	}
});

// jQuery member functions
globalObj.$.prototype = {
	val: () => { },
	on: () => { },
    trigger: () => { }
};

// jQuery static functions
globalObj.$.ajax = () => { };