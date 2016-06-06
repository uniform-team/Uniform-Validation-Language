var lexer = require("./lexer.js");
var scope = require("./scope.js");
var evaluator = require("./evaluator.js");
var listeners = require("./listeners.js");
var submit = require("./submit.js");

require("./env.js")(function (document, $) {
	var currentToken;

	//Grammar: <blocks> -> <block> <blocks> | ø
	function blocks() {
		while (currentToken.type === lexer.TOKEN.TYPE.SELECTOR || currentToken.type === lexer.TOKEN.TYPE.VARIABLE) {
			if (currentToken.type === lexer.TOKEN.TYPE.SELECTOR)
				block();
			else if (currentToken.type === lexer.TOKEN.TYPE.VARIABLE)
				variableDeclaration();
		}
		if (currentToken.value !== lexer.TOKEN.ENDOFFILE)
			throw new Error("Line " + currentToken.line + ": Invalid block");
	}

	//Grammar: <block> -> <selector> { <statements> } | <variableDeclaration>
	function block() {
		var selector = matchType(lexer.TOKEN.TYPE.SELECTOR);
		submit.mark(selector.value);

		if (scope.thisScope().find(selector) !== null)
			console.warn("Line " + currentToken.line + ": Redeclared selector in same scope " + selector +
				", previous definitions ignored");

		var symbol = new scope.Symbol(selector.value, null, scope.KIND.SELECTOR);
		scope.insert(symbol);
		matchValue(lexer.TOKEN.OPERATOR.LBRACE);

		//Open the scope and parse the statements
		scope.createScope(selector, function (thisScope) {
			//attach event listeners
			listeners.updateOnChange(thisScope);
			listeners.updateOnRefresh(thisScope);

			statements(symbol);
			matchValue(lexer.TOKEN.OPERATOR.RBRACE);
		});
	}

	//Grammar: <variableDeclaration> -> <variable> : <expression> ;
	function variableDeclaration() {
		var variable = matchType(lexer.TOKEN.TYPE.VARIABLE);
		matchValue(lexer.TOKEN.OPERATOR.COLON);
		var exprValue = expressionAndOr();

		if (scope.thisScope().find(variable) !== null)
			console.warn("Line " + currentToken.line + ": Redeclared variable in same scope " + variable);

		//insert variable into current scope
		scope.insert(new scope.Symbol(variable.value, exprValue, scope.KIND.VARIABLE));
		matchValue(lexer.TOKEN.OPERATOR.SEMICOLON);
	}

	//Grammar: <statements> -> <statement> <statements> | ø
	function statements(symbol) {
		if (evaluator.isStatement(currentToken))
			while (evaluator.isStatement(currentToken))
				statement(symbol);
		else throw new Error("Line " + currentToken.line + ": Invalid statement");
	}

	//Grammar: <statement> -> <block> | <variableDeclaration> | <tag> : <expression> ;
	function statement(symbol) {
		if (currentToken.type === lexer.TOKEN.TYPE.SELECTOR)
			block();
		else if (currentToken.type === lexer.TOKEN.TYPE.VARIABLE)
			variableDeclaration();
		else {
			var tagName = tag();
			matchValue(lexer.TOKEN.OPERATOR.COLON);
			var exprFunc = expressionAndOr();

			//checks to make sure that the expression evaluates to a boolean
			var checkedExprValue = function (self) {
				var exprValue = evaluator.derefUfm(exprFunc(self));
				if (exprValue.type === lexer.TOKEN.TYPE.BOOL)
					return exprValue;
				else throw new Error("Line " + currentToken.line + ": expected boolean result, " +
					"received result of type " + exprValue.type);
			};

			if (scope.thisScope().find(tagName) !== null)
				console.warn("Line " + currentToken.line + ": Redeclared tag in same scope " + tagName);
			if (tagName.value === lexer.TOKEN.TAG.VALID) {
				scope.insert(new scope.Symbol("valid", checkedExprValue, scope.KIND.TAG));
			}
			else if (tagName.value === lexer.TOKEN.TAG.ENABLED) {
				scope.insert(new scope.Symbol("enabled", checkedExprValue, scope.KIND.TAG));
			}
			else if (tagName.value === lexer.TOKEN.TAG.VISIBLE) {
				scope.insert(new scope.Symbol("visible", checkedExprValue, scope.KIND.TAG));
			}
			else if (tagName.value === lexer.TOKEN.TAG.OPTIONAL) {
				scope.insert(new scope.Symbol("optional", checkedExprValue, scope.KIND.TAG));
			}
			symbol.expression = checkedExprValue;
			matchValue(lexer.TOKEN.OPERATOR.SEMICOLON);
		}
	}

	//Grammar: <tag> -> valid | optional | visible | enabled
	function tag() {
		if (evaluator.isTag(currentToken)) {
			return matchType(lexer.TOKEN.TYPE.KEYWORD);
		}
		else {
			throw new Error("Line " + currentToken.line + ": Invalid statement, " +
				"expected tag recieved " + currentToken.value);
		}
	}

	//Grammar: <andOr> -> <not> <andOr_>
	//         <andOr_> -> and <not>> <andOr_> | or <not> <andOr_> | ø
	function expressionAndOr() {
		var LReturn = expressionNot();
		while (currentToken.value === lexer.TOKEN.OPERATOR.AND ||
		currentToken.value === lexer.TOKEN.OPERATOR.OR) {
			var op = matchType(lexer.TOKEN.TYPE.KEYWORD);
			var RReturn = expressionNot();
			if (op.value === lexer.TOKEN.OPERATOR.AND)
				LReturn = evaluator.and(LReturn, RReturn);
			else if (op.value === lexer.TOKEN.OPERATOR.OR)
				LReturn = evaluator.or(LReturn, RReturn);
			else throw new Error("Line " + currentToken.line + ": Invalid Operand");
		}
		return LReturn;
	}

	//Grammar: <not> -> not <not> | <op>
	function expressionNot() {
		if (currentToken.value === lexer.TOKEN.OPERATOR.NOT) {
			matchValue(lexer.TOKEN.OPERATOR.NOT);
			return evaluator.not(expressionNot());
		}
		else
			return expressionOp();
	}

	//Grammar: <op> -> <addSub> <op_>
	//         <op_> -> equals <addSub> <op_> | is <addSub> <op_> | < ... | > ... | <= ... | >= ... | ø
	function expressionOp() {
		var LReturn = expressionAddSub();
		while (evaluator.isExpressionOp(currentToken)) {
			var op = matchType(lexer.TOKEN.TYPE.KEYWORD);
			var RReturn = expressionAddSub();

			//<expr> < <expr>
			if (op.value === lexer.TOKEN.OPERATOR.LT)
				LReturn = evaluator.lt(LReturn, RReturn);

			//<expr> > <expr>
			else if (op.value === lexer.TOKEN.OPERATOR.GT)
				LReturn = evaluator.gt(LReturn, RReturn);

			//<expr> >= <expr>
			else if (op.value === lexer.TOKEN.OPERATOR.GTE)
				LReturn = evaluator.gte(LReturn, RReturn);

			//<expr> >= <expr>
			else if (op.value === lexer.TOKEN.OPERATOR.LTE)
				LReturn = evaluator.lte(LReturn, RReturn);

			//<expr> equals <expr>
			else if (op.value === lexer.TOKEN.OPERATOR.EQUALS)
				LReturn = evaluator.equals(LReturn, RReturn);

			//<expr> matches <expr>
			else if (op.value === lexer.TOKEN.OPERATOR.MATCHES)
				LReturn = evaluator.matches(LReturn, RReturn);

			//<expr> is <expr>
			else if (op.value === lexer.TOKEN.OPERATOR.IS)
				LReturn = evaluator.is(LReturn, RReturn);
			else throw new Error("Line " + op.line + ": Invalid expression operand " + op.value);
		}
		return LReturn;
	}

	//Grammar: <addSub> -> <mulDivMod> <addSub_>
	//         <addSub_> -> + <mulDivMod> <addSub_> | -... | ø
	function expressionAddSub() {
		var LReturn = expressionMulDivMod();
		while (currentToken.value === lexer.TOKEN.OPERATOR.ADD ||
		currentToken.value === lexer.TOKEN.OPERATOR.SUB) {
			var op = matchType(lexer.TOKEN.TYPE.KEYWORD);
			var RReturn = expressionMulDivMod();

			//<expr> + <expr>
			if (op.value === lexer.TOKEN.OPERATOR.ADD)
				LReturn = evaluator.add(LReturn, RReturn);

			//<expr> - <expr>
			else if (op.value === lexer.TOKEN.OPERATOR.SUB)
				LReturn = evaluator.sub(LReturn, RReturn);

			else throw new Error("Line " + op.line + ": Invalid expression operand " + op.value);
		}
		return LReturn;
	}

	//Grammar: <mulDivMod> -> <neg> <mulDivMod_>
	//         <mulDivMod_> -> * <neg> <mulDivMod_> | /... | %... | ø
	function expressionMulDivMod() {
		var LReturn = expressionNeg();
		while (currentToken.value === lexer.TOKEN.OPERATOR.MUL ||
		currentToken.value === lexer.TOKEN.OPERATOR.DIV ||
		currentToken.value === lexer.TOKEN.OPERATOR.MOD) {
			var op = matchType(lexer.TOKEN.TYPE.KEYWORD);
			var RReturn = expressionNeg();

			//<expr> * <expr>
			if (op.value === lexer.TOKEN.OPERATOR.MUL)
				LReturn = evaluator.mul(LReturn, RReturn);

			//<expr> / <expr>
			else if (op.value === lexer.TOKEN.OPERATOR.DIV)
				LReturn = evaluator.div(LReturn, RReturn);

			//<expr> % <expr>
			else if (op.value === lexer.TOKEN.OPERATOR.MOD)
				LReturn = evaluator.mod(LReturn, RReturn);

			else throw new Error("Line " + op.line + ": Invalid expression operand " + op.value);
		}
		return LReturn;
	}

	//Grammar: <neg> -> - <neg> | <anyAll>
	function expressionNeg() {
		var negCount = 0;
		while (currentToken.value === lexer.TOKEN.OPERATOR.SUB) {
			matchValue(lexer.TOKEN.OPERATOR.SUB);
			negCount++;
		}
		negCount %= 2;
		var anyAllReturn = expressionAnyAll();
		//negCount will be 0 if there is an even number of '-'
		if (negCount)
			return evaluator.neg(anyAllReturn);
		else
			return anyAllReturn;
	}

	//Grammar: <anyAll> -> any <dot> | all <dot> | <dot>
	function expressionAnyAll() {
		//any or all prefix of selector
		var dotReturn;

		if (currentToken.value === lexer.TOKEN.OPERATOR.ALL || currentToken.value === lexer.TOKEN.OPERATOR.ANY) {
			var op = matchType(lexer.TOKEN.TYPE.KEYWORD);
			dotReturn = expressionDot();

			if (op.value === lexer.TOKEN.OPERATOR.ALL) {
				dotReturn = evaluator.all(dotReturn);
			}
			else if (op.value === lexer.TOKEN.OPERATOR.ANY) {
				dotReturn = evaluator.any(dotReturn);
			}
		}
		else dotReturn = expressionDot();

		return dotReturn;
	}

	//Grammar: <dot> -> <paren> <dot_>
	//         <dot_> -> . <identifier> ( <args> ) <dot_> | ø
	function expressionDot() {
		var result = expressionParen();

		while (currentToken.value === lexer.TOKEN.OPERATOR.DOT) {
			// Parse function to execute
			matchValue(lexer.TOKEN.OPERATOR.DOT);
			var id = currentToken.value;
			matchType(lexer.TOKEN.TYPE.IDENTIFIER);

			// Parse parenthesized argument list
			matchValue(lexer.TOKEN.OPERATOR.LPAREN);
			var args = expressionArgs();
			matchValue(lexer.TOKEN.OPERATOR.RPAREN);

			// Chain evaluation onto result
			result = evaluator.dot(result, id, args);

			// Dot operators hide dependency information, must update on ALL changes to DOM tree
			listeners.updateOnAllValidations(scope.thisScope());
		}

		return result;
	}

	//Grammar: <args> -> <expression> <args_> | ø
	//         <args_> -> , <expression> <args_>
	function expressionArgs() {
		var result = [];

		// Parse first argument if present
		if (currentToken.value !== lexer.TOKEN.OPERATOR.RPAREN) {
			result.push(expressionAndOr());
		}

		// Parse remaining arguments comma separated
		while (currentToken.value === lexer.TOKEN.OPERATOR.COMMA) {
			matchValue(lexer.TOKEN.OPERATOR.COMMA);
			result.push(expressionAndOr());
		}

		return result;
	}

	//Grammar: <paren> -> ( <andOr> ) | <operand>
	function expressionParen() {
		if (currentToken.value === lexer.TOKEN.OPERATOR.LPAREN) {
			matchValue(lexer.TOKEN.OPERATOR.LPAREN);
			var exprReturn = expressionAndOr();
			matchValue(lexer.TOKEN.OPERATOR.RPAREN);
			return exprReturn;
		}
		else
			return operand();
	}

	//Grammar: <operand> -> <number> | <string> | <variable> | <selector> | <state> | true | false
	function operand() {
		var returnToken;

		//<number>
		if (currentToken.type === lexer.TOKEN.TYPE.NUMBER) {
			returnToken = matchType(lexer.TOKEN.TYPE.NUMBER);
			returnToken.value = parseInt(returnToken.value);
		}

		//<string>
		else if (currentToken.type === lexer.TOKEN.TYPE.STRING)
			returnToken = matchType(lexer.TOKEN.TYPE.STRING);

		//<variable>
		else if (currentToken.type === lexer.TOKEN.TYPE.VARIABLE) {
			if (!scope.isDefined(currentToken.value))
				throw new Error("Line " + currentToken.line + ": undefined variable " + currentToken.value);
			returnToken = matchType(lexer.TOKEN.TYPE.VARIABLE);
			return scope.lookup(returnToken.value).expression;
		}

		//<selector>
		else if (currentToken.type === lexer.TOKEN.TYPE.SELECTOR) {
			returnToken = matchType(lexer.TOKEN.TYPE.SELECTOR);

			//this
			if (returnToken.value === lexer.TOKEN.THIS) {
				return function (self) {
					return new lexer.Token(self, lexer.TOKEN.TYPE.UFM, returnToken.line, returnToken.col);
				};
			}

			// Found a selector, set up a dependency between it and the current scope
			listeners.setDependency(returnToken.value, scope.thisScope());

			// Mark selector to be sent to server
			submit.mark(returnToken.value);

			// Return new selector
			return function () {
				var $sel = $(returnToken.value).ufm();
				return new lexer.Token($sel, lexer.TOKEN.TYPE.UFM, returnToken.line, returnToken.col);
			};
		}

		//<state>
		else if (currentToken.type === lexer.TOKEN.TYPE.KEYWORD)
			returnToken = state();

		//<regex>
		else if (currentToken.type === lexer.TOKEN.TYPE.REGEX)
			returnToken = matchType(lexer.TOKEN.TYPE.REGEX);

		//true | false
		else if (currentToken.type === lexer.TOKEN.TYPE.BOOL)
			returnToken = matchType(lexer.TOKEN.TYPE.BOOL);

		else {
			throw new Error("Line " + currentToken.line + ": invalid expression, " +
				"expected an operand, received " + currentToken.value + "\n");
		}
		return function () {
			return returnToken;
		};
	}

	//Grammar: <state> -> valid | string | number | enabled | visible | optional
	function state() {
		if (evaluator.isState(currentToken)) {
			var temp = matchType(lexer.TOKEN.TYPE.KEYWORD);
			temp.type = lexer.TOKEN.TYPE.STATE;
			return temp;
		}
		else {
			throw new Error("Line " + currentToken.line + ": Invalid statement, " +
				"expected a state, received " + currentToken.value + "\n");
		}
	}

	//Parameters: token object
	//checks the inputToken value against the currentToken type
	//if they match, the next token is loaded into the currentToken and the matched token is returned
	function matchType(inputToken) {
		if (inputToken === currentToken.type) {
			var tempCurrentToken = currentToken;
			currentToken = lexer.getNextToken();
			return tempCurrentToken;
		}
		else throw new Error("match type failed on line " + currentToken.line + ", could not find: " +
			currentToken.value + " " + currentToken.type);
	}

	//Parameters: token object
	//checks the inputToken value against the currentToken value
	//if they match, the next token is loaded into the currentToken and the matched token is returned
	function matchValue(inputToken) {
		if (inputToken === currentToken.value) {
			var tempCurrentToken = currentToken;
			currentToken = lexer.getNextToken();
			return tempCurrentToken;
		}
		else throw new Error("match value failed on line " + currentToken.line + ", could not find: " +
			currentToken.value + ", " + currentToken.type);
	}

	/*
	 Parse is the "main" function
	 it opens the global scope and calls lexer to get the next token into the currentToken
	 blocks() is the top-level layer in the grammar tree.
	 parse returns the root of the symbol tree.

	 */
	module.exports = {
		parse: function (inputString) {
			try {
				var rootScope;
				lexer.loadString(inputString);
				currentToken = lexer.getNextToken();

				//global scope
				rootScope = scope.createScope(null, function () {
					blocks();
				});

				// Initialize listeners
				listeners.init();

				console.log("Uniform Parse Success");
				return rootScope;
			} catch (ex) {
				console.error(ex);
				return null;
			}
		}
	};
});