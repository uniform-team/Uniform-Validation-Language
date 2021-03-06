import { UfmError } from "../../src.es5/errors.js";

beforeEach(function () {
    jasmine.addMatchers({
        // Tests if two Tokens are equivalent
        toEqualToken: function (util, customEqualityTesters) {
            return {
                compare: function (actual, expected) {
                    // Check that the Tokens are equal
                    var result = {
                        pass: util.equals(actual.value, expected.value, customEqualityTesters)
                                && util.equals(actual.type, expected.type, customEqualityTesters)
                    };
                    if (result.pass) {
                        // Error message when .not.toEqualToken() fails
                        result.message = "Expected token " + actual + " not to equal " + JSON.stringify(expected);
                    } else {
                        // Error message when .toEqualToken() fails
                        result.message = "Expected token " + actual + " to equal " + JSON.stringify(expected);
                    }
                    
                    return result;
                }
            };
        },
        
        // Tests if a function throws a UfmError or one of its subtypes
        toThrowUfmError: function () {
            return {
                compare: function (actual, expected) {
                    // Check that actual is a function
                    if (typeof actual !== "function") {
                        return {
                            pass: false,
                            message: "Expected result to be a function, but it was " + actual
                        };
                    }
                    
                    // Assume UfmError if none is given
                    if (expected === undefined) expected = UfmError;
                    
                    try {
                        // Invoke the given function
                        actual();
                    } catch (err) {
                        // Check if error thrown is an instance of the type given
                        var result = {
                            pass: err instanceof expected
                        };
                        
                        if (result.pass) {
                            // Error message when .not.toThrowUfmError() fails
                            result.message = "Expected function not to throw " + expected.prototype.constructor.name;
                        } else {
                            // Error message when .toThrowUfmError() fails
                            result.message = "Expected function to throw " + expected.prototype.constructor.name +", but it threw " + err.constructor.name;
                        }
                        
                        return result;
                    }
                    
                    // Function did not throw an error, fail the test
                    return {
                        pass: false,
                        message: "Expected function to throw " + expected.prototype.constructor.name + ", but it did not throw any Error."
                    };
                }
            };
        },
        
        // Test whether or not a class extends another
        toExtend: function (util, customEqualityTesters) {
            return {
                compare: function (actual, expected) {
                    // Determine if actual class extends the expected class by checking the prototype
                    var result = {
                        pass: util.equals(actual.prototype, jasmine.any(expected), customEqualityTesters)
                    };
                    
                    if (result.pass) {
                        // Error message when .not.toExtend() fails
                        result.message = "Expected " + actual.prototype.constructor.name + " not to extend " + expected.prototype.constructor.name + ", but it did."
                    } else {
                        // Error message when .toExtend() fails
                        result.message = "Expected " + actual.prototype.constructor.name + " to extend " + expected.prototype.constructor.name + ", but it did not."
                    }
                    
                    return result;
                }
            };
        },
        
        // Test whether the given owning object contains a getter method on the specified property
        toHaveGetter: function () {
            return {
                compare: function (owner, prop) {
                    const getter = Object.getOwnPropertyDescriptor(owner, prop).get;
                    const result = {
                        pass: getter instanceof Function
                    };
                    
                    if (result.pass) {
                        // Error message when .not.toHaveGetter() fails
                        result.message = `Expected ${owner}["${prop}"] not to be a getter function.`;
                    } else {
                        // Error message when .toHaveGetter() fails
                        result.message = `Expected ${owner}["${prop}"] to be a getter function.`;
                    }
                    
                    return result;
                }
            };
        },
        
        // Test whether the given owning object contains a getter method on the specified property
        toHaveSetter: function () {
            return {
                compare: function (owner, prop) {
                    const setter = Object.getOwnPropertyDescriptor(owner, prop).set;
                    const result = {
                        pass: setter instanceof Function
                    };
            
                    if (result.pass) {
                        // Error message when .not.toHaveGetter() fails
                        result.message = `Expected ${owner}["${prop}"] not to be a setter function.`;
                    } else {
                        // Error message when .toHaveGetter() fails
                        result.message = `Expected ${owner}["${prop}"] to be a setter function.`;
                    }
                    
                    return result;
                }
            };
        }
    });
});