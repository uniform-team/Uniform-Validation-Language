beforeEach(function () {
    // Spy on global JavaScript APIs to prevent their default behavior
    spyOn(window, "alert");
    
    // Spy on Jasmine's expect(...) in order to count how many times it is called in a particular test
    spyOn(window, "expect").and.callThrough();
});

window.jasmineUtil = {
    // Return the number of expectations that were done in the current test
    get expectationCount() {
        return expect.calls.count();
    },
    
    // Spy on an object's property
    spyOnProp: function (obj, propName, accessType, cb) {
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
    }
};