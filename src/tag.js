import dependable from "./dependable.js";

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
});