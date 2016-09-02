import parser from "../../src.es5/parser.js";

import constants from "../../src.es5/constants.js";
import Token from "../../src.es5/token.js";
import Scope from "../../src.es5/scope.js";
import * as evaluator from "../../src.es5/evaluator.js";
import { ExpressionVariable } from "../../src.es5/variable.js";
import { Identifier, ExpressionIdentifier } from "../../src.es5/identifier.js";
import Tag from "../../src.es5/tag.js";
import { ParsingError } from "../../src.es5/errors.js";

describe("The parser module", function () {
	describe("parses valid inputs such as", function () {
		beforeEach(() => Scope.reset());
		
		it("identifier blocks", function () {
			expect(() => parser.parse("test { }")).not.toThrow();
		});
		
		it("variable blocks", function () {
			expect(() => parser.parse("@test { }")).not.toThrow();
		});
		
		it("nested blocks", function () {
			expect(() => parser.parse("test1 { test2 { } }")).not.toThrow();
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
				expect(parser.parse("\"test\" matches /\"test\"/")()).toEqualToken({
					value: true,
					type: constants.TYPE.BOOL
				});
			});
			
			it("is", function () {
				expect(parser.parse("\"test\" is string")()).toEqualToken({
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
				spyOn($.prototype, "val").and.returnValue("data");
				spyOn(ExpressionIdentifier.prototype, "addDependent");
                
				let owner = {
				    addDependee: jasmine.createSpy("addDependee")
                };
				expect(parser.parse("test", owner)()).toEqualToken({
					value: "data",
					type: constants.TYPE.STRING
				});
                expect(ExpressionIdentifier.prototype.addDependent).toHaveBeenCalledWith(owner);
                expect(owner.addDependee).toHaveBeenCalledWith(jasmine.any(ExpressionIdentifier));
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
				expect(parser.parse("/\"test\"/")()).toEqualToken({
					value: /test/,
					type: constants.TYPE.REGEX
				});
			});
			
			it("variables", function () {
			    let variable = new ExpressionVariable(new Token("test", constants.TYPE.VARIABLE));
                variable.initDependable(() => new Token(true, constants.TYPE.BOOL));
                variable.update();
                
			    spyOn(Scope.prototype, "lookupVar").and.returnValue(variable);
                spyOn(ExpressionVariable.prototype, "addDependent");
			    
                let owner = {
                    addDependee: jasmine.createSpy("addDependee")
                };
				expect(parser.parse("@test", owner)()).toEqualToken({
					value: true,
					type: constants.TYPE.BOOL
				});
                
                expect(ExpressionVariable.prototype.addDependent).toHaveBeenCalledWith(owner);
                expect(owner.addDependee).toHaveBeenCalledWith(variable);
			});
			
			it("selectors", function () {
				expect(parser.parse("$(\"test\")")()).toEqualToken({
					value: "test",
					type: constants.TYPE.SELECTOR
				});
			});
			
			it("states", function () {
				expect(parser.parse("string")()).toEqualToken({
					value: "string",
					type: constants.TYPE.KEYWORD
				});
				
				expect(parser.parse("number")()).toEqualToken({
					value: "number",
					type: constants.TYPE.KEYWORD
				});
			});
			
			it("this keyword", function () {
				expect(parser.parse("this")()).toEqualToken({
					value: "this",
					type: constants.TYPE.SELECTOR
				});
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
					
					let expr = value.test;
					expect(expr()).toEqualToken({
						value: true,
						type: constants.TYPE.BOOL
					});
				});
				
				it("with multiple key-value pairs", function () {
					let token = parser.parse("{ test: true; test2: false; }")();
					let { value, type } = token;
					expect(type).toBe(constants.TYPE.OBJECT);
					
					let expr1 = value.test;
					expect(expr1()).toEqualToken({
						value: true,
						type: constants.TYPE.BOOL
					});
					
					let expr2 = value.test2;
					expect(expr2()).toEqualToken({
						value: false,
						type: constants.TYPE.BOOL
					});
				});
				
				it("with nested objects", function () {
					let token = parser.parse("{ test: { foo: \"bar\"; }; }")();
					let { value, type } = token;
					expect(type).toBe(constants.TYPE.OBJECT);
					
					let expr = value.test;
					let innerObjToken = expr();
					expect(innerObjToken.type).toBe(constants.TYPE.OBJECT);
					
					let innerExpr = innerObjToken.value.foo;
					expect(innerExpr()).toEqualToken({
						value: "bar",
						type: constants.TYPE.STRING
					});
				});
			});
		});
	});
	
	describe("parses valid inputs while setting up dependencies", function () {
		let callbacks = [];
		let data = {};
		
		// Spy on jQuery functions to provide helper functions
		beforeEach(function () {
			spyOn($.prototype, "on").and.callFake(function (evt, sel, cb) {
				callbacks.push({ sel, cb });
			});
			
			spyOn($.prototype, "val").and.callFake(function () {
				// Read the value of this selector from the data table
				let value = data[this.sel];
				if (!value) throw new Error("Unknown jQuery selector: " + this.sel);
				return value;
			});
            
            // Clear identifier mapping to ensure state does not bleed through tests
            Identifier._map = { };
            
            // Clear scopes to prevent redeclaration errors
            Scope.reset();
		});
		
		afterEach(function () {
			callbacks = [];
			data = {};
		});
		
		// Set a virtual <input /> tag with the given name as having the given value and trigger necessary jQuery events
		let setValue = function (name, value) {
			// Se the data table with the value for its selector
			let selector = "[name=\"" + name + "\"]";
			data[selector] = value;
			
			// Trigger all functions which listened to $.on(...)
			for (let { sel, cb } of callbacks) {
				if (selector === sel) cb();
			}
		};
		
        it("such as a single identifier dependency", function () {
            spyOn(evaluator, "equals").and.callFake(function (leftExpr, rightExpr) {
                return () => new Token(leftExpr().value === rightExpr().value, constants.TYPE.BOOL)
            });
            
            setValue("inner", "foo");
            
            parser.parse("outer { valid: inner equals \"bar\"; }");
            
            expect(Identifier.find("outer").getTag("valid").value).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
            
            setValue("inner", "bar");
            expect(Identifier.find("outer").getTag("valid").value).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as multiple identifier dependencies", function () {
            spyOn(evaluator, "equals").and.callFake(function (leftExpr, rightExpr) {
                return () => new Token(leftExpr().value === rightExpr().value, constants.TYPE.BOOL)
            });
            spyOn(evaluator, "and").and.callFake(function (leftExpr, rightExpr) {
                return () => new Token(leftExpr().value && rightExpr().value, constants.TYPE.BOOL);
            });
            
            setValue("inner1", "bar");
            setValue("inner2", "bar");
            
            parser.parse("outer { valid: inner1 equals \"foo\" and inner2 equals \"bar\"; }");
            
            expect(Identifier.find("outer").getTag("valid").value).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
            
            setValue("inner1", "foo");
            expect(Identifier.find("outer").getTag("valid").value).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
            
            setValue("inner2", "foo");
            expect(Identifier.find("outer").getTag("valid").value).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a single tag dependency", function () {
        	parser.parse(
        	    "inner { valid: true; }"
                + "outer { valid: inner.valid; }"
            );
            
            expect(Identifier.find("outer").getTag("valid").value).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a single tag dependency on top an identifier dependency", function () {
            spyOn(evaluator, "equals").and.callFake(function (leftExpr, rightExpr) {
                return () => new Token(leftExpr().value === rightExpr().value, constants.TYPE.BOOL)
            });
            
            setValue("test", "foo");
            
        	parser.parse(
        	    "inner { valid: test equals \"bar\"; }"
                + "outer { valid: inner.valid; }"
            );
            
            expect(Identifier.find("outer").getTag("valid").value).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
            
            setValue("test", "bar");
            expect(Identifier.find("outer").getTag("valid").value).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as multiple tag dependencies on top of identifier dependencies", function () {
            spyOn(evaluator, "equals").and.callFake(function (leftExpr, rightExpr) {
                return () => new Token(leftExpr().value === rightExpr().value, constants.TYPE.BOOL)
            });
            spyOn(evaluator, "and").and.callFake(function (leftExpr, rightExpr) {
                return () => new Token(leftExpr().value && rightExpr().value, constants.TYPE.BOOL);
            });
    
            setValue("inner1", "bar");
            setValue("inner2", "bar");
            
            parser.parse(
                "outer1 { valid: inner1 equals \"foo\"; }"
                + "outer2 { valid: inner2 equals \"bar\"; }"
                + "final { valid: outer1.valid and outer2.valid; }"
            );
    
            expect(Identifier.find("final").getTag("valid").value).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
    
            setValue("inner1", "foo");
            expect(Identifier.find("final").getTag("valid").value).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
            
            setValue("inner2", "foo");
            expect(Identifier.find("final").getTag("valid").value).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a tag dependency declared later in the file", function () {
            spyOn(evaluator, "equals").and.callFake(function (leftExpr, rightExpr) {
                return () => new Token(leftExpr().value === rightExpr().value, constants.TYPE.BOOL)
            });
    
            setValue("inner", "foo");
    
            parser.parse(
                "outer { valid: inner.valid; }"
                + "inner { valid: true; }"
            );
            
            expect(Identifier.find("outer").getTag("valid").value).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a single variable dependency", function () {
        	parser.parse(
        	    "@test: true;"
                + "final { valid: @test; }"
            );
            
            expect(Identifier.find("final").getTag("valid").value).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a single variable dependency on top of an identifier dependency", function () {
            spyOn(evaluator, "equals").and.callFake(function (leftExpr, rightExpr) {
                return () => new Token(leftExpr().value === rightExpr().value, constants.TYPE.BOOL)
            });
    
            setValue("inner", "foo");
            
        	parser.parse(
        	    "@test: inner equals \"bar\";"
                + "final { valid: @test; }"
            );
            
            expect(Identifier.find("final").getTag("valid").value).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
            
            setValue("inner", "bar");
            expect(Identifier.find("final").getTag("valid").value).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as multiple variable dependencies on top of identifier dependencies", function () {
            spyOn(evaluator, "equals").and.callFake(function (leftExpr, rightExpr) {
                return () => new Token(leftExpr().value === rightExpr().value, constants.TYPE.BOOL)
            });
            spyOn(evaluator, "and").and.callFake(function (leftExpr, rightExpr) {
                return () => new Token(leftExpr().value && rightExpr().value, constants.TYPE.BOOL);
            });
    
            setValue("inner1", "foo");
            setValue("inner2", "foo");
            
            parser.parse(
                "@outer1: inner1 equals \"bar\";"
                + "@outer2: inner2 equals \"foo\";"
                + "final { valid: @outer1 and @outer2; }"
            );
    
            expect(Identifier.find("final").getTag("valid").value).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
    
            setValue("inner1", "bar");
            expect(Identifier.find("final").getTag("valid").value).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
    
            setValue("inner2", "bar");
            expect(Identifier.find("final").getTag("valid").value).toEqualToken({
                value: false,
                type: constants.TYPE.BOOL
            });
        });
        
        it("such as a variable dependency declared later in the file", function () {
            parser.parse(
                "final { valid: @test; }"
                + "@test: true;"
            );
    
            expect(Identifier.find("final").getTag("valid").value).toEqualToken({
                value: true,
                type: constants.TYPE.BOOL
            });
        });
	});
	
	describe("throws an error when given invalid expressions such as", function () {
		it("following a block with a non-block and non-statement", function () {
			expect(() => parser.parse("test { } true")).toThrowUfmError(ParsingError);
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
		
		it("using a non-operand as an operand", function () {
			expect(() => parser.parse("result: any valid;")).toThrowUfmError(ParsingError);
		});
	});
});