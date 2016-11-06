// jQuery function
globalObj.$ = jasmine.createSpy("jQuery").and.callFake(function (sel) {
	return {
		sel: sel,
		__proto__: window.$.prototype
	}
});

// jQuery member functions
globalObj.$.prototype = {
	attr: () => { },
	val: () => { },
    is: () => { },
	on: () => { },
    trigger: () => { },
	ready: (onReady) => onReady()
};

// jQuery static functions
globalObj.$.ajax = () => { };