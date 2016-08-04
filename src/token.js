var constants = require("./constants.js");

// Token class
function Token(value, type, lineNumber, lineIndex) {
	if (value === undefined) throw new Error("Undefined Value in new Token");
	if (type === undefined) throw new Error("Undefined Type in new Token");
	
	this.value = value;
	this.type = type;
	this.line = lineNumber;
	this.col = lineIndex;
}

// Token member functions
Token.prototype = {
	// Return whether or not this token is a tag
	isTag: function () {
		// Check each tag in constants for this one
		for (var tag in constants.TAG) {
			if (!constants.TAG.hasOwnProperty(tag)) continue;
			
			if (this.value === constants.TAG[tag]) {
				return true; // Found this value in constants, must be a tag
			}
		}
		
		// Could not find this value in constants, must not be a tag
		return false;
	},
	
	// Return whether or not this token is a comparator
	isComparator: function () {
		if (this.value === constants.OPERATOR.EQUALS) return true;
		if (this.value === constants.OPERATOR.MATCHES) return true;
		if (this.value === constants.OPERATOR.IS) return true;
		if (this.value === constants.OPERATOR.LT) return true;
		if (this.value === constants.OPERATOR.LTE) return true;
		if (this.value === constants.OPERATOR.GT) return true;
		if (this.value === constants.OPERATOR.GTE) return true;
		
		return false;
	},
	
	// Return whether or not this token is an operand
	isOperand: function () {
		if (this.type === constants.TYPE.IDENTIFIER) return true;
		if (this.type === constants.TYPE.BOOL) return true;
		if (this.type === constants.TYPE.NUMBER) return true;
		if (this.type === constants.TYPE.STRING) return true;
		if (this.type === constants.TYPE.REGEX) return true;
		if (this.type === constants.TYPE.VARIABLE) return true;
		if (this.value === constants.THIS) return true;
		if (this.isState()) return true;
		
		return false;
	},
	
	// Return whether or not this token is a state
	isState: function () {
		// Check each state in constants for this one
		for (var state in constants.STATE) {
			if (!constants.STATE.hasOwnProperty(state)) continue;
			
			if (this.value === constants.STATE[state]) {
				return true; // Found this value in constants, must be a state
			}
		}
		
		// Could not find this value in constants, must not be a state
		return false;
	}
};

// Return Token class
module.exports = Token;