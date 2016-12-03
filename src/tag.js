import { document, $ } from "./env.js";
import constants from "./constants.js";
import Dependable from "./dependable.js";
import Identifier from "./identifier.js";
import { BlockVariable } from "./variable.js";
import Scope from "./scope.js";
import { TypeError, UndeclaredError, AssertionError } from "./errors.js";

// Mapping of tags to the expected types
const EXPECTED_TYPE = {
    [constants.TAG.VALID]: constants.TYPE.BOOL,
    [constants.TAG.ENABLED]: constants.TYPE.BOOL,
    [constants.TAG.VISIBLE]: constants.TYPE.BOOL,
    [constants.TAG.SELECTOR]: constants.TYPE.STRING,
    [constants.TAG.RESULT]: null // Any type
};

/**
 * Class representing a Tag which contains an expression.
 * Mixes in Dependable.
 *
 * Ex.
 * valid: true;
 */
export default class Tag extends Dependable() {
    // Construct a new Tag from a Token
    constructor(token, containingScope) {
        super();
        
        this.name = token.value;
        this.line = token.line;
        this.col = token.col;
        this.containingScope = containingScope;
    }
	
	update() {
	    super.update();
        
        const currentToken = this.value;
        if (!this.value) {
            return; // Wait for dependees to initialize
        }
	    
	    // Check that the actual type matches the one expected for this tag
        if (this.expectedType && currentToken.type !== this.expectedType) {
            throw new TypeError(`Tag "${this.name}" should be of type "${this.expectedType}"`
                + ` but was actually of type "${currentToken.type}".`, this.line, this.col);
        }
	    
	    // Update DOM element's visible or enabled state if necessary
	    if (this.name === constants.TAG.ENABLED || this.name === constants.TAG.VISIBLE) {
	        // Get the selector tag within the same scope
            const selectorTag = this.containingScope.findTag(constants.TAG.SELECTOR);
            
            // Extract selector string from the tag, or infer the selector
            let selector;
            if (selectorTag) { // Selector tag explicitly defined, use it
                const selectorToken = selectorTag.value;
                
                if (selectorToken.type !== constants.TYPE.STRING) {
                    throw new AssertionError(`Expected selector tag to be of type string,`
                            + `but it was actually of type ${selectorToken.type}`, this.line, this.col);
                }
                
                selector = selectorToken.value;
            } else { // Try to infer selector
                const owner = this.containingScope.owner;
                if (owner instanceof Identifier) { // Infer corresponding <input /> element as selector tag
                    selector = `[name="${owner.name}"]`;
                } else if (owner instanceof BlockVariable) { // Cannot infer BlockVariable selector
                    throw new UndeclaredError(`The variable @${owner.name} requires a selector tag in order to use`
                            + ` a(n) ${this.name} tag.`, this.line, this.col);
                } else {
                    throw new AssertionError(`Expected owner of tag "${this.name} " to be of type Identifier,`
                            + ` but it was of type ${typeof owner}.`, this.line, this.col);
                }
            }
            
            // Retrieve the boolean value to set
            const currentValue = currentToken.value;
            
            // Set the DOM UI state to match the UFM state
            const $selector = $(selector);
            if (this.name === constants.TAG.ENABLED) {
                if ($selector.is(":input")) {
                    // Element is an <input /> tag, update it directly
                    $selector.prop("disabled", !currentValue);
                } else {
                    // Selector is not an <input />, update all <input /> elements underneath it
                    $selector.find(":input").prop("disabled", !currentValue);
                }
            } else if (this.name === constants.TAG.VISIBLE) {
                // Show or hide the element
                if (currentValue) $selector.show();
                else $selector.hide();
            } else {
                throw new AssertionError(`Expected tag name to be "${constants.TAG.ENABLED}" or `
                        + `"${constants.TAG.VISIBLE}", but was actually "${this.name}".`);
            }
        }
        
        if (Scope.rootScope.tags[this.name] === this) {
            // This tag is a root-level tag, trigger a jQuery update event for user-code
            $(document).trigger("ufm:update", [ this.name, this.value ]);
        }
    }
    
    // Return the type which this tag's value SHOULD be
    get expectedType() {
        return EXPECTED_TYPE[this.name];
    }
}