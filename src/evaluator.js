import constants from "./constants.js";
import * as coerce from "./coerce.js";
import Scope from "./scope.js";
import Identifier from "./identifier.js";
import { BlockVariable } from "./variable.js";
import { TypeError, UndeclaredError, AssertionError } from "./errors.js";

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

// Export IF-ELSEIF-ELSE operation
export function ifStmt(conditionExprs, resultExprs, elseResultExpr) {
    return function () {
        // Loop over each possibility
        for (let i = 0; i < conditionExprs.length; ++i) {
            // Evaluate the condition
            let condition = coerce.toBool(conditionExprs[i]());
            
            // If the condition is true, return its associated result
            if (condition.value === true) {
                return resultExprs[i]();
            }
        }

        // No condition was true, use the else result
        return elseResultExpr();
    };
}

// Export DOT operation for objects
export function dotObject(leftExpr, rightVal) {
    return function () {
        let left = coerce.toObject(leftExpr());
        let right = coerce.toIdentifier(rightVal);
        
        let result = left.value[right.value];
        
        return left.clone({ value: result.value, type: result.type });
    };
}

// DOT operation for identifier.tag
function dotTagIdentifier(leftVal, rightVal) {
    let left = coerce.toIdentifier(leftVal);
    let right = coerce.toTag(rightVal);
    
    return function () {
        let identifier = Identifier.find(left.value);
        if (!identifier) throw new UndeclaredError("Identifier " + left.value + " was not declared", left.line, left.col);
        
        let tag = identifier.getTag(right.value);
        if (!tag) throw new UndeclaredError("Tag " + left.value + "." + right.value + " was not declared", left.line, left.col);
        
        return tag.value;
    };
}

// DOT operation for @variable.tag
function dotTagVariable(leftVal, rightVal) {
    let left = coerce.toVariable(leftVal);
    let right = coerce.toTag(rightVal);
    let scope = Scope.thisScope;
    
    return function () {
        let variable = scope.lookupVar(left.value);
        if (!variable) throw new UndeclaredError("Variable @" + left.value + " was not declared", left.line, left.col);
        if (!(variable instanceof BlockVariable)) throw new TypeError("Variable @" + left.value + " is an expression and not a block", left.line, left.col);
        
        let tag = variable.getTag(right.value);
        if (!tag) throw new UndeclaredError("Tag @" + left.value + "." + right.value + " was not declared", left.line, left.col);
        
        return tag.value;
    };
}

// Export DOT operation for tags
export function dotTag(leftVal, rightVal) {
    // Determine whether to perform an identifier or variable DOT operation
    if (leftVal.type === constants.TYPE.IDENTIFIER) {
        return dotTagIdentifier(leftVal, rightVal);
    } else if (leftVal.type === constants.TYPE.VARIABLE) {
        return dotTagVariable(leftVal, rightVal);
    } else {
        throw new AssertionError("Unable to perform a DOT operation on a " + leftVal.type + ", expected an identifier or variable.", leftVal.line, leftVal.col);
    }
}