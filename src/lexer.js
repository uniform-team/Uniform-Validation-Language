//Constants for lexical tokens
var TOKEN = {
    OPERATOR: {
        IS: "is",
        AND: "and",
        OR: "or",
        NOT: "not",
        MATCHES: "matches",
        EQUALS: "equals",
        COLON: ":",
        LBRACE: "{",
        RBRACE: "}",
        LPAREN: "(",
        RPAREN: ")",
        SEMICOLON: ";",
        LT: "<",
        GT: ">",
        LTE: "<=",
        GTE: ">="
    },
    VARIABLE: "variable",
    NUMBER: "number",
    STRING: "string",
    ENDOFFILE: "EOF",
    DOMELT: "DOMElement",

    TAG: {
        VALID: "valid",
        ENABLED: "enabled",
        VISIBLE: "visible",
        OPTIONAL: "optional"
    }
};

//Regular expressions
var isWhitespace = /\s|\t/;
var isAlpha = /[a-zA-Z]/;
var isDigit = /[0-9]/;

var lineNumber = 0;     //keeps track of current line number for error messages
var stringIndex = 0;    //the index of the string, lexbuffer contains the character at this index
var inputString = "";   //the entire uniform file to be lexed

module.exports = {
    TOKEN: TOKEN,

    //Description: Call load string before calling lexer, used for scope
    //Parameters: inString -- a string containing the entire uniform file to be lexed
    loadString: function (inString) {
        inputString = inString;
        stringIndex = 0;
    },

    //Description: Returns the current token and prepares to return the next
    getNextToken: function () {

        var lexbuffer = "";         //contains a single character to be analyzed
        var nextTokenBuffer = "";   //buffer that appends the lexbuffer until a token is built

        //Description: Appends lexbuffer to nextTokenBuffer, and loads the next char into lexbuffer
        function nextChar() {
            nextTokenBuffer += lexbuffer;
            stringIndex++;
            lexbuffer = inputString.charAt(stringIndex);
        }

        //When the end of the uniform file is reached, exit
        if (stringIndex >= inputString.length) {
            return TOKEN.ENDOFFILE;
        }

        //set lexbuffer equal to the stringIndex
        lexbuffer = inputString.charAt(stringIndex);

        //ignore whitespace, move string index until non-whitespace character is found
        while (isWhitespace.test(lexbuffer)) {
            stringIndex++;
            lexbuffer = inputString.charAt(stringIndex);
        }

        //check for operators and tags
        if (isAlpha.test(lexbuffer)) {
            do {
                nextChar();
            } while (isAlpha.test(lexbuffer));

            switch(nextTokenBuffer) {
                case "is":
                    return TOKEN.OPERATOR.IS;
                case "and":
                    return TOKEN.OPERATOR.AND;
                case "or":
                    return TOKEN.OPERATOR.OR;
                case "not":
                    return TOKEN.OPERATOR.NOT;
                case "matches":
                    return TOKEN.OPERATOR.MATCHES;
                case "equals":
                    return TOKEN.OPERATOR.EQUALS;
                case "valid":
                    return TOKEN.TAG.VALID;
                case "enabled":
                    return TOKEN.TAG.ENABLED;
                case "visible":
                    return TOKEN.TAG.VISIBLE;
                case "optional":
                    return TOKEN.TAG.OPTIONAL;
                default:
                    console.log("ERROR: Invalid token -- Expected token of type: OPERATOR or TAG -- Recieved " + nextTokenBuffer + "\n");
                    return "ERROR";
            }
        }

        //Check for number
        else if (isDigit.test(lexbuffer)) {
            do {
                nextChar();
            } while (isDigit.test(lexbuffer));
            return TOKEN.NUMBER;
        }

        //Check for variable
        else if (lexbuffer === "@") {
            do {
                nextChar();
            } while (isAlpha.test(lexbuffer) || isDigit.test(lexbuffer));
            return TOKEN.VARIABLE;
        }

        //Check for string
        else if (lexbuffer === "\"") {
            do {
                nextChar();
            } while (lexbuffer !== '\"');
            nextChar();
            return TOKEN.STRING;
        }


        //check for non-alpha operators
        switch (lexbuffer) {
            case TOKEN.OPERATOR.COLON:
                nextChar();
                return TOKEN.OPERATOR.COLON;
            case TOKEN.OPERATOR.LBRACE:
                nextChar();
                return TOKEN.OPERATOR.LBRACE;
            case TOKEN.OPERATOR.RBRACE:
                nextChar();
                return TOKEN.OPERATOR.RBRACE;
            case TOKEN.OPERATOR.LPAREN:
                nextChar();
                return TOKEN.OPERATOR.LPAREN;
            case TOKEN.OPERATOR.RPAREN:
                nextChar();
                return TOKEN.OPERATOR.RPAREN;
            case TOKEN.OPERATOR.SEMICOLON:
                nextChar();
                return TOKEN.OPERATOR.SEMICOLON;
            case TOKEN.OPERATOR.LT:
                nextChar();
                if (lexbuffer === "=")
                    return TOKEN.OPERATOR.LTE;
                else return TOKEN.OPERATOR.LT;
            case TOKEN.OPERATOR.GT:
                nextChar();
                if (lexbuffer === "=")
                    return TOKEN.OPERATOR.GTE;
                else return TOKEN.OPERATOR.GT;
            default:
                break;
        }
        console.log("Unknown token\n");
        return "invalid";
    }
};