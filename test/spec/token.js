import Token from "../../src.es5/token.js";

import constants from "../../src.es5/constants.js";

describe("The Token class", function () {
	describe("exposes the \"clone\" member", function () {
		it("as a function", function () {
			expect(Token.prototype.clone).toEqual(jasmine.any(Function));
		});
		
		it("which returns a new Token as a clone of this one with no arguments", function () {
			let token = new Token("test", constants.TYPE.IDENTIFIER, 0, 1);
			expect(token.clone()).toEqual(jasmine.objectContaining({
				value: "test",
				type: constants.TYPE.IDENTIFIER,
				line: 0,
				col: 1
			}));
		});
		
		it("which returns a new Token as a clone of this one using the value, type, line, or col specified", function () {
			let token = new Token("test", constants.TYPE.IDENTIFIER, 0, 1);
			expect(token.clone({ value: "test2", type: constants.TYPE.VARIABLE })).toEqual(jasmine.objectContaining({
				value: "test2",
				type: constants.TYPE.VARIABLE,
				line: 0,
				col: 1
			}));
			
			expect(token.clone({ line: 2, col: 3 })).toEqual(jasmine.objectContaining({
				value: "test",
				type: constants.TYPE.IDENTIFIER,
				line: 2,
				col: 3
			}));
		});
	});
	
	describe("exposes the \"getSelector\" member", function () {
		it("as a function", function () {
			expect(Token.prototype.getSelector).toEqual(jasmine.any(Function));
		});
		
		it("which returns this Token's jQuery selector", function () {
			expect(new Token("make", constants.TYPE.IDENTIFIER).getSelector()).toBe("[name=\"make\"]");
		});
	});
	
	describe("exposes the \"isTag\" member", function () {
		it("as a function", function () {
			expect(Token.prototype.isTag).toEqual(jasmine.any(Function));
		});
		
		let assertTag = function (value, type) {
			return new Token(value, type).isTag();
		};
		
		describe("which returns true when this Token is a tag, such as", function () {
			it("valid", function () {
				expect(assertTag("valid", constants.TAG.VALID)).toBe(true);
			});
			
			it("enabled", function () {
				expect(assertTag("enabled", constants.TAG.ENABLED)).toBe(true);
			});
			
			it("visible", function () {
				expect(assertTag("visible", constants.TAG.VISIBLE)).toBe(true);
			});
			
			it("return", function () {
				expect(assertTag("return", constants.TAG.RETURN)).toBe(true);
			});
		});
		
		it("which returns false when this Token is not a tag", function () {
			expect(assertTag(constants.STATE.STRING, constants.TYPE.KEYWORD)).toBe(false);
			expect(assertTag(true, constants.TYPE.BOOL)).toBe(false);
			expect(assertTag(constants.OPERATOR.ADD, constants.TYPE.KEYWORD)).toBe(false);
			// ...
		});
	});
	
	describe("exposes the \"isComparator\" member", function () {
		it("as a function", function () {
			expect(Token.prototype.isComparator).toEqual(jasmine.any(Function));
		});
		
		let assertComparator = function (value, type) {
			return new Token(value, type).isComparator();
		};
		
		describe("which returns true when this Token is a comparator, such as", function () {
			it("equals", function () {
				expect(assertComparator(constants.OPERATOR.EQUALS, constants.TYPE.KEYWORD)).toBe(true);
			});
			
			it("matches", function () {
				expect(assertComparator(constants.OPERATOR.MATCHES, constants.TYPE.KEYWORD)).toBe(true);
			});
			
			it("is", function () {
				expect(assertComparator(constants.OPERATOR.IS, constants.TYPE.KEYWORD)).toBe(true);
			});
			
			it("<", function () {
				expect(assertComparator(constants.OPERATOR.LT, constants.TYPE.KEYWORD)).toBe(true);
			});
			
			it(">", function () {
				expect(assertComparator(constants.OPERATOR.GT, constants.TYPE.KEYWORD)).toBe(true);
			});
			
			it("<=", function () {
				expect(assertComparator(constants.OPERATOR.LTE, constants.TYPE.KEYWORD)).toBe(true);
			});
			
			it(">=", function () {
				expect(assertComparator(constants.OPERATOR.GTE, constants.TYPE.KEYWORD)).toBe(true);
			});
		});
		
		it("which returns false when this Token is not a comparator", function () {
			expect(assertComparator(constants.STATE.STRING, constants.TYPE.KEYWORD)).toBe(false);
			expect(assertComparator(true, constants.TYPE.BOOL)).toBe(false);
			expect(assertComparator(constants.OPERATOR.ADD, constants.TYPE.KEYWORD)).toBe(false);
			// ...
		});
	});
	
	describe("exposes the \"isOperand\" member", function () {
		it("as a function", function () {
			expect(Token.prototype.isOperand).toEqual(jasmine.any(Function));
		});
		
		let assertOperand = function (value, type) {
			return new Token(value, type).isOperand();
		};
		
		describe("which returns true when this Token is an operand, such as", function () {
			it("identifiers", function () {
				expect(assertOperand("test", constants.TYPE.IDENTIFIER)).toBe(true);
			});
			
			it("booleans", function () {
				expect(assertOperand(true, constants.TYPE.BOOL)).toBe(true);
				expect(assertOperand(false, constants.TYPE.BOOL)).toBe(true);
			});
			
			it("numbers", function () {
				expect(assertOperand(1, constants.TYPE.NUMBER)).toBe(true);
			});
			
			it("strings", function () {
				expect(assertOperand("test", constants.TYPE.STRING)).toBe(true);
			});
			
			it("regular expressions", function () {
				expect(assertOperand("test", constants.TYPE.REGEX)).toBe(true);
			});
			
			it("variables", function () {
				expect(assertOperand("test", constants.TYPE.VARIABLE)).toBe(true);
			});
			
			it("selectors", function () {
				expect(assertOperand("$(\"test\")", constants.TYPE.SELECTOR)).toBe(true);
			});
			
			it("states", function () {
				expect(assertOperand(constants.STATE.STRING, constants.TYPE.KEYWORD)).toBe(true);
				expect(assertOperand(constants.STATE.NUMBER, constants.TYPE.KEYWORD)).toBe(true);
			});
			
			it("this keyword", function () {
				expect(assertOperand("this", constants.THIS)).toBe(true);
			});
		});
		
		it("which returns false when this Token is not an operand", function () {
			expect(assertOperand(constants.OPERATOR.COLON, constants.TYPE.KEYWORD)).toBe(false);
			expect(assertOperand(constants.OPERATOR.LBRACE, constants.TYPE.KEYWORD)).toBe(false);
			expect(assertOperand(constants.OPERATOR.ADD, constants.TYPE.KEYWORD)).toBe(false);
			// ...
		});
	});
	
	describe("exposes the \"isState\" member", function () {
		it("as a function", function () {
			expect(Token.prototype.isState).toEqual(jasmine.any(Function));
		});
		
		let assertState = function (value, type) {
			return new Token(value, type).isState();
		};
		describe("which returns true when this Token is a state, such as", function () {
			it("string", function () {
				expect(assertState(constants.STATE.STRING, constants.TYPE.KEYWORD)).toBe(true);
			});
			
			it("number", function () {
				expect(assertState(constants.STATE.NUMBER, constants.TYPE.KEYWORD)).toBe(true);
			});
		});
		
		it("which returns false when this Token is not a state", function () {
			expect(assertState("test", constants.TYPE.IDENTIFIER)).toBe(false);
			expect(assertState(true, constants.TYPE.BOOL)).toBe(false);
			expect(assertState(constants.OPERATOR.ADD, constants.TYPE.KEYWORD)).toBe(false);
			// ...
		});
	});
});