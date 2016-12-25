const initialized = Symbol("initialized");
const dependableSymbol = Symbol("dependable");
const dependents = Symbol("dependents");
const dependees = Symbol("dependees");
const expression = Symbol("expression");
const addDependent = Symbol("addDependent");
const addDependee = Symbol("addDependee");

// Factory which creates a new class that extends the one given with the Dependable functionality mixed in
let Dependable = (Clazz = class { }) => class extends Clazz {
    constructor(...args) {
        super(...args);
        
        this[dependableSymbol] = true;
        this[initialized] = false;
        this[dependents] = []; // Objects dependent on this item
        this[dependees] = []; // Objects which this item is dependent on
    }
    
    // Initialize this Dependable with the given expression
    initDependable(expr) {
        this[expression] = expr;
    }
    
    // Add the given object as dependent on this object
    [addDependent](dependent) {
        this[dependents].push(dependent);
    }
    
    // Make this object dependent on the one given
    [addDependee](dependee) {
        this[dependees].push(dependee);
    }
    
    // Notify dependents that this object's value has changed
    trigger() {
        for (let dependent of this[dependents]) {
            dependent.update();
        }
    }
    
    // Update this object's value
    update() {
        for (let dependee of this[dependees]) {
            if (!dependee[initialized]) {
                return; // Don't update unless all dependees are initialized
            }
        }
        
        this[initialized] = true;
        this.value = this[expression]();
        this.trigger();
    }
};

// Expose internal symbols for testing / debugging purposes
Dependable._initializedSymbol = initialized;
Dependable._dependentsSymbol = dependents;
Dependable._dependeesSymbol = dependees;
Dependable._expressionSymbol = expression;

// Determine if the given object is Dependable
Dependable.instanceof = function (obj) {
    return obj[dependableSymbol] === true;
};

// Create dependency relationship between the two Dependables
// When the dependee changes, the dependent is updated
Dependable.addDependency = function (dependent, dependee) {
    dependee[addDependent](dependent);
    dependent[addDependee](dependee);
};

export default Dependable;