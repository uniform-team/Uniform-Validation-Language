import Scope from "./scope.js";
import Dependable from "./dependable.js";

/**
 * Abstract class representing a variable, either a block or expression.
 */
export class Variable {
    constructor(token) {
        this.name = token.value;
        this.line = token.line;
        this.col = token.col;
    }
}

/**
 * Class representing a block variable, one which contains a scope.
 *
 * Ex.
 * @myVariable {
 *     ...
 * }
 */
export class BlockVariable extends Variable {
    constructor(token, cb) {
        super(token);
        this.scope = new Scope(cb);
    }
}

/**
 * Class representing an expression variable, one which contains an expression
 * and can be used in others.
 * Mixes in Dependable.
 *
 * Ex.
 * @myVariable: true;
 * valid: @myVariable equals true;
 */
export class ExpressionVariable extends Dependable(Variable) {
    constructor(token) {
        super(token);
    }
}