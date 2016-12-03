// jQuery function
globalObj.$ = jasmine.createSpy("jQuery").and.callFake(function (sel) {
	return {
		sel: sel,
		__proto__: window.$.prototype
	}
});

// jQuery member functions
const chainable = function() { return this; }; // Can't use () => this (syntax overrides `this` meaning)
globalObj.$.prototype = {
	attr: chainable,
	prop: chainable,
	val: chainable,
	on: chainable,
    find: chainable,
    trigger: chainable,
    is: () => { },
    show: () => { },
    hide: () => { },
	ready: (onReady) => onReady()
};

// jQuery static functions
globalObj.$.ajax = () => { };