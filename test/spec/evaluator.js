describe("The evaluator module", function () {
	let uniform = window.uniform;
	
	it("is exposed globally as an object", function () {
		expect(uniform.evaluator).toEqual(jasmine.any(Object));
	});
	
	let evaluator = uniform.evaluator;
	let constants = uniform.constants;
	let Token = uniform.Token;
	let TypeError = uniform.errors.TypeError;
	
	describe("exposes the \"and\" member", function () {
		it("as a function", function () {
			expect(evaluator.and).toEqual(jasmine.any(Function));
		});
		
		let andOp = function (leftValue, leftType, rightValue, rightType) {
			return evaluator.and(() => new Token(leftValue, leftType), () => new Token(rightValue, rightType));
		};
		
		it("which performs the boolean AND operation on two input expressions", function () {
			expect(andOp(true, constants.TYPE.BOOL, false, constants.TYPE.BOOL)()).toEqualToken({
				value: false,
				type: constants.TYPE.BOOL
			});
		});
		
		it("which throws a TypeError when given invalid types", function () {
			// Check left operand
			expect(andOp(1, constants.TYPE.NUMBER, false, constants.TYPE.BOOL)).toThrowUfmError(TypeError);
			
			// Check right operand
			expect(andOp(false, constants.TYPE.BOOL, 1, constants.TYPE.NUMBER)).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"or\" member", function () {
		it("as a function", function () {
			expect(evaluator.or).toEqual(jasmine.any(Function));
		});
		
		let orOp = function (leftValue, leftType, rightValue, rightType) {
			return evaluator.or(() => new Token(leftValue, leftType), () => new Token(rightValue, rightType));
		};
		
		it("which performs the boolean OR operation on two input expressions", function () {
			expect(orOp(true, constants.TYPE.BOOL, false, constants.TYPE.BOOL)()).toEqualToken({
				value: true,
				type: constants.TYPE.BOOL
			});
		});
		
		it("which throws a TypeError when given invalid types", function () {
			// Check left operand
			expect(orOp(1, constants.TYPE.NUMBER, false, constants.TYPE.BOOL)).toThrowUfmError(TypeError);
			
			// Check right operand
			expect(orOp(false, constants.TYPE.BOOL, 1, constants.TYPE.NUMBER)).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"not\" member", function () {
		it("as a function", function () {
			expect(evaluator.not).toEqual(jasmine.any(Function));
		});
		
		let notOp = function (value, type) {
			return evaluator.not(() => new Token(value, type));
		};
		
		it("which performs the boolean NOT operation on an input expression", function () {
			expect(notOp(false, constants.TYPE.BOOL)()).toEqualToken({
				value: true,
				type: constants.TYPE.BOOL
			});
		});
		
		it("which throws a TypeError when given invalid types", function () {
			expect(notOp(1, constants.TYPE.NUMBER)).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"equals\" member", function () {
		it("as a function", function () {
			expect(evaluator.equals).toEqual(jasmine.any(Function));
		});
		
		let equalsOp = function (leftValue, leftType, rightValue, rightType) {
			return evaluator.equals(() => new Token(leftValue, leftType), () => new Token(rightValue, rightType));
		};
		
		it("which performs the boolean EQUALS operation on two input expressions", function () {
			expect(equalsOp(1, constants.TYPE.NUMBER, 1, constants.TYPE.NUMBER)()).toEqualToken({
				value: true,
				type: constants.TYPE.BOOL
			});
			
			expect(equalsOp(1, constants.TYPE.NUMBER, 2, constants.TYPE.NUMBER)()).toEqualToken({
				value: false,
				type: constants.TYPE.BOOL
			});
		});
		
		it("which returns a false token when given two expressions which result in different types", function () {
			expect(equalsOp(1, constants.TYPE.NUMBER, false, constants.TYPE.BOOL)()).toEqualToken({
				value: false,
				type: constants.TYPE.BOOL
			});
		});
	});
	
	describe("exposes the \"matches\" member", function () {
		it("as a function", function () {
			expect(evaluator.matches).toEqual(jasmine.any(Function));
		});
		
		let matchesOp = function (leftValue, leftType, rightValue, rightType) {
			return evaluator.matches(() => new Token(leftValue, leftType), () => new Token(rightValue, rightType));
		};
		
		it("which performs the regular expression MATCHES operation on two input expressions", function () {
			expect(matchesOp("test", constants.TYPE.STRING, /test/, constants.TYPE.REGEX)()).toEqualToken({
				value: true,
				type: constants.TYPE.BOOL
			});
			
			expect(matchesOp("hello", constants.TYPE.STRING, /world/, constants.TYPE.REGEX)()).toEqualToken({
				value: false,
				type: constants.TYPE.BOOL
			});
		});
		
		it("which throws a TypeError when given invalid types", function () {
			expect(matchesOp(1, constants.TYPE.NUMBER, /test/, constants.TYPE.REGEX)).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"is\" member", function () {
		it("as a function", function () {
			expect(evaluator.is).toEqual(jasmine.any(Function));
		});
		
		let isOp = function (leftValue, leftType, rightValue, rightType) {
			return evaluator.is(() => new Token(leftValue, leftType), () => new Token(rightValue, rightType));
		};
		
		it("which performs the boolean IS operation on two input expressions", function () {
			expect(isOp(1, constants.TYPE.NUMBER, constants.TYPE.NUMBER, constants.TYPE.STATE)()).toEqualToken({
				value: true,
				type: constants.TYPE.BOOL
			});
			
			expect(isOp(1, constants.TYPE.NUMBER, constants.TYPE.STRING, constants.TYPE.STATE)()).toEqualToken({
				value: false,
				type: constants.TYPE.BOOL
			});
		});
		
		it("which throws a TypeError when given an invalid state", function () {
			// Only check right expression, left accepts any type
			expect(isOp(1, constants.TYPE.NUMBER, "hello", constants.TYPE.STRING)).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"lt\" member", function () {
		it("as a function", function () {
			expect(evaluator.lt).toEqual(jasmine.any(Function));
		});
		
		let ltOp = function (leftValue, leftType, rightValue, rightType) {
			return evaluator.lt(() => new Token(leftValue, leftType), () => new Token(rightValue, rightType));
		};
		
		it("which performs the boolean LESS THAN operation on two input expressions", function () {
			expect(ltOp(1, constants.TYPE.NUMBER, 2, constants.TYPE.NUMBER)()).toEqualToken({
				value: true,
				type: constants.TYPE.BOOL
			});
			
			expect(ltOp(2, constants.TYPE.NUMBER, 1, constants.TYPE.NUMBER)()).toEqualToken({
				value: false,
				type: constants.TYPE.BOOL
			});
			
			expect(ltOp(1, constants.TYPE.NUMBER, 1, constants.TYPE.NUMBER)()).toEqualToken({
				value: false,
				type: constants.TYPE.BOOL
			});
		});
		
		it("which throws a TypeError when given invalid types", function () {
			// Check left expression
			expect(ltOp("test", constants.TYPE.STRING, 1, constants.TYPE.NUMBER)).toThrowUfmError(TypeError);
			
			// Check right expression
			expect(ltOp(1, constants.TYPE.NUMBER, "test", constants.TYPE.STRING)).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"gt\" member", function () {
		it("as a function", function () {
			expect(evaluator.gt).toEqual(jasmine.any(Function));
		});
		
		let gtOp = function (leftValue, leftType, rightValue, rightType) {
			return evaluator.gt(() => new Token(leftValue, leftType), () => new Token(rightValue, rightType));
		};
		
		it("which performs the boolean GREATER THAN operation on two input expressions", function () {
			expect(gtOp(2, constants.TYPE.NUMBER, 1, constants.TYPE.NUMBER)()).toEqualToken({
				value: true,
				type: constants.TYPE.BOOL
			});
			
			expect(gtOp(1, constants.TYPE.NUMBER, 2, constants.TYPE.NUMBER)()).toEqualToken({
				value: false,
				type: constants.TYPE.BOOL
			});
			
			expect(gtOp(1, constants.TYPE.NUMBER, 1, constants.TYPE.NUMBER)()).toEqualToken({
				value: false,
				type: constants.TYPE.BOOL
			});
		});
		
		it("which throws a TypeError when given invalid types", function () {
			// Check left expression
			expect(gtOp("test", constants.TYPE.STRING, 1, constants.TYPE.NUMBER)).toThrowUfmError(TypeError);
			
			// Check right expression
			expect(gtOp(1, constants.TYPE.NUMBER, "test", constants.TYPE.STRING)).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"lte\" member", function () {
		it("as a function", function () {
			expect(evaluator.lte).toEqual(jasmine.any(Function));
		});
		
		let lteOp = function (leftValue, leftType, rightValue, rightType) {
			return evaluator.lte(() => new Token(leftValue, leftType), () => new Token(rightValue, rightType));
		};
		
		it("which performs the boolean LESS THAN OR EQUAL TO operation on two input expressions", function () {
			expect(lteOp(1, constants.TYPE.NUMBER, 2, constants.TYPE.NUMBER)()).toEqualToken({
				value: true,
				type: constants.TYPE.BOOL
			});
			
			expect(lteOp(2, constants.TYPE.NUMBER, 1, constants.TYPE.NUMBER)()).toEqualToken({
				value: false,
				type: constants.TYPE.BOOL
			});
			
			expect(lteOp(1, constants.TYPE.NUMBER, 1, constants.TYPE.NUMBER)()).toEqualToken({
				value: true,
				type: constants.TYPE.BOOL
			});
		});
		
		it("which throws a TypeError when given invalid types", function () {
			// Check left expression
			expect(lteOp("test", constants.TYPE.STRING, 1, constants.TYPE.NUMBER)).toThrowUfmError(TypeError);
			
			// Check right expression
			expect(lteOp(1, constants.TYPE.NUMBER, "test", constants.TYPE.STRING)).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"gte\" member", function () {
		it("as a function", function () {
			expect(evaluator.gte).toEqual(jasmine.any(Function));
		});
		
		let gteOp = function (leftValue, leftType, rightValue, rightType) {
			return evaluator.gte(() => new Token(leftValue, leftType), () => new Token(rightValue, rightType));
		};
		
		it("which performs the boolean LESS THAN OR EQUAL TO operation on two input expressions", function () {
			expect(gteOp(2, constants.TYPE.NUMBER, 1, constants.TYPE.NUMBER)()).toEqualToken({
				value: true,
				type: constants.TYPE.BOOL
			});
			
			expect(gteOp(1, constants.TYPE.NUMBER, 2, constants.TYPE.NUMBER)()).toEqualToken({
				value: false,
				type: constants.TYPE.BOOL
			});
			
			expect(gteOp(1, constants.TYPE.NUMBER, 1, constants.TYPE.NUMBER)()).toEqualToken({
				value: true,
				type: constants.TYPE.BOOL
			});
		});
		
		it("which throws a TypeError when given invalid types", function () {
			// Check left expression
			expect(gteOp("test", constants.TYPE.STRING, 1, constants.TYPE.NUMBER)).toThrowUfmError(TypeError);
			
			// Check right expression
			expect(gteOp(1, constants.TYPE.NUMBER, "test", constants.TYPE.STRING)).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"add\" member", function () {
		it("as a function", function () {
			expect(evaluator.add).toEqual(jasmine.any(Function));
		});
		
		let addOp = function (leftValue, leftType, rightValue, rightType) {
			return evaluator.add(() => new Token(leftValue, leftType), () => new Token(rightValue, rightType));
		};
		
		it("which performs the arithmetic ADD operation on two input expressions", function () {
			expect(addOp(1, constants.TYPE.NUMBER, 2, constants.TYPE.NUMBER)()).toEqualToken({
				value: 3,
				type: constants.TYPE.NUMBER
			});
		});
		
		it("which throws a TypeError when given invalid types", function () {
			// Check left expression
			expect(addOp(false, constants.TYPE.BOOL, 1, constants.TYPE.NUMBER)).toThrowUfmError(TypeError);
			
			// Check right expression
			expect(addOp(1, constants.TYPE.NUMBER, false, constants.TYPE.BOOL)).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"sub\" member", function () {
		it("as a function", function () {
			expect(evaluator.sub).toEqual(jasmine.any(Function));
		});
		
		let subOp = function (leftValue, leftType, rightValue, rightType) {
			return evaluator.sub(() => new Token(leftValue, leftType), () => new Token(rightValue, rightType));
		};
		
		it("which performs the arithmetic SUBTRACT operation on two input expressions", function () {
			expect(subOp(3, constants.TYPE.NUMBER, 2, constants.TYPE.NUMBER)()).toEqualToken({
				value: 1,
				type: constants.TYPE.NUMBER
			});
		});
		
		it("which throws a TypeError when given invalid types", function () {
			// Check left expression
			expect(subOp(false, constants.TYPE.BOOL, 1, constants.TYPE.NUMBER)).toThrowUfmError(TypeError);
			
			// Check right expression
			expect(subOp(1, constants.TYPE.NUMBER, false, constants.TYPE.BOOL)).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"mul\" member", function () {
		it("as a function", function () {
			expect(evaluator.mul).toEqual(jasmine.any(Function));
		});
		
		let mulOp = function (leftValue, leftType, rightValue, rightType) {
			return evaluator.mul(() => new Token(leftValue, leftType), () => new Token(rightValue, rightType));
		};
		
		it("which performs the arithmetic MULTIPLY operation on two input expressions", function () {
			expect(mulOp(2, constants.TYPE.NUMBER, 3, constants.TYPE.NUMBER)()).toEqualToken({
				value: 6,
				type: constants.TYPE.NUMBER
			});
		});
		
		it("which throws a TypeError when given invalid types", function () {
			// Check left expression
			expect(mulOp(false, constants.TYPE.BOOL, 1, constants.TYPE.NUMBER)).toThrowUfmError(TypeError);
			
			// Check right expression
			expect(mulOp(1, constants.TYPE.NUMBER, false, constants.TYPE.BOOL)).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"div\" member", function () {
		it("as a function", function () {
			expect(evaluator.div).toEqual(jasmine.any(Function));
		});
		
		let divOp = function (leftValue, leftType, rightValue, rightType) {
			return evaluator.div(() => new Token(leftValue, leftType), () => new Token(rightValue, rightType));
		};
		
		it("which performs the arithmetic DIVISION operation on two input expressions", function () {
			expect(divOp(6, constants.TYPE.NUMBER, 3, constants.TYPE.NUMBER)()).toEqualToken({
				value: 2,
				type: constants.TYPE.NUMBER
			});
		});
		
		it("which throws a TypeError when given invalid types", function () {
			// Check left expression
			expect(divOp(false, constants.TYPE.BOOL, 1, constants.TYPE.NUMBER)).toThrowUfmError(TypeError);
			
			// Check right expression
			expect(divOp(1, constants.TYPE.NUMBER, false, constants.TYPE.BOOL)).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"mod\" member", function () {
		it("as a function", function () {
			expect(evaluator.mod).toEqual(jasmine.any(Function));
		});
		
		let modOp = function (leftValue, leftType, rightValue, rightType) {
			return evaluator.mod(() => new Token(leftValue, leftType), () => new Token(rightValue, rightType));
		};
		
		it("which performs the arithmetic MODULO operation on two input expressions", function () {
			expect(modOp(5, constants.TYPE.NUMBER, 3, constants.TYPE.NUMBER)()).toEqualToken({
				value: 2,
				type: constants.TYPE.NUMBER
			});
		});
		
		it("which throws a TypeError when given invalid types", function () {
			// Check left expression
			expect(modOp(false, constants.TYPE.BOOL, 1, constants.TYPE.NUMBER)).toThrowUfmError(TypeError);
			
			// Check right expression
			expect(modOp(1, constants.TYPE.NUMBER, false, constants.TYPE.BOOL)).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"neg\" member", function () {
		it("as a function", function () {
			expect(evaluator.neg).toEqual(jasmine.any(Function));
		});
		
		let negOp = function (value, type) {
			return evaluator.neg(() => new Token(value, type));
		};
		
		it("which performs the arithmetic NEGATION operation on two input expressions", function () {
			expect(negOp(2, constants.TYPE.NUMBER)()).toEqualToken({
				value: -2,
				type: constants.TYPE.NUMBER
			});
		});
		
		it("which throws a TypeError when given invalid types", function () {
			expect(negOp(false, constants.TYPE.BOOL)).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"dot\" member", function () {
		it("as a function", function () {
			expect(evaluator.dot).toEqual(jasmine.any(Function));
		});
		
		let dotOp = function (leftValue, leftType, rightValue, rightType) {
			return evaluator.dot(() => new Token(leftValue, leftType), () => new Token(rightValue, rightType));
		};
		
		it("which performs the DOT operation on two input expressions", function () {
			expect(dotOp({ "test": () => new Token(1, constants.TYPE.NUMBER) }, constants.TYPE.OBJECT, "test", constants.TYPE.IDENTIFIER)()).toEqualToken({
				value: 1,
				type: constants.TYPE.NUMBER
			});
		});
		
		it("which throws a TypeError when given invalid types", function () {
			expect(dotOp(false, constants.TYPE.BOOL)).toThrowUfmError(TypeError);
		});
	});
});