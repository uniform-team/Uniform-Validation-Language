import Dependable from "../../src.es5/dependable.js";

beforeEach(function () {
    // Spy on global JavaScript APIs to prevent their default behavior
    if (globalObj.alert) spyOn(globalObj, "alert");
    
    // Spy on console to keep output clean
    spyOn(globalObj.console, "warn");
    
    // Spy on Jasmine's expect(...) in order to count how many times it is called in a particular test
    spyOn(globalObj, "expect").and.callThrough();
});

afterEach(function () {
    jQueryMap.reset();
});

globalObj.jasmineUtil = {
    // Return the number of expectations that were done in the current test
    get expectationCount() {
        return expect.calls.count();
    },
    
    // Spy on an object's property
    spyOnProp(obj, propName, accessType, cb) {
        // Get the property via reflection
        let prop = Object.getOwnPropertyDescriptor(obj, propName);
        let func = prop[accessType];
        
        // Spy on the property's getter or setter as specified
        let spy = spyOn(prop, accessType);
        
        // Redefine the property using the new spy
        Object.defineProperty(obj, propName, prop);
        
        // Invoke callback with spy
        cb(spy);
        
        // Clean up spy by resetting original property
        prop[accessType] = func;
        
        // Redefine the property with its old function
        Object.defineProperty(obj, propName, prop);
    },
    
    // Return a promise which is automatically resolved with the data given
    KeptPromise: function (data) {
        return new Promise((resolve) => resolve(data));
    },
    
    // Return a promise which is automatically rejected with the error given
    BrokenPromise: function (err) {
        return new Promise((resolve, reject) => reject(err));
    },
    
    // Return a new dependable with the given expression
    createDependable: function (expr = () => null) {
        const clazz = new Dependable();
        const dep = new clazz();
        dep.initDependable(expr);
        return dep;
    }
};