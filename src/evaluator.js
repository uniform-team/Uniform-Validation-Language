var lexer = require("./lexer.js");

require("./env.js")(function (document, $) {
    function isState(token) {
        return token.value === lexer.TOKEN.STATE.VALID ||
            token.value === lexer.TOKEN.STATE.ENABLED ||
            token.value === lexer.TOKEN.STATE.VISIBLE ||
            token.value === lexer.TOKEN.STATE.OPTIONAL ||
            token.value === lexer.TOKEN.STATE.STRING ||
            token.value === lexer.TOKEN.STATE.NUMBER
		;
    }

    function isUfmArray(token) {
        return (token.type === lexer.TOKEN.TYPE.UFM ||
			token.type === lexer.TOKEN.TYPE.ANY ||
			token.type === lexer.TOKEN.TYPE.ALL)
		;
    }

    function arrayHelper(op, leftFunction, rightFunction) {
        var opResult;
        switch (op) {
            case lexer.TOKEN.OPERATOR.EQUALS:
                opResult = module.exports.equals(leftFunction, rightFunction);
                break;
            case lexer.TOKEN.OPERATOR.AND:
                opResult = module.exports.and(leftFunction, rightFunction);
                break;
            case lexer.TOKEN.OPERATOR.OR:
                opResult = module.exports.or(leftFunction, rightFunction);
                break;
            case lexer.TOKEN.OPERATOR.MATCHES:
                opResult = module.exports.matches(leftFunction, rightFunction);
                break;
            case lexer.TOKEN.OPERATOR.LT:
                opResult = module.exports.lt(leftFunction, rightFunction);
                break;
            case lexer.TOKEN.OPERATOR.GT:
                opResult = module.exports.gt(leftFunction, rightFunction);
                break;
            case lexer.TOKEN.OPERATOR.LTE:
                opResult = module.exports.lte(leftFunction, rightFunction);
                break;
            case lexer.TOKEN.OPERATOR.GTE:
                opResult = module.exports.gte(leftFunction, rightFunction);
                break;
            case lexer.TOKEN.OPERATOR.IS:
                opResult = module.exports.is(leftFunction, rightFunction);
                break;
            default:
                throw new Error("Line " + leftFunction().line + ": invalid array operation " + op);
        }
        return opResult;
    }

    //Selectors are stored in the token(value, type, line, col) format
    //token.value refers to the literal selector, or selector array in the value field above ie '$("#selector")'
    //token.value.type() is a jQuery function being called on that particular selector
    //  and is different than token.type, which is UFM type.
    function derefUfm(token) {
        var ufmArray = [];
        var tokenType = token.type;
        if (isUfmArray(token)) {
            for (var i = 0; i < token.value.length; i++) {
                ufmArray.push($(token.value[i]).ufm().value(token));
            }

            if (token.value.length === 1)
                return new lexer.Token(ufmArray[0].value, ufmArray[0].type, token.line, token.col);
            else return new lexer.Token(ufmArray, tokenType, token.line, token.col);
        }
        else return token;
    }

    //coerce functions will convert the ufm object to the appropriate type and throw an error otherwise
    function coerceToNumber(token) {
        token = derefUfm(token);
        try {
            if (token.type === lexer.TOKEN.TYPE.NUMBER) {
                if (isNaN(token.value))
                    throw new Error("Line " + token.line + ": cannot coerce " + token.type + " to number");
                else return token;
            }
            else if (isUfmArray(token))
                return token;
            else if (token.type === lexer.TOKEN.TYPE.STRING) {
                var temp = parseInt(token.value);
                if (isNaN(temp))
                    throw new Error("Line " + token.line + ": cannot coerce " + token.type + " to number");
                else return new lexer.Token(temp, lexer.TOKEN.TYPE.NUMBER, token.line, token.col);
            }
            throw new Error("Line " + token.line + ": cannot coerce " + token.type + " to number");
        }
        catch (ex) {
            console.warn("Line " + token.line + ": cannot coerce " + token.type + " to number, returning false");
            return new lexer.Token(lexer.TOKEN.VALUE.ERROR, lexer.TOKEN.TYPE.ERROR, token.line, token.col);
        }
    }

    function coerceToString(token) {
        token = derefUfm(token);
        try {
            if (token.type === lexer.TOKEN.TYPE.STRING || isUfmArray(token))
                return token;
            else if (token.type === lexer.TOKEN.TYPE.NUMBER) {
                return new lexer.Token(token.value + "", lexer.TOKEN.TYPE.STRING, token.line, token.col);
            }
            throw new Error("Line " + token.line + ": cannot coerce " + token.type + " to string");
        }
        catch (ex) {
            console.warn("Line " + token.line + ": cannot coerce " + token.type + " to string, returning false");
            return new lexer.Token(lexer.TOKEN.VALUE.ERROR, lexer.TOKEN.TYPE.ERROR, token.line, token.col);
        }
    }

    function coerceToBool(token) {
        token = derefUfm(token);
        try {
            if (token.type === lexer.TOKEN.TYPE.BOOL || isUfmArray(token))
                return token;
            throw new Error("Line " + token.line + ": cannot coerce " + token.type + " to bool");
        }
        catch (ex) {
            console.warn("Line " + token.line + ": cannot coerce " + token.type + " to bool, returning false");
            return new lexer.Token(lexer.TOKEN.VALUE.ERROR, lexer.TOKEN.TYPE.ERROR, token.line, token.col);
        }
    }

    module.exports = {
        //Helper Functions
        isState: isState,

        isTag: function (token) {
            return (token.value === lexer.TOKEN.TAG.VALID ||
            token.value === lexer.TOKEN.TAG.OPTIONAL ||
            token.value === lexer.TOKEN.TAG.ENABLED ||
            token.value === lexer.TOKEN.TAG.VISIBLE);
        },
        isStatement: function (token) {
            return (this.isTag(token) ||
            token.type === lexer.TOKEN.TYPE.SELECTOR ||
            token.type === lexer.TOKEN.TYPE.VARIABLE);
        },
        isExpressionOp: function (token) {
            return (token.value === lexer.TOKEN.OPERATOR.EQUALS ||
            token.value === lexer.TOKEN.OPERATOR.MATCHES ||
            token.value === lexer.TOKEN.OPERATOR.IS ||
            token.value === lexer.TOKEN.OPERATOR.LT ||
            token.value === lexer.TOKEN.OPERATOR.GT ||
            token.value === lexer.TOKEN.OPERATOR.LTE ||
            token.value === lexer.TOKEN.OPERATOR.GTE ||
            token.value === lexer.TOKEN.OPERATOR.ENCLOSES ||
            token.value === lexer.TOKEN.OPERATOR.INTERSECTS);
        },

        derefUfm: derefUfm,
        coerceToNumber: coerceToNumber,
        coerceToString: coerceToString,
        coerceToBool: coerceToBool,
        arrayOperation: arrayOperation,

        //Evaluation Functions
        and: function (leftExpr, rightExpr) { // Implicitly creates the closure we needed the self-executing function for
            return function (self) {
                var left = coerceToBool(leftExpr(self));
                var right = coerceToBool(rightExpr(self));

                if (isUfmArray(left) || isUfmArray(right))
                    return arrayOperation(left, right, lexer.TOKEN.OPERATOR.AND);
                if (left.type === lexer.TOKEN.TYPE.ERROR || right.type === lexer.TOKEN.TYPE.ERROR)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);

                return new lexer.Token(left.value && right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
            };
        },
        or: function (leftExpr, rightExpr) {
            return function (self) {
                var left = coerceToBool(leftExpr(self));
                var right = coerceToBool(rightExpr(self));
                if (isUfmArray(left) || isUfmArray(right))
                    return arrayOperation(left, right, lexer.TOKEN.OPERATOR.OR);
                if (left.type === lexer.TOKEN.TYPE.ERROR || right.type === lexer.TOKEN.TYPE.ERROR)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);

                return new lexer.Token(left.value || right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
            };
        },
        not: function (inExpr) {
            return function (self) {
                var expr = coerceToBool(inExpr(self));
                return new lexer.Token(!expr.value, lexer.TOKEN.TYPE.BOOL, expr.line, expr.col);
            };
        },

        lt: function (leftExpr, rightExpr) {
            return function (self) {
                var left = coerceToNumber(leftExpr(self));
                var right = coerceToNumber(rightExpr(self));
                if (isUfmArray(left) || isUfmArray(right))
                    return arrayOperation(left, right, lexer.TOKEN.OPERATOR.LT);
                if (left.type === lexer.TOKEN.TYPE.ERROR || right.type === lexer.TOKEN.TYPE.ERROR)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);

                return new lexer.Token(left.value < right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
            };
        },
        gt: function (leftExpr, rightExpr) {
            return function (self) {
                var left = coerceToNumber(leftExpr(self));
                var right = coerceToNumber(rightExpr(self));
                if (isUfmArray(left) || isUfmArray(right))
                    return arrayOperation(left, right, lexer.TOKEN.OPERATOR.GT);
                if (left.type === lexer.TOKEN.TYPE.ERROR || right.type === lexer.TOKEN.TYPE.ERROR)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);

                return new lexer.Token(left.value > right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
            };
        },
        gte: function (leftExpr, rightExpr) {
            return function (self) {
                var left = coerceToNumber(leftExpr(self));
                var right = coerceToNumber(rightExpr(self));
                if (isUfmArray(left) || isUfmArray(right))
                    return arrayOperation(left, right, lexer.TOKEN.OPERATOR.GTE);
                if (left.type === lexer.TOKEN.TYPE.ERROR || right.type === lexer.TOKEN.TYPE.ERROR)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);

                return new lexer.Token(left.value >= right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
            };
        },
        lte: function (leftExpr, rightExpr) {
            return function (self) {
                var left = coerceToNumber(leftExpr(self));
                var right = coerceToNumber(rightExpr(self));
                if (isUfmArray(left) || isUfmArray(right))
                    return arrayOperation(left, right, lexer.TOKEN.OPERATOR.LTE);
                if (left.type === lexer.TOKEN.TYPE.ERROR || right.type === lexer.TOKEN.TYPE.ERROR)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);

                return new lexer.Token(left.value <= right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
            };
        },
        equals: function (leftExpr, rightExpr) {
            return function (self) {
                var left = derefUfm(leftExpr(self));
                var right = derefUfm(rightExpr(self));

                if (left.type === lexer.TOKEN.TYPE.NUMBER && right.type === lexer.TOKEN.TYPE.STRING)
                    right = coerceToNumber(right);
                else if (left.type === lexer.TOKEN.TYPE.STRING && right.type === lexer.TOKEN.TYPE.NUMBER)
                    left = coerceToNumber(left);

                if (isUfmArray(left) || isUfmArray(right))
                    return arrayOperation(left, right, lexer.TOKEN.OPERATOR.EQUALS);
                if (left.type === lexer.TOKEN.TYPE.ERROR || right.type === lexer.TOKEN.TYPE.ERROR)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);

                if (left.type === right.type)
                    return new lexer.Token(left.value === right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
                else return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
            }
        },
        matches: function (leftExpr, rightExpr) {
            return function (self) {
                var left = coerceToString(leftExpr(self));
                var right = rightExpr(self);
                if (isUfmArray(left))
                    return arrayOperation(left, right, lexer.TOKEN.OPERATOR.MATCHES);
                if (left.type === lexer.TOKEN.TYPE.ERROR || right.type === lexer.TOKEN.TYPE.ERROR)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);

                var tempRegex = new RegExp(right.value);
                if (right.type === lexer.TOKEN.TYPE.REGEX)
                    return new lexer.Token(tempRegex.test(left.value), lexer.TOKEN.TYPE.BOOL, left.line, left.col);
                else throw new Error("Line " + left.line + ": cannot perform matches operation, right operand must be of type REGEX");
            };
        },
        is: function (leftExpr, rightExpr) {
            return function (self) {
                var left = derefUfm(leftExpr(self));
                var right = rightExpr(self);
                if (isUfmArray(left))
                    return arrayOperation(left, right, lexer.TOKEN.OPERATOR.IS);
                if (left.type === lexer.TOKEN.TYPE.ERROR || right.type === lexer.TOKEN.TYPE.ERROR)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);

				if (isState(right) && left.type === lexer.TOKEN.TYPE.STATE_OBJECT) {
					if (right.value === lexer.TOKEN.STATE.VALID)
						return new lexer.Token(left.value.valid, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
					else if (right.value === lexer.TOKEN.STATE.ENABLED)
						return new lexer.Token(left.value.enabled, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
					else if (right.value === lexer.TOKEN.STATE.VISIBLE)
						return new lexer.Token(left.value.visible, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
					else if (right.value === lexer.TOKEN.STATE.OPTIONAL)
						return new lexer.Token(left.value.optional, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
				}
                else if (right.value === lexer.TOKEN.STATE.STRING) {
                    left = derefUfm(left);
                    var isString = left.type === lexer.TOKEN.TYPE.STRING;
                    return new lexer.Token(isString, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
                }
                else if (right.value === lexer.TOKEN.STATE.NUMBER) {
                    left = derefUfm(left);
                    var isNum = left.type === lexer.TOKEN.TYPE.NUMBER;
                    return new lexer.Token(isNum, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
                }
                else throw new Error("Line " + left.line + ": cannot perform is operation, invalid operands");
            };
        },
        add: function (leftExpr, rightExpr) {
            return function (self) {
                var left = coerceToNumber(leftExpr(self));
                var right = coerceToNumber(rightExpr(self));
                if (left.type === lexer.TOKEN.TYPE.ERROR || right.type === lexer.TOKEN.TYPE.ERROR)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);

                return new lexer.Token(left.value + right.value, lexer.TOKEN.TYPE.NUMBER, right.line, right.col);
            };
        },
        sub: function (leftExpr, rightExpr) {
            return function (self) {
                var left = coerceToNumber(leftExpr(self));
                var right = coerceToNumber(rightExpr(self));
                if (left.type === lexer.TOKEN.TYPE.ERROR || right.type === lexer.TOKEN.TYPE.ERROR)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);

                return new lexer.Token(left.value - right.value, lexer.TOKEN.TYPE.NUMBER, right.line, right.col);
            };
        },
        mul: function (leftExpr, rightExpr) {
            return function (self) {
                var left = coerceToNumber(leftExpr(self));
                var right = coerceToNumber(rightExpr(self));
                if (left.type === lexer.TOKEN.TYPE.ERROR || right.type === lexer.TOKEN.TYPE.ERROR)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);

                return new lexer.Token(left.value * right.value, lexer.TOKEN.TYPE.NUMBER, right.line, right.col);
            };
        },
        div: function (leftExpr, rightExpr) {
            return function (self) {
                var left = coerceToNumber(leftExpr(self));
                var right = coerceToNumber(rightExpr(self));
                if (left.type === lexer.TOKEN.TYPE.ERROR || right.type === lexer.TOKEN.TYPE.ERROR)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);

                return new lexer.Token(left.value / right.value, lexer.TOKEN.TYPE.NUMBER, right.line, right.col);
            };
        },
        mod: function (leftExpr, rightExpr) {
            return function (self) {
                var left = coerceToNumber(leftExpr(self));
                var right = coerceToNumber(rightExpr(self));
                if (left.type === lexer.TOKEN.TYPE.ERROR || right.type === lexer.TOKEN.TYPE.ERROR)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);

                return new lexer.Token(left.value % right.value, lexer.TOKEN.TYPE.NUMBER, right.line, right.col);
            };
        },
        neg: function (inExpr) {
            return function (self) {
                var expr = coerceToNumber(inExpr(self));
                if (expr.type === lexer.TOKEN.TYPE.ERROR)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, expr.line, expr.col);

                if (expr.type === lexer.TOKEN.TYPE.NUMBER)
                    return new lexer.Token(-expr.value, lexer.TOKEN.TYPE.NUMBER, expr.line, expr.col);
                else throw new Error("Line " + expr.line + ": cannot perform negation operation, operand is not of type NUMBER");
            };
        },
        dot: function (leftExpr, id, args) {
            return function (self) {
                var expr = leftExpr(self);
                if (expr.type !== lexer.TOKEN.TYPE.UFM) {
                    throw new Error("Line " + expr.line + ", column " + expr.col + ": cannot perform dot operation, operand is not of type SELECTOR");
                }

                // Evaluate arguments
                var evaluatedArgs = [];
                for (var i = 0; i < args.length; ++i) {
                    evaluatedArgs.push(args[i](self).value);
                }

                var func = expr.value[id];
                if (typeof func !== "function") {
                    throw new Error("Line " + expr.line + ", column " + expr.col + ": cannot execute \"" + id + "\" of type \"" + typeof func + "\" as a function.")
                }

                // Execute function with the provided arguments
                var result = func.apply(expr.value, evaluatedArgs);

                // Assume result is a selector and wrap as a UFM object (may not be true for some jQuery functions)
                return new lexer.Token(result.ufm(), lexer.TOKEN.TYPE.UFM, expr.line, expr.col);
            };
        },
        all: function (inExpr) {
            return function (self) {
                var expr = inExpr(self);
                if (expr.type === lexer.TOKEN.TYPE.UFM) {
                    expr.type = lexer.TOKEN.TYPE.ALL;
                    return expr;
                }
                else throw new Error("Line " + expr.line + ": selector must follow ALL keyword ");
            };
        },
        any: function (inExpr) {
            return function (self) {
                var expr = inExpr(self);
                if (expr.type === lexer.TOKEN.TYPE.UFM) {
                    expr.type = lexer.TOKEN.TYPE.ANY;
                    return expr;
                }
                else throw new Error("Line " + expr.line + ": selector must follow ANY keyword ");
            };
        }
    };

    //left and right are ufm array type
    function arrayOperation(left, right, op) {
        // Default to ANY
        if (left.type === lexer.TOKEN.TYPE.UFM) left.type = lexer.TOKEN.TYPE.ANY;
        if (right.type === lexer.TOKEN.TYPE.UFM) right.type = lexer.TOKEN.TYPE.ANY;

        //any any
        if (left.type === lexer.TOKEN.TYPE.ANY && right.type === lexer.TOKEN.TYPE.ANY) {
            for (var i = 0; i < left.value.length; i++) {
                for (var j = 0; j < right.value.length; j++) {
                    var leftFunction = function () { return left.value[i]; };
                    var rightFunction = function () { return right.value[i]; };
                    var opResult = arrayHelper(op, leftFunction, rightFunction);
                    if (opResult().value === true) {
                        return new lexer.Token(true, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
                    }
                }
            }
            return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
        }
        //any all
        else if (left.type === lexer.TOKEN.TYPE.ANY && right.type === lexer.TOKEN.TYPE.ALL) {
            var opSuccess = true;
            for (var i = 0; i < right.value.length; i++) {
                for (var j = 0; j < left.value.length; j++) {
                    var leftFunction = function () { return left.value[j]; };
                    var rightFunction = function () { return right.value[i]; };
                    var opResult = arrayHelper(op, leftFunction, rightFunction);
                    if (opResult().value === false)
                        opSuccess = false;
                    else {
                        opSuccess = true;
                        break;
                    }
                }
                if (!opSuccess)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
            }
            return new lexer.Token(true, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
        }

        //all any
        else if (left.type === lexer.TOKEN.TYPE.ALL && right.type === lexer.TOKEN.TYPE.ANY) {
            var opSuccess = true;
            for (var i = 0; i < left.value.length; i++) {
                for (var j = 0; j < right.value.length; j++) {
                    var leftFunction = function () { return left.value[i]; };
                    var rightFunction = function () { return right.value[j]; };
                    var opResult = arrayHelper(op, leftFunction, rightFunction);
                    if (opResult().value === false)
                        opSuccess = false;
                    else {
                        opSuccess = true;
                        break;
                    }
                }
                if (!opSuccess)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
            }
            return new lexer.Token(true, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
        }
        //all all
        else if (left.type === lexer.TOKEN.TYPE.ALL && right.type === lexer.TOKEN.TYPE.ALL) {
            for (var i = 0; i < left.value.length; i++) {
                for (var j = 0; j < right.value.length; j++) {
                    var leftFunction = function () { return left.value[i]; };
                    var rightFunction = function () { return right.value[i]; };
                    var opResult = arrayHelper(op, leftFunction, rightFunction);
                    if (opResult().value === false)
                        return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
                }
            }
            return new lexer.Token(true, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
        }

        //sel/const all
        else if (right.type === lexer.TOKEN.TYPE.ALL) {
            for (var i = 0; i < right.value.length; i++) {
                var leftFunction = function () { return left; };
                var rightFunction = function () { return right.value[i]; };
                var opResult = arrayHelper(op, leftFunction, rightFunction);
                if (opResult().value === false)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
            }
            return new lexer.Token(true, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
        }
        //all sel/const
        else if (left.type === lexer.TOKEN.TYPE.ALL) {
            for (var i = 0; i < left.value.length; i++) {
                var rightFunction = function () { return right; };
                var leftFunction = function () { return left.value[i]; };
                var opResult = arrayHelper(op, leftFunction, rightFunction);
                if (opResult().value === false)
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
            }
            return new lexer.Token(true, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
        }

        //any sel/const
        else if (left.type === lexer.TOKEN.TYPE.ANY) {
            for (var i = 0; i < left.value.length; i++) {
                var rightFunction = function () { return right; };
                var leftFunction = function () { return left.value[i]; };
                var opResult = arrayHelper(op, leftFunction, rightFunction);
                if (opResult().value)
                    return new lexer.Token(true, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
            }
            return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
        }
        //sel/const any
        else if (right.type === lexer.TOKEN.TYPE.ANY) {
            for (var i = 0; i < right.value.length; i++) {
                var leftFunction = function () { return left; };
                var rightFunction = function () { return right.value[i]; };
                var opResult = arrayHelper(op, leftFunction, rightFunction);
                if (opResult().value)
                    return new lexer.Token(true, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
            }
            return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
        }
    }
});