import * as env from "./env.js";
import Token from "./token.js";
import constants from "./constants.js";
import * as errors from "./errors.js";
import tokenizer from "./lexer.js";
import parser from "./parser.js";
import * as coerce from "./coerce.js";
import * as evaluator from "./evaluator.js";
import Scope from "./scope.js";
import { Variable, BlockVariable, ExpressionVariable } from "./variable.js";
import Tag from "./tag.js";
import { Identifier, BlockIdentifier, ExpressionIdentifier } from "./identifier.js";
import dependable from "./dependable.js";
import * as options from "./options.js";
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
    env,
    constants,
    errors,
    Token,
    tokenizer,
    parser,
    coerce,
    evaluator,
    Scope,
    Variable,
    BlockVariable,
    ExpressionVariable,
    Tag,
    Identifier,
    BlockIdentifier,
    ExpressionIdentifier,
    dependable,
    options,
    submit,
    
    get root() {
        return getRoot();
    }
};

// Initialize the Uniform runtime with the given document and jQuery values
function init(document, $) {
    env.init(document, $);
    Scope.init();
    submit.init();
    
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