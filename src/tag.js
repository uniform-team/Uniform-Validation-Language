import dependable from "./dependable.js";
import Scope from "./scope.js";

/**
 * Class representing a Tag which contains an expression.
 * Also implements the dependable interface.
 *
 * Ex.
 * valid: true;
 */
export default dependable(class Tag {
    // Construct a new Tag from a Token
    constructor(token) {
        this.name = token.value;
        this.line = token.line;
        this.col = token.col;
    }
    
    // Set the expression for this Tag and initializing the dependable interface with it
    setExpression(expression) {
        this.initDependable(expression);
	}
	
	update() {
	    super.update();
        
        if (Scope.rootScope.tags[this.name] === this) {
            // This tag is a root-level tag, trigger a jQuery update event for user-code
            $(document).trigger("ufm:update", [ this.name, this.value ]);
        }
    }
});