// Create a type which can be extended but will also register as an Error
function ExtendableError(message) {
	this.name = this.constructor.name;
	this.message = message;
	this.stack = (new Error()).stack;
}
ExtendableError.prototype = Object.create(Error.prototype);
ExtendableError.prototype.constructor = ExtendableError;

// Create a super class for all Uniform errors
export class UfmError extends ExtendableError {
	constructor(msgOrError, line, col) {
		// Separate msgOrError into separate msg, error variables
		let msg, err;
		if (typeof msgOrError === "object") {
			msg = msgOrError.message;
			err = msgOrError;
		} else {
			msg = msgOrError;
			err = null;
		}
		
		super();
		
		this.name = this.constructor.name;
		if (line !== undefined) this.message = this.name + " (line " + line + ", col " + col + "): " + msg;
		else this.message = this.name + ": " + msg;
		this.lineNumber = line;
		this.colNumber = col;
		this.innerError = err;
	}
}

// Export custom error types
export class SyntaxError extends UfmError { }
export class ParsingError extends UfmError { }
export class AssertionError extends UfmError { }
export class TypeError extends UfmError { }