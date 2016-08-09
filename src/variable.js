import constants from "./constants.js";

export class Variable {
    constructor(name, line, col) {
        this.name = name;
        this.line = line;
        this.col = col;
    }
}

export class BlockVariable extends Variable {
    constructor(name, scope, line, col) {
        super(name, line, col);
        this.scope = scope;
    }
}

export class ExpressionVariable extends Variable {
    constructor(name, expression, line, col) {
        super(name, line, col);
        this.expression = expression;
    }
}