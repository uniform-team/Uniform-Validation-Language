import constants from "./constants.js";
import { TypeError as TypeErrorClass } from "./errors.js";

// Wrap TypeError into a subclass which standardizes the text output and adds the line number and index more conveniently
class TypeError extends TypeErrorClass {
    constructor(givenType, desiredType, token) {
        super("Cannot convert " + givenType + " to a(n) " + desiredType, token.line, token.col);
    }
}

// Coerce the given token to a boolean or throw a TypeError if unsuccessful
export function toBool(token) {
    if (token.type !== constants.TYPE.BOOL) {
        throw new TypeError(token.type, constants.TYPE.BOOL, token);
    }
    
    return token;
}

// Coerce the given token to a number or throw a TypeError if unsuccessful
export function toNumber(token) {
    if (token.type !== constants.TYPE.NUMBER) {
        throw new TypeError(token.type, constants.TYPE.BOOL, token);
    }
    
    return token;
}

// Coerce the given token to a string or throw a TypeError if unsuccessful
export function toString(token) {
    if (token.type !== constants.TYPE.STRING) {
        throw new TypeError(token.type, constants.TYPE.STRING, token);
    }
    
    return token;
}

// Coerce the given token to a regular expression or throw a TypeError if unsuccessful
export function toRegex(token) {
    if (token.type !== constants.TYPE.REGEX) {
        throw new TypeError(token.type, constants.TYPE.REGEX, token);
    }
    
    return token;
}

// Coerce the given token to an object or throw a TypeError if unsuccessful
export function toObject(token) {
    if (token.type !== constants.TYPE.OBJECT) {
        throw new TypeError(token.type, constants.TYPE.OBJECT, token);
    }
    
    return token;
}

// Coerce the given token to an identifier or throw a TypeError if unsuccessful
export function toIdentifier(token) {
    if (token.type !== constants.TYPE.IDENTIFIER) {
        throw new TypeError(token.type, constants.TYPE.IDENTIFIER, token);
    }
    
    return token;
}

// Coerce the given token to a variable or throw a TypeError if unsuccessful
export function toVariable(token) {
    if (token.type !== constants.TYPE.VARIABLE) {
        throw new TypeError(token.type, constants.TYPE.VARIABLE, token);
    }
    
    return token;
}

// Coerce the given token to a tag or throw a TypeError if unsuccessful
export function toTag(token) {
    if (!token.isTag()) {
        throw new TypeError(token.type, constants.TYPE.IDENTIFIER, token);
    }
    
    return token;
}