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
    })
    describe("should tokenize valid tokens such as", function () {
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
            expect(thisToken.value).toBe("$(\".class #id value\")");
        });
        describe("operators such as", function () {
            it("is", function () {
                lexer.loadString("is");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.OPERATOR);
            });
            it("and", function () {
                lexer.loadString("and");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.OPERATOR);
            });
            it("or", function () {
                lexer.loadString("or");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.OPERATOR);
            });
            it("not", function () {
                lexer.loadString("not");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.OPERATOR);
            });
            it("matches", function () {
                lexer.loadString("matches");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.OPERATOR);
            });
            it("equals", function () {
                lexer.loadString("equals");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.OPERATOR);
            });
            it(":", function () {
                lexer.loadString(":");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.OPERATOR);
            });
            it("{", function () {
                lexer.loadString("{");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.OPERATOR);
            });
            it("}", function () {
                lexer.loadString("}");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.OPERATOR);
            });
            it("(", function () {
                lexer.loadString("(");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.OPERATOR);
            });
            it(")", function () {
                lexer.loadString(")");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.OPERATOR);
            });
            it(";", function () {
                lexer.loadString(";");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.OPERATOR);
            });
            it("<", function () {
                lexer.loadString("<");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.OPERATOR);
            });
            it(">", function () {
                lexer.loadString(">");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.OPERATOR);
            });
            it("<=", function () {
                lexer.loadString("<=");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.OPERATOR);
            });
            it(">=", function () {
                lexer.loadString(">=");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.OPERATOR);
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
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.TAG);
            });
            it("enabled", function () {
                lexer.loadString("enabled");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.TAG);
            });
            it("visible", function () {
                lexer.loadString("visible");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.TAG);
            });
            it("optional", function () {
                lexer.loadString("optional");
                thisToken = lexer.getNextToken();
                expect(thisToken.type).toBe(lexer.TOKEN.TYPE.TAG);
            });

        });
    });
});
