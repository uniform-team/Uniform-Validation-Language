import { NotImplementedError } from "./errors.js";

/**
 * Language-independent Stream class. Wraps a string of input text and exposes methods to allow easy
 * lexical analysis of it. Tracks line and column and even what the next token to return is.
 *
 * Usage: Extend the Stream class and override the #tokenize() member to chain together all of these functions
 * to create a lexical structure for a given language.
 *
 * Ex:
 * // Lexical definition
 * class MyLangStream extends Stream {
 *     tokenize() {
 *         return this.match(/foo/, // When the string "foo" is found
 *             // Consume the characters of "foo" and return them as a token
 *             () => this.consume("foo".length).returnToken((value) => new Token(value)) // value === "foo"
 *         ).match(/bar/, // When the string "bar" is found
 *             // Consume the characters of "bar" and return them as a token
 *             () => this.consume("bar".length).returnToken((value) => new Token(value)) // value === "bar"
 *         ).match([0-9], // When a digit is found
 *             // Consume all digits until a non-digit is found and return it as a token
 *             () => this.consumeUntil(/[^0-9]/).returnToken((value) => new Token(value))
 *         ).extractResult(); // Return the value given
 *     }
 * }
 *
 * // Usage
 * const langStream = new MyLangStream("foo1234bar");
 * langStream.tokenize(); // new Token("foo")
 * langStream.tokenize(); // new Token("1234")
 * langStream.tokenize(); // new Token("bar")
 */
export default class Stream {
    // Create a new Stream for the given input text
    constructor(input) {
        this.input = input;
        this.token = "";
        this.line = 1;
        this.col = 1;
        this.result = null;
    }
    
    // Advance `numChars` characters forward in the stream and update `line` and `col` appropriately
    advance(numChars = 1) {
        // Use a map/reduce to count the number of newlines
        const numNewlines = this.input.slice(0, numChars).split("").map(char => char === "\n" ? 1 : 0).reduce(
            (numNewlines1, numNewlines2) => numNewlines1 + numNewlines2
        );
        const lastNewlinePos = this.input.lastIndexOf("\n", numChars - 1);
        
        // Update line and col with new values
        this.line += numNewlines;
        this.col = lastNewlinePos !== -1 ? numChars - lastNewlinePos : this.col + numChars;
        
        // Advance input
        this.input = this.input.substr(numChars);
        
        return this;
    }
    
    // Advance `numChars` characters forward in the stream appending each character to the current token
    consume(numChars = 1) {
        this.token += this.input.slice(0, numChars);
        this.advance(numChars);
        
        return this;
    }
    
    // Consume each character until it reaches the given RegEx or the end of the Stream.
    // getNumChars(): Returns how many characters to consume at a time based on the current Stream context.
    //                Useful for skipping characters so the RegEx doesn't match an escaped value.
    // getMap():      Returns a function to map the consume characters to the output values given to the token.
    //                Useful for escaping characters.
    // onEOF():       Callback to invoke if the end of the file is reached.
    consumeUntil(regex, { getNumChars = () => 1, getMap = () => x => x, onEOF = null } = { }) {
        const matchingRegex = Stream.correctRegex(regex);
        while (this.input !== "" && !matchingRegex.test(this.input)) {
            // Determine how many characters to consume and how to map them
            const numChars = getNumChars();
            const map = getMap();
            
            // Consume characters, map them, and append them to the current token
            this.token += map(this.input.slice(0, numChars));
            
            this.advance(numChars);
        }
        
        // Check if the Stream ended
        if (this.input === "") {
            if (onEOF) onEOF();
            return this;
        }
        
        return this;
    }
    
    // Advance `numChars` forward without appending them to the current token.
    ignore(numChars = 1) {
        this.advance(numChars);
        
        return this;
    }
    
    // Advance forward until the given regex is satisfied on the end of the Stream is reached.
    // Does not append any characters to the current token.
    ignoreUntil(regex) {
        const matchingRegex = Stream.correctRegex(regex);
        while(this.input !== "" && !matchingRegex.test(this.input)) {
            this.advance();
        }
        
        return this;
    }
    
    // Repeat the `action` callback given as long as the given `regex` is matched by the stream.
    repeat(regex, action) {
        const matchingRegex = Stream.correctRegex(regex);
        while (!this.result && matchingRegex.test(this.input)) {
            action();
        }
        
        return this;
    }
    
    // Save the given token to be returned by #extractResult().
    returnToken(createToken) {
        this.result = createToken(this.token);
    }
    
    // Return the token saved by #returnToken() and reset the Stream.
    extractResult() {
        const result = this.result;
        this.reset();
        return result;
    }
    
    // Reset the Stream's current metadata state. Does not change current position in input string.
    reset() {
        this.token = "";
        this.result = null;
    }
    
    // If the Stream currently matches the `regex` given, then invoke the `then` callback.
    match(regex, then) {
        const matchingRegex = Stream.correctRegex(regex);
        if (!this.result && matchingRegex.test(this.input)) {
            then();
        }
        
        return this;
    }
    
    // Check the `predicate` callback, if it is truthy invoke the `then` callback, else invoke the `otherwise` callback.
    // Just a basic if-else-statement that supports chaining in a Stream.
    branch(predicate, then, otherwise) {
        if (predicate()) {
            then();
        } else {
            otherwise();
        }
        
        return this;
    }
    
    // Adjust the given `regex` for Stream use by forcing it to match the first part of the string.
    static correctRegex(regex) {
        return new RegExp("^(" + regex.source + ")");
    }
    
    // Function to override in order to specify the lexical structure of a particular language.
    tokenize() {
        throw new NotImplementedError("Stream#tokenize() is abstract and should be overridden by a child class.");
    }
};