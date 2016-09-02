import { document, $ } from "./env.js";
import Dependable from "./dependable.js";
import Scope from "./scope.js";

/**
 * Class representing a Tag which contains an expression.
 * Mixes in Dependable.
 *
 * Ex.
 * valid: true;
 */
export default class Tag extends Dependable() {
    // Construct a new Tag from a Token
    constructor(token) {
        super();
        
        this.name = token.value;
        this.line = token.line;
        this.col = token.col;
    }
	
	update() {
	    super.update();
        
        if (this.value && Scope.rootScope.tags[this.name] === this) {
            // This tag is a root-level tag, trigger a jQuery update event for user-code
            $(document).trigger("ufm:update", [ this.name, this.value ]);
        }
    }
}