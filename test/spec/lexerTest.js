describe("The \"lexer\" module", function () {
    it("is exposed globally as an object", function () {
        expect(uniform.lexer).toEqual(jasmine.any(Object));
    });
    var lexer = uniform.lexer;
    describe("should tokenize valid tokens such as", function () {
        it("strings formatted between double quotes", function () {
            lexer.loadString("\"Hello World\"");
            expect(lexer.getNextToken()).toBe(lexer.TOKEN.STRING);
        });
        describe("operators such as", function () {
            it("is", function () {
                lexer.loadString("is");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.OPERATOR.IS);
            });
            it("and", function () {
                lexer.loadString("and");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.OPERATOR.AND);
            });
            it("or", function () {
                lexer.loadString("or");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.OPERATOR.OR);
            });
            it("not", function () {
                lexer.loadString("not");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.OPERATOR.NOT);
            });
            it("matches", function () {
                lexer.loadString("matches");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.OPERATOR.MATCHES);
            });
            it("equals", function () {
                lexer.loadString("equals");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.OPERATOR.EQUALS);
            });
            it(":", function () {
                lexer.loadString(":");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.OPERATOR.COLON);
            });
            it("{", function () {
                lexer.loadString("{");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.OPERATOR.LBRACE);
            });
            it("}", function () {
                lexer.loadString("}");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.OPERATOR.RBRACE);
            });
            it("(", function () {
                lexer.loadString("(");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.OPERATOR.LPAREN);
            });
            it(")", function () {
                lexer.loadString(")");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.OPERATOR.RPAREN);
            });
            it(";", function () {
                lexer.loadString(";");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.OPERATOR.SEMICOLON);
            });
            it("<", function () {
                lexer.loadString("<");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.OPERATOR.LT);
            });
            it(">", function () {
                lexer.loadString(">");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.OPERATOR.GT);
            });
            it("<=", function () {
                lexer.loadString("<=");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.OPERATOR.LTE);
            });
            it(">=", function () {
                lexer.loadString(">=");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.OPERATOR.GTE);
            });
        });

    });
    describe("variables", function () {
        it("such as an \"@ sign followed by alphanumerics", function () {
            lexer.loadString("@testVariable");
            expect(lexer.getNextToken()).toBe(lexer.TOKEN.VARIABLE);
        });
    });
    describe("numbers", function () {
        it("such as one or more numerals between 0-9", function () {
            lexer.loadString("1234567890");
            expect(lexer.getNextToken()).toBe(lexer.TOKEN.NUMBER);
        });
    });
    describe("End of file token", function () {
        it("such as a string that contains the letter \"EOF\"", function () {
            lexer.loadString("EOF");
            expect(lexer.getNextToken()).toBe(lexer.TOKEN.ENDOFFILE);
        });
    });
    describe("Tags such as", function () {
        describe("Tags such as", function () {
            it("valid", function () {
                lexer.loadString("valid");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.TAG.VALID);
            });
            it("enabled", function () {
                lexer.loadString("enabled");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.TAG.ENABLED);
            });
            it("visible", function () {
                lexer.loadString("visible");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.TAG.VISIBLE);
            });
            it("optional", function () {
                lexer.loadString("optional");
                expect(lexer.getNextToken()).toBe(lexer.TOKEN.TAG.OPTIONAL);
            });

        });
    });

});