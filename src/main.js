import * as env from "./env.js";
import constants from "./constants.js";
import Token from "./token.js";
import parser from "./parser.js";
import Identifier from "./identifier.js";
import * as options from "./options.js";
import * as errors from "./errors.js";
import Scope from "./scope.js";
import submit from "./submit.js";
import getRoot from "./root.js";

// Determine if running in the browser or not
let browser;
try {
    browser = window ? true : false;
} catch (err) {
    browser = false;
}

let uniform = {
    constants,
    Token,
    parser,
    options,
    errors,
    
    get root() {
        return getRoot();
    }
};

// Initialize the Uniform runtime with the given document and jQuery values
function init(document, $) {
    // Wait until DOM is loaded before initializing values
    env.init(document, $);
    env.$(env.document).ready(function () {
        Identifier.init();
        Scope.init();
        submit.init();
    });
    
    return uniform;
}

// Create global Uniform object
if (browser) {
    // Running in browser, initialize immediately using document and jQuery provided by window
    init();
    
    // Export Uniform object to global variable or module depending on usage
    // Must use `module.exports` here instead of `export default` due to Webpack issue
    // https://github.com/webpack/webpack/issues/706
    module.exports = uniform;
} else {
    // Running in Node, return function to initialize so the server can inject a document and jQuery
    module.exports = init;
}