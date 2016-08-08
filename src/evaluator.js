import constants from "./constants.js";
import * as coerce from "./coerce.js";

// Export boolean AND operation
export function and(leftExpr, rightExpr) {
	return function () {
		let left = coerce.toBool(leftExpr());
		let right = coerce.toBool(rightExpr());
		
		return left.clone({ value: left.value && right.value, type: constants.TYPE.BOOL });
	};
}

// Export boolean OR operation
export function or(leftExpr, rightExpr) {
	return function () {
		let left = coerce.toBool(leftExpr());
		let right = coerce.toBool(rightExpr());
		
		return left.clone({ value: left.value || right.value, type: constants.TYPE.BOOL });
	};
}

// Export boolean NOT operation
export function not(expr) {
	return function () {
		let result = coerce.toBool(expr());
		
		return result.clone({ value: !result.value, type: constants.TYPE.BOOL });
	};
}

// Export boolean EQUALS operation
export function equals(leftExpr, rightExpr) {
	return function () {
		let left = leftExpr();
		let right = rightExpr();
		
		if (left.type !== right.type) return left.clone({ value: false, type: constants.TYPE.BOOL });
		else return left.clone({ value: left.value === right.value, type: constants.TYPE.BOOL });
	};
}

// Export regular expression MATCHES operation
export function matches(leftExpr, rightExpr) {
	return function () {
		let left = coerce.toString(leftExpr());
		let right = coerce.toRegex(rightExpr());
		
		return left.clone({ value: right.value.test(left.value), type: constants.TYPE.BOOL });
	};
}

// Export boolean IS operation
export function is(leftExpr, rightExpr) {
	return function () {
		let left = leftExpr();
		let right = coerce.toState(rightExpr());
		
		return left.clone({ value: left.type === right.value, type: constants.TYPE.BOOL });
	};
}

// Export boolean LESS THAN operation
export function lt(leftExpr, rightExpr) {
	return function () {
		let left = coerce.toNumber(leftExpr());
		let right = coerce.toNumber(rightExpr());
		
		return left.clone({ value: left.value < right.value, type: constants.TYPE.BOOL });
	};
}

// Export boolean GREATER THAN operation
export function gt(leftExpr, rightExpr) {
	return function () {
		let left = coerce.toNumber(leftExpr());
		let right = coerce.toNumber(rightExpr());
		
		return left.clone({ value: left.value > right.value, type: constants.TYPE.BOOL });
	};
}

// Export boolean LESS THAN OR EQUAL TO operation
export function lte(leftExpr, rightExpr) {
	return function () {
		let left = coerce.toNumber(leftExpr());
		let right = coerce.toNumber(rightExpr());
		
		return left.clone({ value: left.value <= right.value, type: constants.TYPE.BOOL });
	};
}

// Export boolean GREATER THAN OR EQUAL TO operation
export function gte(leftExpr, rightExpr) {
	return function () {
		let left = coerce.toNumber(leftExpr());
		let right = coerce.toNumber(rightExpr());
		
		return left.clone({ value: left.value >= right.value, type: constants.TYPE.BOOL });
	};
}

// Export numeric ADDITION operation
export function add(leftExpr, rightExpr) {
	return function () {
		let left = coerce.toNumber(leftExpr());
		let right = coerce.toNumber(rightExpr());
		
		return left.clone({ value: left.value + right.value, type: constants.TYPE.NUMBER });
	};
}

// Export numeric SUBTRACTION operation
export function sub(leftExpr, rightExpr) {
	return function () {
		let left = coerce.toNumber(leftExpr());
		let right = coerce.toNumber(rightExpr());
		
		return left.clone({ value: left.value - right.value, type: constants.TYPE.NUMBER });
	};
}

// Export numeric MULTIPLY operation
export function mul(leftExpr, rightExpr) {
	return function () {
		let left = coerce.toNumber(leftExpr());
		let right = coerce.toNumber(rightExpr());
		
		return left.clone({ value: left.value * right.value, type: constants.TYPE.NUMBER });
	};
}

// Export numeric DIVISION operation
export function div(leftExpr, rightExpr) {
	return function () {
		let left = coerce.toNumber(leftExpr());
		let right = coerce.toNumber(rightExpr());
		
		return left.clone({ value: left.value / right.value, type: constants.TYPE.NUMBER });
	};
}

// Export numeric MODULO operation
export function mod(leftExpr, rightExpr) {
	return function () {
		let left = coerce.toNumber(leftExpr());
		let right = coerce.toNumber(rightExpr());
		
		return left.clone({ value: left.value % right.value, type: constants.TYPE.NUMBER});
	};
}

// Export numeric NEGATION operation
export function neg(expr) {
	return function () {
		let result = coerce.toNumber(expr());
		
		return result.clone({ value: -result.value, type: constants.TYPE.NUMBER });
	};
}

// Export DOT operation
export function dot(leftExpr, rightExpr) {
	return function () {
		let left = coerce.toObject(leftExpr());
		let right = coerce.toIdentifier(rightExpr());
		
		let expr = left.value[right.value];
		let result = expr();
		
		return left.clone({ value: result.value, type: result.type });
	};
}