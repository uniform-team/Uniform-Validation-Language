describe("The coerce module", function () {
	let uniform = window.uniform;
	
	it("is defined as an object", function () {
		expect(uniform.coerce).toEqual(jasmine.any(Object));
	});
	
	let coerce = uniform.coerce;
	let constants = uniform.constants;
	let Token = uniform.Token;
	let TypeError = uniform.errors.TypeError;
	
	describe("exposes the \"toBool\" member", function () {
		it("as a function", function () {
			expect(coerce.toBool).toEqual(jasmine.any(Function));
		});
		
		let toBool = coerce.toBool;
		it("which passes boolean tokens through unchanged", function () {
			expect(toBool(new Token(true, constants.TYPE.BOOL))).toEqualToken({
				value: true,
				type: constants.TYPE.BOOL
			});
		});
		
		it("which throws a TypeError when given non-boolean inputs", function () {
			expect(() => toBool(new Token(1, constants.TYPE.NUMBER))).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"toNumber\" member", function () {
		it("as a function", function () {
			expect(coerce.toNumber).toEqual(jasmine.any(Function));
		});
		
		let toNumber = coerce.toNumber;
		it("which passes number tokens through unchanged", function () {
			expect(toNumber(new Token(1, constants.TYPE.NUMBER))).toEqualToken({
				value: 1,
				type: constants.TYPE.NUMBER
			});
		});
		
		it("which throws a TypeError when given non-numeric inputs", function () {
			expect(() => toNumber(new Token(false, constants.TYPE.BOOL))).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"toString\" member", function () {
		it("as a function", function () {
			expect(coerce.toString).toEqual(jasmine.any(Function));
		});
		
		let toString = coerce.toString;
		it("which passes string tokens through unchanged", function () {
			expect(toString(new Token("test", constants.TYPE.STRING))).toEqualToken({
				value: "test",
				type: constants.TYPE.STRING
			});
		});
		
		it("which throws a TypeError when given non-string inputs", function () {
			expect(() => toString(new Token(false, constants.TYPE.BOOL))).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"toRegex\" member", function () {
		it("as a function", function () {
			expect(coerce.toRegex).toEqual(jasmine.any(Function));
		});
		
		let toRegex = coerce.toRegex;
		it("which passes regular expression tokens through unchanged", function () {
			expect(toRegex(new Token(/test/, constants.TYPE.REGEX))).toEqualToken({
				value: /test/,
				type: constants.TYPE.REGEX
			});
		});
		
		it("which throws a TypeError when given non-regular expression inputs", function () {
			expect(() => toRegex(new Token(false, constants.TYPE.BOOL))).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"toState\" member", function () {
		it("as a function", function () {
			expect(coerce.toState).toEqual(jasmine.any(Function));
		});
		
		let toState = coerce.toState;
		it("which passes state tokens through unchanged", function () {
			expect(toState(new Token("number", constants.TYPE.STRING))).toEqualToken({
				value: "number",
				type: constants.TYPE.STRING
			});
		});
		
		it("which throws a TypeError when given non-state inputs", function () {
			expect(() => toState(new Token(false, constants.TYPE.BOOL))).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"toObject\" member", function () {
		it("as a function", function () {
			expect(coerce.toObject).toEqual(jasmine.any(Function));
		});
		
		let toObject = coerce.toObject;
		it("which passes object tokens through unchanged", function () {
			expect(toObject(new Token({}, constants.TYPE.OBJECT))).toEqualToken({
				value: {},
				type: constants.TYPE.OBJECT
			});
		});
		
		it("which throws a TypeError when given non-object inputs", function () {
			expect(() => toObject(new Token(false, constants.TYPE.BOOL))).toThrowUfmError(TypeError);
		});
	});
	
	describe("exposes the \"toIdentifier\" member", function () {
		it("as a function", function () {
			expect(coerce.toIdentifier).toEqual(jasmine.any(Function));
		});
		
		let toIdentifier = coerce.toIdentifier;
		it("which passes identifier tokens through unchanged", function () {
			expect(toIdentifier(new Token("test", constants.TYPE.IDENTIFIER))).toEqualToken({
				value: "test",
				type: constants.TYPE.IDENTIFIER
			});
		});
		
		it("which throws a TypeError when given non-identifier inputs", function () {
			expect(() => toIdentifier(new Token(false, constants.TYPE.BOOL))).toThrowUfmError(TypeError);
		});
	});
});