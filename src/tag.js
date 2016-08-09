import constants from "./constants.js";

export default class Tag {
    constructor(name, expression, line, col) {
        this.name = name;
        this.expression = expression;
        this.line = line;
        this.col = col;
    }
}
