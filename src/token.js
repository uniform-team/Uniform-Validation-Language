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
    
    // Take an object containing Tokens and return an object with the raw values extracted from the Token objects
    static flatten(param) {
        if (param instanceof Token) { // Extract the value out of the Token and flatten it recursively
            return Token.flatten(param.value);
        } else if (typeof param === "object") { // Flatten each component of the object
            let result = {};
    
            // Recursively flatten each key-value pair
            for (let key in param) {
                if (!param.hasOwnProperty(key)) continue;
                
                result[key] = Token.flatten(param[key]);
            }
            
            return result;
        } else { // Raw value, nothing to flatten
            return param;
        }
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
        
        return false;
    }
    
    // Return whether or not this token is a UFM type (can be declared in Uniform code)
    isUfmType() {
        if (this.value === constants.TYPE.STRING) return true;
        if (this.value === constants.TYPE.BOOL) return true;
        if (this.value === constants.TYPE.NUMBER) return true;
        
        return false;
    }
    
    // Return this Token printed as a string
    toString() {
        return "Token(" + this.value + ", " + this.type + ")";
    }
};