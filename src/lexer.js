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

    TAG: {
        VALID: "valid",
        ENABLED: "enabled",
        VISIBLE: "visible",
        OPTIONAL: "optional"
    }
};


var isWhitespace = /\s|\t/;
var isAlpha = /[a-zA-Z]/;
var isNumber = /[0-9]/;
var lineNumber = 0;
var stringIndex = 0;
var inputString = "";


module.exports = {

    TOKEN: TOKEN,

    loadString: function (inString) {
        inputString = inString;
        stringIndex = 0;
        console.log(inString);
    },

    getNextToken: function () {

        var lexbuffer = "";
        var nextTokenBuffer = "";

        function nextChar() {
            nextTokenBuffer += lexbuffer;
            stringIndex++;
            lexbuffer = inputString.charAt(stringIndex);
        }


        if (stringIndex >= inputString.length || lexbuffer === "EOF") {
            return TOKEN.ENDOFFILE;
        }



        lexbuffer = inputString.charAt(stringIndex);

        //ignore whitespace
        while (isWhitespace.test(lexbuffer)) {
            stringIndex++;
            lexbuffer = inputString.charAt(stringIndex);
        }


        //check for operators
        if (isAlpha.test(lexbuffer)) {
            do {
                nextChar();
            } while (isAlpha.test(lexbuffer));
            if (nextTokenBuffer === "is")
                return TOKEN.OPERATOR.IS;
            else if (nextTokenBuffer === "and")
                return TOKEN.OPERATOR.AND;
            else if (nextTokenBuffer === "or")
                return TOKEN.OPERATOR.OR;
            else if (nextTokenBuffer === "not")
                return TOKEN.OPERATOR.NOT;
            else if (nextTokenBuffer === "matches")
                return TOKEN.OPERATOR.MATCHES;
            else if (nextTokenBuffer === "equals")
                return TOKEN.OPERATOR.EQUALS;
            else if (nextTokenBuffer === "valid")
                return TOKEN.TAG.VALID;
            else if (nextTokenBuffer === "enabled")
                return TOKEN.TAG.ENABLED;
            else if (nextTokenBuffer === "visible")
                return TOKEN.TAG.VISIBLE;
            else if (nextTokenBuffer === "optional")
                return TOKEN.TAG.OPTIONAL;
            else if (nextTokenBuffer === "EOF")
                return TOKEN.ENDOFFILE;


            else {
                console.log("error\n");
                return -1;
            }
        }

        //Check for number
        else if (isNumber.test(lexbuffer)) {
            do {
                nextChar();
            } while (isNumber.test(lexbuffer));
            return TOKEN.NUMBER;
        }

        //Check for variable
        else if (lexbuffer === "@") {
            do {
                nextChar();
            } while (isAlpha.test(lexbuffer) || isNumber.test(lexbuffer));
            return TOKEN.VARIABLE;
        }

        //Check for string
        else if (lexbuffer === "\"") {
            do {
                nextChar();
            } while (lexbuffer !== '\"');
            nextChar();
            //console.log(nextTokenBuffer);
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
        return TOKEN.ENDOFFILE;
    }
};