import Scope from "./scope.js";

export default class Identifier {
	constructor(name, line, col, cb) {
		this.name = name;
		this.line = line;
		this.col = col;
		this.scope = new Scope(cb);
	}
};