import Scope from "./scope.js";

export class Variable {
    constructor(name, line, col) {
        this.name = name;
        this.line = line;
        this.col = col;
    }
}

export class BlockVariable extends Variable {
    constructor(name, line, col, cb) {
        super(name, line, col);
        this.scope = new Scope(cb);
    }
}

export class ExpressionVariable extends Variable {
    constructor(name, line, col, expression) {
        super(name, line, col);
        this.expression = expression;
    }
}