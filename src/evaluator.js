var lexer = require("./lexer.js");


module.exports = {

    //Helper Functions
    isState: function (token) {
    return token.value === lexer.TOKEN.STATE.VALID ||
        token.value === lexer.TOKEN.STATE.ENABLED ||
        token.value === lexer.TOKEN.STATE.VISIBLE ||
        token.value === lexer.TOKEN.STATE.OPTIONAL ||
        token.value === lexer.TOKEN.STATE.STRING ||
        token.value === lexer.TOKEN.STATE.NUMBER;
    },
    isTag: function (token) {
        return (token.value === lexer.TOKEN.TAG.VALID ||
        token.value === lexer.TOKEN.TAG.OPTIONAL ||
        token.value === lexer.TOKEN.TAG.ENABLED ||
        token.value === lexer.TOKEN.TAG.VISIBLE);
    },
    isValidStatement: function (token) {
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
        token.value === lexer.TOKEN.OPERATOR.GTE);
    },

    derefUfm: function (token) {
        if (token.type === lexer.TOKEN.TYPE.UFM) {
            if (token.value.type() === lexer.TOKEN.TYPE.BOOL)//its a checkbox
                return new lexer.Token(token.value.is(':checked'), token.value.type(), token.line, token.col);
            else if (token.value.type() === lexer.TOKEN.TYPE.NUMBER)
                return new lexer.Token(parseInt(token.value.val()), token.value.type(), token.line, token.col);
            return new lexer.Token(token.value.val(), token.value.type(), token.line, token.col);
        }
        else return token;
    },

    //coerce functions will convert the ufm object to the appropriate type and throw an error otherwise
    coerceToNumber: function(token) {
        token = this.derefUfm(token);
        if (token.type === lexer.TOKEN.TYPE.NUMBER)
            return token;
        if (token.type === lexer.TOKEN.TYPE.STRING) {
            return new lexer.Token(parseInt(token.value), lexer.TOKEN.TYPE.NUMBER, token.line, token.col);
        }
        throw new Error("Line " + token.line + ": cannot coerce " + token.type + " to number");
    },

    coerceToString: function (token) {
        token = this.derefUfm(token);
        if (token.type === lexer.TOKEN.TYPE.STRING)
            return token;
        if (token.type === lexer.TOKEN.TYPE.NUMBER) {
            return new lexer.Token(token.value + "", lexer.TOKEN.TYPE.STRING, token.line, token.col);
        }
        throw new Error("Line " + token.line + ": cannot coerce " + token.type + " to string");
    },

    coerceToBool: function (token) {
        token = this.derefUfm(token);
        if (token.type === lexer.TOKEN.TYPE.BOOL)
            return token;
        else
            throw new Error("Line " + token.line + ": cannot coerce " + token.type + " to bool");
    },

    //Evaluation Functions
    and: function (leftExpr, rightExpr) { // Implicitly creates the closure we needed the self-executing function for
        return function () {
            var left = this.coerceToBool(leftExpr());
            var right = this.coerceToBool(rightExpr());
            return new lexer.Token(left.value && right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
        };
    },
    or: function (leftExpr, rightExpr) {
        return function () {
            var left = this.coerceToBool(leftExpr());
            var right = this.coerceToBool(rightExpr());
            return new lexer.Token(left.value || right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
        };
    },
    not: function (inExpr) {
        return function () {
            var expr = this.coerceToBool(inExpr());
            return new lexer.Token(!expr.value, lexer.TOKEN.TYPE.BOOL, expr.line, expr.col);
        };
    },

    lt: function (leftExpr, rightExpr) {
        return function () {
            var left = this.coerceToNumber(leftExpr());
            var right = this.coerceToNumber(rightExpr());
            return new lexer.Token(left.value < right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
        };
    },
    gt: function (leftExpr, rightExpr) {
        return function () {
            var left = this.coerceToNumber(leftExpr());
            var right = this.coerceToNumber(rightExpr());
            return new lexer.Token(left.value > right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
        };
    },
    gte: function (leftExpr, rightExpr) {
        return function () {
            var left = this.coerceToNumber(leftExpr());
            var right = this.coerceToNumber(rightExpr());
            return new lexer.Token(left.value >= right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
        };
    },
    lte: function (leftExpr, rightExpr) {
        return function () {
            var left = this.coerceToNumber(leftExpr());
            var right = this.coerceToNumber(rightExpr());
            return new lexer.Token(left.value <= right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
        };
    },
    equals: function (leftExpr, rightExpr) {
        return function () {
            var left = this.derefUfm(leftExpr());
            var right = this.derefUfm(rightExpr());
            if (left.value === right.value)
                return new lexer.Token(left.value === right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
            else throw new Error("Line " + left.line + ": cannot perform equals operation, types of operands do not match");
        };
    },
    matches: function (leftExpr, rightExpr) {
        return function () {
            var left = this.coerceToString(leftExpr());
            var right = rightExpr();
            var tempRegex = new RegExp(right);
            if (right.type === lexer.TOKEN.TYPE.REGEX)
                return new lexer.Token(tempRegex.test(left.value), lexer.TOKEN.TYPE.BOOL, left.line, left.col);
            else throw new Error("Line " + left.line + ": cannot perform matches operation, right operand must be of type REGEX");
        };
    },
    is: function (leftExpr, rightExpr) {
        return function () {
            var left = leftExpr();
            var right = rightExpr();
            if (this.isState(right) && left.type === lexer.TOKEN.TYPE.UFM) {
                if (right.value === lexer.TOKEN.STATE.VALID)
                    return new lexer.Token($(left.value).ufm().valid(), lexer.TOKEN.TYPE.BOOL, left.line, left.col);
                else if (right.value === lexer.TOKEN.STATE.ENABLED)
                    return new lexer.Token($(left.value).ufm().enabled(), lexer.TOKEN.TYPE.BOOL, left.line, left.col);
                else if (right.value === lexer.TOKEN.STATE.VISIBLE)
                    return new lexer.Token($(left.value).ufm().visible(), lexer.TOKEN.TYPE.BOOL, left.line, left.col);
                else if (right.value === lexer.TOKEN.STATE.OPTIONAL)
                    return new lexer.Token($(left.value).ufm().optional(), lexer.TOKEN.TYPE.BOOL, left.line, left.col);
            }

            //I actually don't quite remember why we did this
            else if (right.value === lexer.TOKEN.STATE.STRING) {
                try {
                    this.coerceToString(left);
                }
                catch (ex) {
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
                }
                return new lexer.Token(true, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
            }
            else if (right.value === lexer.TOKEN.STATE.NUMBER) {
                try {
                    this.coerceToNumber(left);
                }
                catch (ex) {
                    return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
                }
                return new lexer.Token(true, lexer.TOKEN.TYPE.BOOL, left.line, left.col);
            }
            else throw new Error("Line " + left.line + ": cannot perform is operation, invalid operands");
        };
    },
    add: function (leftExpr, rightExpr) {
        return function () {
            var left = this.coerceToNumber(leftExpr());
            var right = this.coerceToNumber(rightExpr());
            return new lexer.Token(left.value + right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
        };
    },
    sub: function (leftExpr, rightExpr) {
        return function () {
            var left = this.coerceToNumber(leftExpr());
            var right = this.coerceToNumber(rightExpr());
            return new lexer.Token(left.value - right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
        };
    },
    mul: function (leftExpr, rightExpr) {
        return function () {
            var left = this.coerceToNumber(leftExpr());
            var right = this.coerceToNumber(rightExpr());
            return new lexer.Token(left.value * right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
        };
    },
    div: function (leftExpr, rightExpr) {
        return function () {
            var left = this.coerceToNumber(leftExpr());
            var right = this.coerceToNumber(rightExpr());
            return new lexer.Token(left.value / right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
        };
    },
    mod: function (leftExpr, rightExpr) {
        return function () {
            var left = this.coerceToNumber(leftExpr());
            var right = this.coerceToNumber(rightExpr());
            return new lexer.Token(left.value % right.value, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
        };
    },
    neg: function (inExpr) {
        return function () {
            var expr = this.coerceToNumber(inExpr());
            return new lexer.Token(-expr, lexer.TOKEN.TYPE.BOOL, right.line, right.col);
        };
    },









};
