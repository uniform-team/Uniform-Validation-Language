import constants from "./constants.js";
import { SyntaxError } from "./errors.js";

// Regular expressions
export const isWhitespace = /\s|\t/;
export const isAlpha = /[a-zA-Z]/;
export const isDigit = /[0-9]/;

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
        [constants.OPERATOR.ADD]: true,
        [constants.OPERATOR.SUB]: true,
        [constants.OPERATOR.MUL]: true,
        [constants.OPERATOR.DIV]: true,
        [constants.OPERATOR.MOD]: true,
        [constants.OPERATOR.AND]: true,
        [constants.OPERATOR.MATCHES]: true,
        [constants.OPERATOR.EQUALS]: true,
        [constants.OPERATOR.COLON]: true,
        [constants.OPERATOR.LPAREN]: true,
        [constants.OPERATOR.LT]: true,
        [constants.OPERATOR.GT]: true,
        [constants.OPERATOR.LTE]: true,
        [constants.OPERATOR.GTE]: true,
        [constants.OPERATOR.IF]: true,
        [constants.OPERATOR.THEN]: true,
        [constants.OPERATOR.ELIF]: true,
        [constants.OPERATOR.ELSE]: true
    };

    // Return actual function returning whether or not the given token can be followed by a RegEx
    return token => map[token] || false; // Booleanify
}());

// Wrap in a self-executing function to store a closure
export const isRegexFlag = (function () {
    const map = {
        [constants.REGEX_FLAGS.IGNORE_CASE]: true,
        [constants.REGEX_FLAGS.MULTI_LINE]: true,
        [constants.REGEX_FLAGS.MATCH_LINE]: true
    };

    // Return actual function returning whether or not the given character is a valid RegEx flag
    return character => map[character] || false; // Booleanify
}());