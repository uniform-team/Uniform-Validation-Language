let dependableSymbol = Symbol("dependable");
let dependents = Symbol("dependents");
let expression = Symbol("expression");

// Pseudo-constructor which implements the dependable interface onto the class given
let dependable = function (clazz) {
    // Inject the dependable prototype into the class prototype chain, directly before the Object prototype
    let lastPrototype = clazz.prototype;

    // Loop through the class' prototype chain, until it reaches Object
    while (lastPrototype.__proto__ !== Object.prototype) lastPrototype = lastPrototype.__proto__;

    // Found the last (meaningful) prototype, add dependable after it
    lastPrototype.__proto__ = dependable.prototype;
    
    return clazz;
};

// Pseudo-prototype which holds member functions for dependable classes
dependable.prototype = {
    // Initialize this dependable with the given expression
    initDependable: function (expr) {
        this[dependableSymbol] = true;
        this[dependents] = [];
        this[expression] = expr;
    },
    
    // Add the given object as dependent on this object
    addDependent: function (dependent) {
        this[dependents].push(dependent);
    },
    
    // Notify dependents that this object's value has changed
    trigger: function () {
        for (let dependent of this[dependents]) {
            dependent.update();
        }
    },

    // Update this object's value
    update: function () {
        this.value = this[expression]();
        this.trigger();
    }
};

// Expose internal symbols for testing / debugging purposes
dependable._dependentsSymbol = dependents;
dependable._expressionSymbol = expression;

// Determine if the given object is dependable (only works after its initDependable(...) has been called)
dependable.instanceof = function (obj) {
    return obj[dependableSymbol] === true;
};

export default dependable;