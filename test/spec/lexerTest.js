var thisToken;

describe("The \"lexer\" module", function () {
    it("is exposed globally as an object", function () {
        expect(uniform.lexer).toEqual(jasmine.any(Object));
    });
    var lexer = uniform.lexer;
    it("should throw error when given an invalid token", function () {
        lexer.loadString("test");
        expect(function () {
            lexer.getNextToken();
        }).toThrow();
    });

    describe("should tokenize valid tokens such as", function () {
        describe("should recognize comments and ignore them properly including", function() {
            it("single line comments //", function() {
                lexer.loadString("//this is a comment \n \"this is not a comment\"");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.STRING);
            });
            it("multi line comments /* */", function() {
                lexer.loadString("/* multi line comment \n still going */ \"this is a string\"");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.STRING);
            });
        });

        it("should recognize regular expressions", function () {
            lexer.loadString("/\"<([A-Z][A-Z0-9]*)\b[^>]*>(.*?)</\1>\"/");
            thisToken = lexer.getNextToken();
            expect(thisToken.type).toBe(lexer.TOKEN.TYPE.REGEX);
        });

        it("strings formatted between double quotes", function () {
            lexer.loadString("\"Hello World\"");
            thisToken = lexer.getNextToken();
            expect(thisToken.type).toBe(lexer.TOKEN.TYPE.STRING);
            expect(thisToken.value).toBe("\"Hello World\"");
        });
        it("strings that are empty", function () {
            lexer.loadString("\"\"");
            thisToken = lexer.getNextToken();
            expect(thisToken.type).toBe(lexer.TOKEN.TYPE.STRING);
            expect(thisToken.value).toBe("\"\"");
        });

        it("selectors that are wrapped in $(\"\")", function () {
            lexer.loadString("$(\".class #id value\")");
            thisToken = lexer.getNextToken();
            expect(thisToken.type).toBe(lexer.TOKEN.TYPE.SELECTOR);
            expect(thisToken.value).toBe(".class #id value");
        });
        describe("operators such as", function () {
            it("is", function () {
                lexer.loadString("is");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.IS);
            });
            it("and", function () {
                lexer.loadString("and");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.AND);
            });
            it("or", function () {
                lexer.loadString("or");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.OR);
            });
            it("not", function () {
                lexer.loadString("not");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.NOT);
            });
            it("matches", function () {
                lexer.loadString("matches");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.MATCHES);
            });
            it("equals", function () {
                lexer.loadString("equals");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.EQUALS);
            });
            it("+", function () {
                lexer.loadString("+");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.ADD);
            });
            it("-", function () {
                lexer.loadString("-");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.SUB);
            });
            it("*", function () {
                lexer.loadString("*");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.MUL);
            });
            it("/", function () {
                lexer.loadString("/");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.DIV);
            });
            it("%", function () {
                lexer.loadString("%");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.MOD);
            });

            it(":", function () {
                lexer.loadString(":");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.COLON);
            });
            it("{", function () {
                lexer.loadString("{");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.LBRACE);
            });
            it("}", function () {
                lexer.loadString("}");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.RBRACE);
            });
            it("(", function () {
                lexer.loadString("(");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.LPAREN);
            });
            it(")", function () {
                lexer.loadString(")");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.RPAREN);
            });
            it(";", function () {
                lexer.loadString(";");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.SEMICOLON);
            });
            it("<", function () {
                lexer.loadString("<");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.LT);
            });
            it(">", function () {
                lexer.loadString(">");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.GT);
            });
            it("<=", function () {
                lexer.loadString("<=");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.LTE);
            });
            it(">=", function () {
                lexer.loadString(">=");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.OPERATOR.GTE);
            });
        });

        it("variables such as an \"@ sign followed by alphanumerics", function () {
            lexer.loadString("@testVariable");
            thisToken = lexer.getNextToken();
            expect(thisToken.type).toBe(lexer.TOKEN.TYPE.VARIABLE);
            expect(thisToken.value).toBe("@testVariable");
        });
        it("numbers such as one or more numerals between 0-9", function () {
            lexer.loadString("1234567890");
            thisToken = lexer.getNextToken();
            expect(thisToken.type).toBe(lexer.TOKEN.TYPE.NUMBER);
            expect(thisToken.value).toBe("1234567890");
        });
        describe("Tags such as", function () {
            it("valid", function () {
                lexer.loadString("valid");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.TAG.VALID);

            });
            it("enabled", function () {
                lexer.loadString("enabled");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.TAG.ENABLED);
            });
            it("visible", function () {
                lexer.loadString("visible");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.TAG.VISIBLE);
            });
            it("optional", function () {
                lexer.loadString("optional");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.TAG.OPTIONAL);
            });

        });
        describe("States such as", function () {
            it("valid", function () {
                lexer.loadString("valid");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.STATE.VALID);
            });
            it("number", function () {
                lexer.loadString("number");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.STATE.NUMBER);
            });
            it("string", function () {
                lexer.loadString("string");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.KEYWORD);
                expect(thisToken.value).toBe(lexer.TOKEN.STATE.STRING);
            });
        });
    });
});

