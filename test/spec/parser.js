import parser from "../../src.es5/parser.js";

import constants from "../../src.es5/constants.js";
import Token from "../../src.es5/token.js";
import Scope from "../../src.es5/scope.js";
import root from "../../src.es5/root.js";
import { ExpressionVariable } from "../../src.es5/variable.js";
import Identifier from "../../src.es5/identifier.js";
import Dependable from "../../src.es5/dependable.js";
import Tag from "../../src.es5/tag.js";
import { ParsingError, TypeError, UndeclaredError } from "../../src.es5/errors.js";

describe("The parser module", function () {
    beforeEach(function () {
        // Reset identifiers and scope to avoid bleeding state
        Identifier.init();
        Scope.reset();
    });
    
    let callbacks = [];
    let data = {};
    
    // Spy on jQuery functions to provide helper functions
    beforeEach(function () {
        spyOn($.prototype, "on").and.callFake(function (evt, sel, cb) {
            callbacks.push({ sel, cb });
        });
        
        spyOn($.prototype, "find").and.callFake(function (sel) {
            this.sel += " " + sel; // Append child selector to parent
            return this;
        });
        
        spyOn($.prototype, "val").and.callFake(function () {
            // Read the string value of this selector from the data table
            return data[this.sel];
        });
        
        spyOn($.prototype, "is").and.callFake(function (attribute) {
            // Read the boolean value of this selector from the data table
            if (attribute === ":checked") return data[this.sel];
            else if (attribute === ":input") return data[this.sel];
            else throw new Error(`Cannot mock call to $("${this.sel}").is("${attribute}").`);
        });
    });
    
    afterEach(function () {
        callbacks = [];
        data = {};
    });
    
    // Set a virtual <input /> tag with the given name as having the given value and trigger necessary jQuery events
    const setInputValue = function (name, value) {
        setValue("[name=\"" + name + "\"]", value);
    };
    
    // Set a virtual element with the given name as having the given value and trigger necessary jQuery events
    const setValue = function (selector, value) {
        // Set the data table with the value for its selector
        data[selector] = value;
    
        // Trigger all functions which listened to $.on(...)
        for (let { sel, cb } of callbacks) {
            if (selector === sel) cb();
        }
    };
    
    describe("parses valid inputs such as", function () {
        it("identifier blocks", function () {
            expect(() => parser.parse(
                "string: test;\n"
                + "test { }"
            )).not.toThrow();
        });
        
        it("variable blocks", function () {
            expect(() => parser.parse("@test { }")).not.toThrow();
        });
        
        it("nested blocks", function () {
            expect(() => parser.parse(
                "string: test1;\n"
                + "string: test2;\n"
                + "test1 { test2 { } }"
            )).not.toThrow();
        });
        
        it("tag statements", function () {
            spyOn(Tag.prototype, "update");
            
            expect(() => parser.parse("valid: true;")).not.toThrow();
            
            expect(Tag.prototype.update).toHaveBeenCalled();
        });
        
        it("variable statements", function () {
            expect(() => parser.parse("@test: true;")).not.toThrow();
        });
        
        it("empty file", function () {
            expect(() => parser.parse("")).not.toThrow();
        });
    });
    
    describe("parses valid expressions", function () {
        beforeAll(function () {
            parser._testExpr = true;
        });
        
        afterAll(function () {
            parser._testExpr = false;
        });
        
        describe("with boolean operators such as", function () {
            it("and", function () {
                expect(parser.parse("true and false")()).toEqualToken({
                    value: false,
                    type: constants.TYPE.BOOL
                });
            });
            
            it("or", function () {
                expect(parser.parse("true or false")()).toEqualToken({
                    value: true,
                    type: constants.TYPE.BOOL
                });
            });
            
            it("not", function () {
                expect(parser.parse("not true")()).toEqualToken({
                    value: false,
                    type: constants.TYPE.BOOL
                });
            });
            
            it("chained not", function () {
                expect(parser.parse("not not not not true")()).toEqualToken({
                    value: true,
                    type: constants.TYPE.BOOL
                });
            });
        });
        
        describe("with comparison operators such as", function () {
            it("equals", function () {
                expect(parser.parse("true equals true")()).toEqualToken({
                    value: true,
                    type: constants.TYPE.BOOL
                });
            });
            
            it("matches", function () {
                expect(parser.parse(`"test" matches /test/`)()).toEqualToken({
                    value: true,
                    type: constants.TYPE.BOOL
                });
            });
            
            it("<", function () {
                expect(parser.parse("1 < 1")()).toEqualToken({
                    value: false,
                    type: constants.TYPE.BOOL
                });
            });
            
            it(">", function () {
                expect(parser.parse("1 > 1")()).toEqualToken({
                    value: false,
                    type: constants.TYPE.BOOL
                });
            });
            
            it("<=", function () {
                expect(parser.parse("1 <= 1")()).toEqualToken({
                    value: true,
                    type: constants.TYPE.BOOL
                });
            });
            
            it(">=", function () {
                expect(parser.parse("1 >= 1")()).toEqualToken({
                    value: true,
                    type: constants.TYPE.BOOL
                });
            });
        });
        
        describe("with arithmetic operators such as", function () {
            it("addition", function () {
                expect(parser.parse("1 + 1")()).toEqualToken({
                    value: 2,
                    type: constants.TYPE.NUMBER
                });
            });
            
            it("subtraction", function () {
                expect(parser.parse("1 - 1")()).toEqualToken({
                    value: 0,
                    type: constants.TYPE.NUMBER
                });
            });
            
            it("multiplication", function () {
                expect(parser.parse("2 * 3")()).toEqualToken({
                    value: 6,
                    type: constants.TYPE.NUMBER
                });
            });
            
            it("division", function () {
                expect(parser.parse("6 / 3")()).toEqualToken({
                    value: 2,
                    type: constants.TYPE.NUMBER
                });
            });
            
            it("modulo", function () {
                expect(parser.parse("7 % 3")()).toEqualToken({
                    value: 1,
                    type: constants.TYPE.NUMBER
                });
            });
            
            it("negation", function () {
                expect(parser.parse("- 1")()).toEqualToken({
                    value: -1,
                    type: constants.TYPE.NUMBER
                });
            });
            
            it("chained negation", function () {
                expect(parser.parse("- - - - 1")()).toEqualToken({
                    value: 1,
                    type: constants.TYPE.NUMBER
                });
            });
        });
        
        describe("with miscellaneous operators such as", function () {
            describe("if statements", function () {
                it("satisfying the if condition", function () {
                    expect(parser.parse(
                        "if 1 equals 1 then 1\n"
                        + "elif 2 equals 3 then 2\n"
                        + "elif 3 equals 4 then 3\n"
                        + "else 4 end"
                    )()).toEqualToken({
                        value: 1,
                        type: constants.TYPE.NUMBER
                    });
                });
                
                it("satisfying an else-if condition", function () {
                    expect(parser.parse(
                        "if 1 equals 2 then 1\n"
                        + "elif 2 equals 3 then 2\n"
                        + "elif 3 equals 3 then 3\n"
                        + "else 4 end"
                    )()).toEqualToken({
                        value: 3,
                        type: constants.TYPE.NUMBER
                    });
                });
                
                it("satisfying the else condition", function () {
                    expect(parser.parse(
                        "if 1 equals 2 then 1\n"
                        + "elif 2 equals 3 then 2\n"
                        + "elif 3 equals 4 then 3\n"
                        + "else 4 end"
                    )()).toEqualToken({
                        value: 4,
                        type: constants.TYPE.NUMBER
                    });
                });
                
                describe("with no else-if clauses", function () {
                    it("satisfying the if condition", function () {
                        expect(parser.parse(
                            "if 1 equals 1 then 1\n"
                            + "else 2 end"
                        )()).toEqualToken({
                            value: 1,
                            type: constants.TYPE.NUMBER
                        });
                    });
                    
                    it("satisfying the else condition", function () {
                        expect(parser.parse(
                            "if 1 equals 2 then 1\n"
                            + "else 2 end"
                        )()).toEqualToken({
                            value: 2,
                            type: constants.TYPE.NUMBER
                        });
                    });
                });
                
                describe("which warns when given suspect code", function () {
                    it("such as same line else if", function () {
                        parser.parse(
                            "if 1 equals 1 then 1\n"
                            + "else if 2 equals 2 then 2\n"
                            + "else 3 end end"
                        );
                        expect(console.warn).toHaveBeenCalled();
                    });
                });
                
                describe("which does not warn on non-suspect code", function () {
                    it("such as valid else-if", function () {
                        parser.parse(
                            "if 1 equals 1 then 1\n"
                            + "elif 2 equals 2 then 2\n"
                            + "else 3 end"
                        );
                        
                        expect(console.warn).not.toHaveBeenCalled();
                    });
                    
                    it("such as different line else if", function () {
                        parser.parse(
                            "if 1 equals 1 then 1\n"
                            + "else\n"
                            + "    if 2 equals 2 then 2\n"
                            + "    else 3 end\n"
                            + "end"
                        );
                        
                        expect(console.warn).not.toHaveBeenCalled();
                    });
                });
            });
            
            it("dotObject", function () {
                expect(parser.parse("{ foo: \"bar\"; }.foo")()).toEqualToken({
                    value: "bar",
                    type: constants.TYPE.STRING
                });
            });
            
            it("paren", function () {
                expect(parser.parse("( true )")()).toEqualToken({
                    value: true,
                    type: constants.TYPE.BOOL
                });
            });
        });
        
        describe("with operands such as", function () {
            it("identifiers", function () {
                setInputValue("test", "data");
    
                spyOn(Dependable, "addDependency");
                
                const owner = jasmineUtil.createDependable(() => null);
                
                const token = parser.parse(
                    "string: test;\n"
                    + "test",
                owner)();
                
                expect(token).toEqualToken({
                    value: "data",
                    type: constants.TYPE.STRING
                });
                expect(Dependable.addDependency).toHaveBeenCalledWith(owner, jasmine.any(Identifier));
            });
            
            it("booleans", function () {
                expect(parser.parse("true")()).toEqualToken({
                    value: true,
                    type: constants.TYPE.BOOL
                });
                
                expect(parser.parse("false")()).toEqualToken({
                    value: false,
                    type: constants.TYPE.BOOL
                });
            });
            
            it("numbers", function () {
                expect(parser.parse("1")()).toEqualToken({
                    value: 1,
                        type: constants.TYPE.NUMBER
                });
            });
            
            it("strings", function () {
                expect(parser.parse("\"test\"")()).toEqualToken({
                    value: "test",
                    type: constants.TYPE.STRING
                });
            });
            
            it("regular expressions", function () {
                expect(parser.parse("/test/")()).toEqualToken({
                    value: /test/,
                    type: constants.TYPE.REGEX
                });
            });
            
            it("variables", function () {
                const variable = new ExpressionVariable(new Token("test", constants.TYPE.VARIABLE));
                variable.initDependable(() => new Token(true, constants.TYPE.BOOL));
                variable.update();
                
                spyOn(Scope.prototype, "lookupVar").and.returnValue(variable);
                spyOn(Dependable, "addDependency");
                
                const owner = jasmineUtil.createDependable();
                expect(parser.parse("@test", owner)()).toEqualToken({
                    value: true,
                    type: constants.TYPE.BOOL
                });
                
                expect(Dependable.addDependency).toHaveBeenCalledWith(owner, variable);
            });
            
            describe("objects", function () {
                it("with no key-value pairs", function () {
                    expect(parser.parse("{ }")()).toEqualToken({
                        value: { },
                        type: constants.TYPE.OBJECT
                    });
                });
                
                it("with a single key-value pair", function () {
                    let token = parser.parse("{ test: true; }")();
                    let { value, type } = token;
                    expect(type).toBe(constants.TYPE.OBJECT);
                    
                    expect(value.test).toEqualToken({
                        value: true,
                        type: constants.TYPE.BOOL
                    });
                });
                
                it("with multiple key-value pairs", function () {
                    let token = parser.parse("{ test: true; test2: false; }")();
                    let { value, type } = token;
                    expect(type).toBe(constants.TYPE.OBJECT);
                    
                    expect(value.test).toEqualToken({
                        value: true,
                        type: constants.TYPE.BOOL
                    });
                    
                    expect(value.test2).toEqualToken({
                        value: false,
                        type: constants.TYPE.BOOL
                    });
                });
                
                it("with nested objects", function () {
                    let token = parser.parse("{ test: { foo: \"bar\"; }; }")();
                    let { value, type } = token;
                    
                    expect(type).toBe(constants.TYPE.OBJECT);
                    expect(value.test.type).toBe(constants.TYPE.OBJECT);
                    
                    let innerObj = value.test.value;
                    expect(innerObj.foo).toEqualToken({
                        value: "bar",
                        type: constants.TYPE.STRING
                    });
                });
            });
        });
    });
    
    describe("parses valid inputs while setting up dependencies", function () {
        it("such as a single identifier dependency", function () {
            setInputValue("inner", "foo");
            
            parser.parse(
                "string: inner;\n"
                + "valid: inner equals \"bar\";"
            );
            
            expect(root().valid).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
            
            setInputValue("inner", "bar");
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as multiple identifier dependencies", function () {
            setInputValue("inner1", "bar");
            setInputValue("inner2", "bar");
            
            parser.parse(
                "string: inner1;\n"
                + "string: inner2;\n"
                + "valid: inner1 equals \"foo\" and inner2 equals \"bar\";"
            );
            
            expect(root().valid).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
            
            setInputValue("inner1", "foo");
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
            
            setInputValue("inner2", "foo");
            expect(root().valid).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as an identifier dependency embedded in an object", function () {
            setInputValue("test", "foo");
            
            parser.parse(
                "string: test;\n"
                + "valid: {\n"
                + "    test: test;\n"
                + "}.test equals \"bar\";"
            );
            
            expect(root().valid).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
            
            setInputValue("test", "bar");
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a single tag dependency", function () {
            parser.parse(
                "string: inner;\n"
                + "inner { valid: true; }\n"
                + "valid: inner.valid;"
            );
            
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a single tag dependency on top an identifier dependency", function () {
            setInputValue("test", "foo");
            
            parser.parse(
                "string: inner;\n"
                + "string: test;\n"
                + "inner { valid: test equals \"bar\"; }\n"
                + "valid: inner.valid;"
            );
            
            expect(root().valid).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
            
            setInputValue("test", "bar");
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as multiple tag dependencies on top of identifier dependencies", function () {
            setInputValue("inner1", "bar");
            setInputValue("inner2", "bar");
            
            parser.parse(
                "string: outer1;\n"
                + "string: outer2;\n"
                + "string: inner1;\n"
                + "string: inner2;\n"
                + "outer1 { valid: inner1 equals \"foo\"; }\n"
                + "outer2 { valid: inner2 equals \"bar\"; }\n"
                + "valid: outer1.valid and outer2.valid;"
            );
    
            expect(root().valid).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
    
            setInputValue("inner1", "foo");
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
            
            setInputValue("inner2", "foo");
            expect(root().valid).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a nested tag dependency", function () {
            setInputValue("test", "foo");
            
            parser.parse(
                "string: outer;\n"
                + "string: inner;\n"
                + "string: test;\n"
                + "inner { valid: test equals \"bar\"; }\n"
                + "outer { valid: inner.valid; }\n"
                + "valid: outer.valid;"
            );
            
            expect(root().valid).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
            
            setInputValue("test", "bar");
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a tag dependency declared later in the file", function () {
            setInputValue("inner", "foo");
    
            parser.parse(
                "string: inner;\n"
                + "valid: inner.valid;\n"
                + "inner { valid: true; }"
            );
            
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a single expression variable dependency", function () {
            parser.parse(
                "@test: true;\n"
                + "valid: @test;"
            );
            
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a single expression variable dependency on top of an identifier dependency", function () {
            setInputValue("inner", "foo");
            
            parser.parse(
                "string: inner;\n"
                + "@test: inner equals \"bar\";\n"
                + "valid: @test;"
            );
            
            expect(root().valid).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
            
            setInputValue("inner", "bar");
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as multiple expression variable dependencies on top of identifier dependencies", function () {
            setInputValue("inner1", "foo");
            setInputValue("inner2", "foo");
            
            parser.parse(
                "string: inner1;\n"
                + "string: inner2;\n"
                + "@outer1: inner1 equals \"bar\";\n"
                + "@outer2: inner2 equals \"foo\";\n"
                + "valid: @outer1 and @outer2;"
            );
    
            expect(root().valid).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
    
            setInputValue("inner1", "bar");
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
    
            setInputValue("inner2", "bar");
            expect(root().valid).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a nested expression variable dependency", function () {
            setInputValue("test", "foo");
            
            parser.parse(
                "string: test;\n"
                + "@inner: test equals \"bar\";\n"
                + "@outer: @inner;\n"
                + "valid: @outer;"
            );
            
            expect(root().valid).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
            
            setInputValue("test", "bar");
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as an expression variable dependency declared later in the file", function () {
            parser.parse(
                "valid: @test;\n"
                + "@test: true;"
            );
    
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a single block variable dependency", function () {
            parser.parse(
                "@test { valid: true; }\n"
                + "valid: @test.valid;"
            );
            
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a single block variable dependency on top of an identifier dependency", function () {
            setInputValue("inner", "bar");
            
            parser.parse(
                "string: inner;\n"
                + "@outer { valid: inner equals \"foo\"; }\n"
                + "valid: @outer.valid;"
            );
            
            expect(root().valid).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
            
            setInputValue("inner", "foo");
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as multiple block variable dependencies on top of identifier dependencies", function () {
            setInputValue("inner1", "foo");
            setInputValue("inner2", "foo");
    
            parser.parse(
                "string: inner1;\n"
                + "string: inner2;\n"
                + "@outer1 { valid: inner1 equals \"bar\"; }\n"
                + "@outer2 { valid: inner2 equals \"foo\"; }\n"
                + "valid: @outer1.valid and @outer2.valid;"
            );
    
            expect(root().valid).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
    
            setInputValue("inner1", "bar");
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
            
            setInputValue("inner2", "bar");
            expect(root().valid).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a nested block variable dependency", function () {
            setInputValue("test", "foo");
            
            parser.parse(
                "string: test;\n"
                + "@inner { valid: test equals \"bar\"; }\n"
                + "@outer { valid: @inner.valid; }\n"
                + "valid: @outer.valid;"
            );
            
            expect(root().valid).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
            
            setInputValue("test", "bar");
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a block variable dependency declared later in the file", function () {
            parser.parse(
                "valid: @test.valid;\n"
                + "@test { valid: true; }"
            );
    
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a dependency using `this` keyword", function () {
            setInputValue("foo", "foo");
            
            parser.parse(
                "string: foo;\n"
                + "valid: foo.valid;\n"
                + "foo { valid: this equals \"bar\"; }"
            );
            
            expect(root().valid).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
            
            setInputValue("foo", "bar");
            expect(root().valid).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
    });
    
    describe("throws an error when given invalid expressions such as", function () {
        beforeEach(function () {
            Scope.reset();
        });
        
        it("following a block with a non-block and non-statement", function () {
            expect(() => parser.parse(
                "string: test;\n"
                + "test { }\n"
                + "true"
            )).toThrowUfmError(ParsingError);
        });
        
        it("using a non-block and non-statement as a block or statement", function () {
            expect(() => parser.parse("true")).toThrowUfmError(ParsingError);
        });
        
        it("following a variable (when in block) with a non-block and non-statement", function () {
            expect(() => parser.parse("@test;")).toThrowUfmError(ParsingError);
        });
        
        it("chaining and / all", function () {
            expect(() => parser.parse("result: any all @array;")).toThrowUfmError(ParsingError);
        });
        
        it("using a non-boolean if condition", function () {
            expect(() => parser.parse("valid: if 1 then 1 else 2 end;")).toThrowUfmError(TypeError);
        });
        
        it("using an if without an else", function () {
            expect(() => parser.parse("valid: if true then 1 end;")).toThrowUfmError(ParsingError);
        });
        
        it("using an if with else-ifs but no else", function () {
            expect(() => parser.parse("valid:\n"
                + " if 1 equals 1 then 1\n"
                + " else if 2 equals 2 then 2\n"
                + "end\n"
            + ";")).toThrowUfmError(ParsingError);
        });
        
        it("using a non-operand as an operand", function () {
            expect(() => parser.parse("result: any valid;")).toThrowUfmError(ParsingError);
        });
        
        it("using the DOT operator on an expression variable", function () {
            expect(() => parser.parse(
                "@test: \"foo\";\n"
                + "valid: @test.valid;"
            )).toThrowUfmError(TypeError);
        });
        
        it("using a block variable directly", function () {
            expect(() => parser.parse(
                "@test { valid: true; }\n"
                + "valid: @test;"
            )).toThrowUfmError(TypeError);
        });
    
        it("using `this` in the root scope", function () {
            expect(() => parser.parse(
                "valid: this equals \"foo\";"
            )).toThrowUfmError(ParsingError);
        });
        
        it("using `this` in a block variable", function () {
            expect(() => parser.parse(
                "@test { valid: this equals \"foo\"; }"
            )).toThrowUfmError(ParsingError);
        });
    });
});