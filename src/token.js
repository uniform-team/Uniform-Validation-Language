import constants from "./constants.js";

/**
 * Class representing a Uniform language Token with a name and value.
 */
export default class Token {
	// Construct a Token with the given information
	constructor(value, type, lineNumber = null, lineIndex = null) {
		if (value === undefined) throw new Error("Undefined Value in new Token");
		if (type === undefined) throw new Error("Undefined Type in new Token");
		
		this.value = value;
		this.type = type;
		this.line = lineNumber;
		this.col = lineIndex;
	}
	
	// Clone this Token into a new Token, replacing the value or type as given
	clone({ value = this.value, type = this.type, line = this.line, col = this.col } = {}) {
		return new Token(value, type, line, col);
	}
    
	// Return the jQuery selector for this Token
	getSelector() {
		return "[name=\"" + this.value + "\"]";
	}

	// Return whether or not this token is a tag
	isTag() {
		// Check each tag in constants for this one
		for (let tag in constants.TAG) {
			if (!constants.TAG.hasOwnProperty(tag)) continue;
			
			if (this.value === constants.TAG[tag]) {
				return true; // Found this value in constants, must be a tag
			}
		}
		
		// Could not find this value in constants, must not be a tag
		return false;
	}
	
	// Return whether or not this token is a comparator
	isComparator() {
		if (this.value === constants.OPERATOR.EQUALS) return true;
		if (this.value === constants.OPERATOR.MATCHES) return true;
		if (this.value === constants.OPERATOR.IS) return true;
		if (this.value === constants.OPERATOR.LT) return true;
		if (this.value === constants.OPERATOR.LTE) return true;
		if (this.value === constants.OPERATOR.GT) return true;
		if (this.value === constants.OPERATOR.GTE) return true;
		
		return false;
	}
	
	// Return whether or not this token is an operand
	isOperand() {
		if (this.type === constants.TYPE.IDENTIFIER) return true;
		if (this.type === constants.TYPE.BOOL) return true;
		if (this.type === constants.TYPE.NUMBER) return true;
		if (this.type === constants.TYPE.STRING) return true;
		if (this.type === constants.TYPE.REGEX) return true;
		if (this.type === constants.TYPE.VARIABLE) return true;
		if (this.type === constants.TYPE.SELECTOR) return true;
		if (this.value === constants.THIS) return true;
		if (this.isState()) return true;
		
		return false;
	}
	
	// Return whether or not this token is a state
	isState() {
		// Check each state in constants for this one
		for (let state in constants.STATE) {
			if (!constants.STATE.hasOwnProperty(state)) continue;
			
			if (this.value === constants.STATE[state]) {
				return true; // Found this value in constants, must be a state
			}
		}
		
		// Could not find this value in constants, must not be a state
		return false;
	}
	
	// Return this Token printed as a string
	toString() {
		return "Token(" + this.value + ", " + this.type + ")";
	}
};