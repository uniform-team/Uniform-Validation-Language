export default class Tag {
    constructor(name, line, col, expression) {
        this.name = name;
        this.line = line;
        this.col = col;
        this.expression = expression;
    }
}
