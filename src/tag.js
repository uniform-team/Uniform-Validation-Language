import { document, $ } from "./env.js";
import constants from "./constants.js";
import Dependable from "./dependable.js";
import Scope from "./scope.js";
import { TypeError } from "./errors.js";

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
        
        const newToken = this.value;
        if (!this.value) {
            return; // Wait for dependees to initialize
        }
        
        // Check that the actual type matches the one expected for this tag
        if (this.expectedType && newToken.type !== this.expectedType) {
            throw new TypeError(`Tag "${this.name}" should be of type "${this.expectedType}"`
                + ` but was actually of type "${newToken.type}".`, this.line, this.col);
        }

        // Set the DOM UI state to match the UFM state
        if (this.name === constants.TAG.ENABLED) {
            Tag.updateEnabled(this.containingScope.getOrInferSelector().value, newToken.value);
        } else if (this.name === constants.TAG.VISIBLE) {
            Tag.updateVisible(this.containingScope.getOrInferSelector().value, newToken.value);
        }
        
        if (Scope.rootScope.tags[this.name] === this) {
            // This tag is a root-level tag, trigger a jQuery update event for user-code
            $(document).trigger("ufm:update", [ this.name, this.value ]);
        }
    }

    // Enable or disable the element if it is not overridden by a lower node in the DOM tree
    static updateEnabled(selector, newValue) {
        const $selector = $(selector);

        if ($selector.is(":input")) { // Element is an <input /> tag, update it directly
            $selector.prop("disabled", !newValue).attr("ufm-enabled", newValue);
        } else { // Selector is not an <input />, update all <input /> elements underneath it
            const updatedElement = $selector[0]; // Extract DOM element from jQuery for equality testing

            // Check each element for an overriding enabled expression
            $selector.find(":input").each(function (index, el) {
                const $input = $(el);

                // Walk up DOM tree from leaf to starting selector looking for any element which overrides the new value
                while (el !== updatedElement) {
                    const $el = $(el);
                    if ($el.is(`[ufm-enabled="${!newValue}"]`)) {
                        return; // Value is overridden by lower element, ignore it
                    }

                    // Move to parent element
                    el = $el.parent()[0];
                }

                // Value is not overridden by lower element, set to new value
                $input.prop("disabled", !newValue);
            });
        }
    }

    // Show or hide the element
    static updateVisible(selector, newValue) {
        if (newValue) $(selector).show();
        else $(selector).hide();
    }

    // Return the type which this tag's value SHOULD be
    get expectedType() {
        return EXPECTED_TYPE[this.name];
    }
}