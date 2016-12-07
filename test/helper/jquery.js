globalObj.DomElem = class {
    // Empty class
};

// Mapping of jQuery selectors to their respective DOMElements
globalObj.jQueryMap = new class {
    constructor() {
        this.reset();
    }

    get(selector) {
        return this.map[selector];
    }

    put(selector, domElements) {
        this.map[selector] = domElements;
    }

    reset() {
        this.map = { };
    }
};

// jQuery function
globalObj.$ = jasmine.createSpy("jQuery").and.callFake(function (selOrEl) {
    if (typeof selOrEl === "string") {
        const elements = globalObj.jQueryMap.get(selOrEl) || { };

        // Set selector and jQuery prototype
        elements.sel = selOrEl;
        elements.__proto__ = globalObj.$.prototype;

        return elements;
    } else if (selOrEl instanceof globalObj.DomElem || selOrEl === globalObj.document) {
        return {
            0: selOrEl,
            __proto__: globalObj.$.prototype
        };
    } else {
        throw new Error("Tried to create jQuery object from " + selOrEl + ". Can only create a jQuery instance from a"
                + " string selector or DomEl object.");
    }
});

// jQuery member functions
const chainable = function() { return this; }; // Can't use () => this (syntax overrides `this` meaning)
const callback = (cb) => cb();
globalObj.$.prototype = {
	attr: chainable,
	prop: chainable,
	val: chainable,
	on: chainable,
    find: chainable,
    parent: chainable,
    trigger: chainable,
    is: () => { },
    show: () => { },
    hide: () => { },
    each: callback,
	ready: callback
};

// jQuery static functions
globalObj.$.ajax = () => { };