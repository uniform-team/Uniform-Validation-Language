import constants from "./constants.js";
import Token from "./token.js";
import { SyntaxError } from "./errors.js";

// Wrap in a self-executing function to store a closure
export const escape = (function () {
    const map = {
        "\\0": "\0",  // Null byte
        "\\b": "\b",  // Backspace
        "\\f": "\f",  // Form feed
        "\\n": "\n",  // Newline
        "\\r": "\r",  // Carriage return
        "\\t": "\t",  // Tab
        "\\v": "\v",  // Vertical tab
        "\\\'": "\'", // Single quote
        "\\\"": "\"", // Double quote
        "\\\\": "\\"  // Backslash
    };

    // Return actual function to convert a literal \char into the escaped character
    return function (sequence) {
        const escapedSequence = map[sequence];

        if (!escapedSequence) throw new SyntaxError(`Unknown escape sequence: ${sequence}`);

        return escapedSequence;
    }
}());

// Wrap in a self-executing function to store a closure
export const canBeFollowedByRegex = (function () {
    const map = {
        [constants.OPERATOR.ADD]:     true,
        [constants.OPERATOR.SUB]:     true,
        [constants.OPERATOR.MUL]:     true,
        [constants.OPERATOR.DIV]:     true,
        [constants.OPERATOR.MOD]:     true,
        [constants.OPERATOR.AND]:     true,
        [constants.OPERATOR.MATCHES]: true,
        [constants.OPERATOR.EQUALS]:  true,
        [constants.OPERATOR.COLON]:   true,
        [constants.OPERATOR.LPAREN]:  true,
        [constants.OPERATOR.LT]:      true,
        [constants.OPERATOR.GT]:      true,
        [constants.OPERATOR.LTE]:     true,
        [constants.OPERATOR.GTE]:     true,
        [constants.OPERATOR.IF]:      true,
        [constants.OPERATOR.THEN]:    true,
        [constants.OPERATOR.ELIF]:    true,
        [constants.OPERATOR.ELSE]:    true
    };

    // Return actual function returning whether or not the given token can be followed by a RegEx
    return value => map[value] || false; // Booleanify
}());

// Wrap in a self-executing function to store a closure
export const createKeyword = (function () {
    const create = (value) => new Token(value, constants.TYPE.KEYWORD);
    const map = {
        [constants.VALUE.TRUE]:       (value) => new Token(true, constants.TYPE.BOOL),
        [constants.VALUE.FALSE]:      (value) => new Token(false, constants.TYPE.BOOL),
        [constants.OPERATOR.AND]:     create,
        [constants.OPERATOR.OR]:      create,
        [constants.OPERATOR.NOT]:     create,
        [constants.OPERATOR.MATCHES]: create,
        [constants.OPERATOR.EQUALS]:  create,
        [constants.TAG.VALID]:        create,
        [constants.TAG.ENABLED]:      create,
        [constants.TAG.VISIBLE]:      create,
        [constants.TAG.SELECTOR]:     create,
        [constants.TAG.RESULT]:       create,
        [constants.OPERATOR.ALL]:     create,
        [constants.OPERATOR.ANY]:     create,
        [constants.OPERATOR.IF]:      create,
        [constants.OPERATOR.THEN]:    create,
        [constants.OPERATOR.ELIF]:    create,
        [constants.OPERATOR.ELSE]:    create,
        [constants.OPERATOR.END]:     create,
        [constants.THIS]:             create
    };
    
    // Return actual function returning a new token for the given keyword, or null if it is not a keyword
    return value => map[value] ? map[value](value) : null;
}());

// Wrap in a self-executing function to store a closure
export const createOperator = (function () {
    const map = {
        [constants.OPERATOR.ADD]:       true,
        [constants.OPERATOR.SUB]:       true,
        [constants.OPERATOR.MUL]:       true,
        // Skip DIV as it is handled directly by the lexer
        [constants.OPERATOR.MOD]:       true,
        [constants.OPERATOR.LT]:        true,
        [constants.OPERATOR.GT]:        true,
        [constants.OPERATOR.LTE]:       true,
        [constants.OPERATOR.GTE]:       true,
        [constants.OPERATOR.COLON]:     true,
        [constants.OPERATOR.SEMICOLON]: true,
        [constants.OPERATOR.LPAREN]:    true,
        [constants.OPERATOR.RPAREN]:    true,
        [constants.OPERATOR.LBRACE]:    true,
        [constants.OPERATOR.RBRACE]:    true,
        [constants.OPERATOR.DOT]:       true
    };
    
    // Return actual function returning a new token for the given operator, or null if it is not an operator
    return value => map[value] ? new Token(value, constants.TYPE.KEYWORD) : null;
}());