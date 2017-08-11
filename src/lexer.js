import constants from "./constants.js";
import Token from "./token.js";
import { SyntaxError } from "./errors.js";
import { escape, canBeFollowedByRegex, createKeyword, createOperator } from "./lexer-util.js";
import Stream from "./stream.js";

const identity = x => x;

// Regular expression class which supports the match line flag.
class UfmRegex extends RegExp {
    constructor(source, flags) {
        const matchLine = flags.indexOf(constants.REGEX_FLAGS.MATCH_LINE) !== -1;
        const jsFlags = flags.replace("x", ""); // Strip illegal JavaScript RegEx flags
    
        if (matchLine) {
            // Wrap RegEx in ^...$ to emulate match line flag
            if (source[0] !== "^") source = "^" + source;
            if (source[source.length - 1] !== "$") source += "$";
        }
    
        super(source, jsFlags);
    }
}

// Create a Stream object specifying the lexical structure for the Uniform Validation Language.
class UfmStream extends Stream {
    constructor(input) {
        super(input);
        
        // Add extra flags to maintain state during lexical analysis
        this.regexFlags = "";
        this.expectRegex = false;
        this.expectNextRegex = false;
        this.hadNewlineBeforeLastToken = false;
    }
    
    // Store RegEx flags in a separate buffer from the token
    consumeRegexFlag() {
        this.regexFlags += this.input.slice(0, 1);
        this.ignore();
        
        return this;
    }
    
    // Reset the flags between each token.
    reset() {
        super.reset();
        
        this.regexFlags = "";
        this.expectRegex = this.expectNextRegex;
        this.expectNextRegex = false;
    }
    
    // Throw a SyntaxError with the given message on the line and column at the start of the current token.
    throwSyntaxError(msg) {
        throw new SyntaxError(msg, this.line, this.col - this.token.length);
    }
    
    // Sets the Stream whether or not to expect the next token to a RegEx based on the result of the given callback
    // on the current token.
    expectRegexToken(cb) {
        this.expectNextRegex = cb(this.token);
        
        return this;
    }
    
    // Sets that there was a newline before the current token.
    hadNewlineBeforeToken() {
        this.hadNewlineBeforeLastToken = true;
        
        return this;
    }
    
    // Return the current token in the Stream each time this is called.
    tokenize() {
        // Assume no newline was before this token
        this.hadNewlineBeforeLastToken = false;
        
        // Define Uniform lexical structure
        return this.repeat(/\/\/|\/\*|\n|\s/, // Single-line comment, multi-line comment, or whitespace
            // Ignore all non-token characters immediately
            () => this.match(/\/\//, // Single-line comment (// comment)
                () => this.ignoreUntil(/\n/).ignore(/* newline */)
            ).match(/\/\*/, // Multi-line comment (/* comment */)
                () => this.ignoreUntil(/\*\//).ignore("*/".length)
            ).match(/\n/, // Raw newline
                // Remember that there was a newline before this token
                () => this.hadNewlineBeforeToken().ignore(/* newline */)
            ).match(/\s/, // Whitespace
                () => this.ignore(/* whitespace */)
            )
        ).match(/^$/, // Empty string
            () => this.returnToken(() => new Token(constants.ENDOFFILE, constants.ENDOFFILE))
        ).match(/[a-zA-Z_]/, // Identifiers or keywords
            () => this.consume(/* first char */).consumeWhile(/[a-zA-Z0-9_]/).expectRegexToken(canBeFollowedByRegex)
                .returnToken((value) => {
                    // Create keyword if possible, otherwise it must be an identifier
                    const keyword = createKeyword(value);
                    return keyword !== null ? keyword : new Token(value, constants.TYPE.IDENTIFIER);
                }
            )
        ).match(/@/, // Variables
            () => this.ignore(/* @ char */).consumeWhile(/[a-zA-Z0-9_]/).returnToken(
                (value) => new Token(value, constants.TYPE.VARIABLE)
            )
        ).match(/[0-9]/, // Number literals
            () => this.consume(/* first digit */).consumeWhile(/[0-9]/).returnToken(
                (value) => new Token(parseInt(value), constants.TYPE.NUMBER)
            )
        ).match(/"/, // String literals
            () => this.ignore(/* open quote */).consumeUntil(/["\n]/, { // Closing quote or raw newline
                getNumChars: () => this.input[0] === "\\" ? 2 : 1, // Consume two characters if it is escaped
                getMap: () => this.input[0] === "\\" ? escape : identity, // Use escape() as map if necessary
                onEOF: () => this.throwSyntaxError(`Unterminated string: ${this.token}`)
            }).match(/"/, // End quote
                () => this.ignore(/* close quote */).returnToken((value) => new Token(value, constants.TYPE.STRING))
            ).match(/\n/, // Raw newline
                () => this.throwSyntaxError(`Unterminated string: ${this.token}`)
            )
        ).match(/\//, // Slash character
            () => this.branch(() => this.expectRegex, // Decide either RegEx or division operator
                /* RegEx */ () => this.ignore(/* slash */).consumeUntil(/[\/\n]/, { // Slash or newline
                        // Consume two characters if an escaped forward slash or backward slash, consume one character otherwise
                        getNumChars: () => this.input.startsWith("\\/") || this.input.startsWith("\\\\") ? 2 : 1,
                        onEOF: () => this.throwSyntaxError(`Unterminated regular expression: /${this.token}`)
                    }).match(/\//, // Terminating slash character
                        () => this.ignore(/* terminating slash */).repeat(/[imx]/,
                            () => this.consumeRegexFlag()
                        ).returnToken(
                            (value) => new Token(new UfmRegex(value, this.regexFlags), constants.TYPE.REGEX)
                        )
                    ).match(/\n/, // Raw newline
                        () => this.throwSyntaxError(`Unterminated regular expression: /${this.token}`)
                    ),
                /*  Div  */ () => this.consume(/* slash */).returnToken(
                    (value) => new Token(constants.OPERATOR.DIV, constants.TYPE.KEYWORD)
                )
            )
        ).match(/[+\-*%:;(){}.]/, // Single character operators
            () => this.consume(/* operator */).expectRegexToken(canBeFollowedByRegex).returnToken(createOperator)
        ).match(/[<>]/, // Possibly multiple character operators
            () => this.consume(/* first < or > character */).match(/=/, // Check for following = sign
                () => this.consume(/* second = character */)
            ).expectRegexToken(canBeFollowedByRegex).returnToken(createOperator) // Create token for <, >, <=, >=
        ).extractResult();
    }
}

// Create a UfmStream for the given Uniform source code input and return the tokenize function with appropriate hooks
export default function (input) {
    // Create stream and bind tokenize function before returning it
    const ufmStream = new UfmStream(input);
    const tokenize = ufmStream.tokenize.bind(ufmStream);
    tokenize._setExpectRegex = (expect) => ufmStream.expectRegex = expect;
    tokenize.hadNewlineBeforeLastToken = () => ufmStream.hadNewlineBeforeLastToken;
    return tokenize;
};