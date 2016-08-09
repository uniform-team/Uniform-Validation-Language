import constants from "./constants.js";
import { ParsingError as ParsingErrorClass, AssertionError as AssertionErrorClass } from "./errors.js";
import tokenizer from "./lexer.js";
import Scope from "./scope.js";
import * as evaluator from "./evaluator.js";

export default {
	_testExpr: false,
	
	parse: function (input) {
		let self = this;
		
		// Stack for holding tokens retrieved via lookahead()
		let tokenStack = [];
		
		// Wrapper for the tokenize function to allow lookaheads
		let tokenize = (function () {
			// Load the input and generate a tokenizer
			let getToken = tokenizer(input);
			
			// Return actual tokenize function
			return function () {
				// Check if a token was looked ahead previous and use it
				if (tokenStack.length > 0) return tokenStack.shift();
				
				// No token from previous lookahead, invoke lexer
				return getToken();
			};
		}());
		
		// Return the next token without altering the currentToken
		function lookahead() {
			let nextToken = tokenize();
			tokenStack.push(nextToken);
			return nextToken;
		}
		
		let currentToken = tokenize();
		
		// Wrap the ParsingError class with one which automatically inserts the current line number and column
		class ParsingError extends ParsingErrorClass {
			constructor(msgOrError) {
				super(msgOrError, currentToken.lineNumber, currentToken.colNumber);
			}
		}
		
		// Wrap the AssertionErro class with one which automatically inserts the current line number and column
		class AssertionError extends AssertionErrorClass {
			constructor(msgOrError) {
				super(msgOrError, currentToken.lineNumber, currentToken.colNumber);
			}
		}
		
		// Checks the expected type against the currentToken type
		// If they match, the next token is loaded into the currentToken and the matched token is returned
		// If they do not match, a ParsingError is thrown
		function matchType(expectedType) {
			if (expectedType === currentToken.type) {
				return match();
			} else {
				throw new ParsingError("Expected token of type " + expectedType + ", but got " + currentToken.type);
			}
		}
		
		// Checks the expected value against the currentToken value
		// If they match, the next token is loaded into the currentToken and the matched token is returned
		// If they do not match, a ParsingError is thrown
		function matchValue(expectedValue) {
			if (expectedValue === currentToken.value) {
				return match();
			} else {
				throw new ParsingError("Expected token of value " + expectedValue + ", but got " + currentToken.value);
			}
		}
		
		// Match the currentToken unconditionally and return the matched token
		function match() {
			let tempCurrentToken = currentToken;
			currentToken = tokenize();
			return tempCurrentToken;
		}
		
		// <file> -> <blockOrStatements>
		function file() {
			// If testing expressions, then directly invoke and return expression()
			if (self._testExpr) return expression();
			
			blockOrStatements();
			
			if (currentToken.type !== constants.ENDOFFILE) {
				throw new ParsingError("Expected an identifier or variable, got " + currentToken.value);
			}
		}
		
		// <blockOrStatements> -> <blockOrStatement> <blockOrStatements> | ø
		function blockOrStatements() {
			while (currentToken.type === constants.TYPE.IDENTIFIER || currentToken.type == constants.TYPE.VARIABLE
					|| currentToken.isTag()) {
				blockOrStatement();
			}
		}
		
		// <blockOrStatement> -> <block> | <statement>
		function blockOrStatement() {
			if (currentToken.type === constants.TYPE.IDENTIFIER) {
				block();
			} else if (currentToken.type === constants.TYPE.VARIABLE) {
				let nextToken = lookahead();
				if (nextToken.value === constants.OPERATOR.LBRACE) {
					block();
				} else if (nextToken.value == constants.OPERATOR.COLON) {
					statement();
				} else {
					throw new ParsingError("Expected a left brace or colon after the variable " + currentToken.value + ", got " + nextToken.value);
				}
			} else if (currentToken.isTag()) {
				statement();
			} else {
				throw new ParsingError("Expected an identifier or a variable, got " + currentToken.value);
			}
		}
		
		// <block> -> <identifier> | <variable> { <blockOrStatements> }
		function block() {
			match();
			matchValue(constants.OPERATOR.LBRACE);
			new Scope(function () {
				blockOrStatements();
			});
			matchValue(constants.OPERATOR.RBRACE);
		}
		
		// <statement> -> <variable> | <tag> : <expression> ;
		function statement() {
			match();
			matchValue(constants.OPERATOR.COLON);
			expression();
			matchValue(constants.OPERATOR.SEMICOLON);
		}
		
		// <expression> -> <andOr>
		function expression() {
			return expressionAndOr();
		}
		
		// <andOr> -> <not> <andOr_>
		// <andOr_> -> and | or <not> <andOr_>
		function expressionAndOr() {
			let leftExpr = expressionNot();
			
			while (currentToken.value === constants.OPERATOR.AND
					|| currentToken.value === constants.OPERATOR.OR) {
				let operator = match();
				let rightExpr = expressionNot();
				
				switch (operator.value) {
					case constants.OPERATOR.AND:
						leftExpr = evaluator.and(leftExpr, rightExpr);
						break;
					case constants.OPERATOR.OR:
						leftExpr = evaluator.or(leftExpr, rightExpr);
						break;
					default:
						throw new AssertionError("Expected token " + constants.OPERATOR.AND + " or " + constants.OPERATOR.OR
							+ ", but got " + operator.value);
				}
			}
			
			return leftExpr;
		}
		
		// <not> -> not <not> | <comparator>
		function expressionNot() {
			let negations = 0;
			
			// Count chained not tokens
			while (currentToken.value === constants.OPERATOR.NOT) {
				match();
				++negations;
			}
			
			let expr = expressionComparator();
			
			// Not the expression if there was an odd number of negations
			if (negations % 2 === 1) return evaluator.not(expr);
			else return expr;
		}
		
		// <comparator> -> <addSub> <comparator_>
		// <comparator_> -> equals | matches | is | < | > | <= | >= <addSub> <comparator_>
		function expressionComparator() {
			let leftExpr = expressionAddSub();
			
			while (currentToken.isComparator()) {
				let operator = match();
				let rightExpr = expressionAddSub();
				
				switch (operator.value) {
					case constants.OPERATOR.EQUALS:
						leftExpr = evaluator.equals(leftExpr, rightExpr);
						break;
					case constants.OPERATOR.MATCHES:
						leftExpr = evaluator.matches(leftExpr, rightExpr);
						break;
					case constants.OPERATOR.IS:
						leftExpr = evaluator.is(leftExpr, rightExpr);
						break;
					case constants.OPERATOR.LT:
						leftExpr = evaluator.lt(leftExpr, rightExpr);
						break;
					case constants.OPERATOR.GT:
						leftExpr = evaluator.gt(leftExpr, rightExpr);
						break;
					case constants.OPERATOR.LTE:
						leftExpr = evaluator.lte(leftExpr, rightExpr);
						break;
					case constants.OPERATOR.GTE:
						leftExpr = evaluator.gte(leftExpr, rightExpr);
						break;
					default:
						throw new AssertionError("Expected comparator token, but got " + operator.value);
				}
			}
			
			return leftExpr;
		}
		
		// <addSub> -> <mulDivMod> <addSub_>
		// <addSub_> -> + | - <mulDivMod> <addSub_>
		function expressionAddSub() {
			let leftExpr = expressionMulDivMod();
			
			while (currentToken.value === constants.OPERATOR.ADD
					|| currentToken.value === constants.OPERATOR.SUB) {
				let operator = match();
				let rightExpr = expressionMulDivMod();
				
				switch (operator.value) {
					case constants.OPERATOR.ADD:
						leftExpr = evaluator.add(leftExpr, rightExpr);
						break;
					case constants.OPERATOR.SUB:
						leftExpr = evaluator.sub(leftExpr, rightExpr);
						break;
					default:
						throw new AssertionError("Expected token " + constants.OPERATOR.ADD + " or "
							+ constants.OPERATOR.SUB + ", but got " + operator.value);
				}
			}
			
			return leftExpr;
		}
		
		// <mulDivMod> -> <neg> <mulDivMod_>
		// <mulDivMod_> -> * | / | % <neg> <mulDivMod_>
		function expressionMulDivMod() {
			let leftExpr = expressionNeg();
			
			while (currentToken.value === constants.OPERATOR.MUL
					|| currentToken.value === constants.OPERATOR.DIV
					|| currentToken.value === constants.OPERATOR.MOD) {
				let operator = match();
				let rightExpr = expressionNeg();
				
				switch (operator.value) {
					case constants.OPERATOR.MUL:
						leftExpr = evaluator.mul(leftExpr, rightExpr);
						break;
					case constants.OPERATOR.DIV:
						leftExpr = evaluator.div(leftExpr, rightExpr);
						break;
					case constants.OPERATOR.MOD:
						leftExpr = evaluator.mod(leftExpr, rightExpr);
						break;
					default:
						throw new AssertionError("Expected token of type " + constants.OPERATOR.MUL + ", "
								+ constants.OPERATOR.DIV + ", or " + constants.OPERATOR.MOD + ", but got " + operator.value);
				}
			}
			
			return leftExpr;
		}
		
		// <neg> -> - <neg> | <anyAll>
		function expressionNeg() {
			let negations = 0;
			
			// Count chained negations
			while (currentToken.value === constants.OPERATOR.SUB) {
				match();
				++negations;
			}
			
			let expr = expressionAnyAll();
			
			// Negate the expression if there was an odd number of negations
			if (negations % 2 === 1) return evaluator.neg(expr);
			else return expr;
		}
		
		// <anyAll> -> any | all | ø <dot>
		function expressionAnyAll() {
			if (currentToken.value === constants.OPERATOR.ANY
					|| currentToken.value === constants.OPERATOR.ALL) {
				match();
			}
			
			return expressionDot();
		}
		
		// <dot> -> <paren> <dot_>
		// <dot_> -> . <identifier> <dot_>
		function expressionDot() {
			let leftExpr = paren();
			while (currentToken.value === constants.OPERATOR.DOT) {
				match();
				let right = matchType(constants.TYPE.IDENTIFIER);
				let rightExpr = () => right;
				
				leftExpr = evaluator.dot(leftExpr, rightExpr);
			}
			
			return leftExpr;
		}
		
		// <paren> -> ( <expression> ) | <operand>
		function paren() {
			let result;
			
			if (currentToken.value === constants.OPERATOR.LPAREN) {
				match();
				result = expression();
				matchValue(constants.OPERATOR.RPAREN);
			} else {
				result = operand();
			}
			
			return result;
		}
		
		// <operand> -> <number> | <string> | <variable> | <selector> | <state> | true | false | this | <object>
		function operand() {
			if (currentToken.isOperand()) { // Check for single-token operands
				let operand = match();
				return () => operand;
			} else if (currentToken.value === constants.OPERATOR.LBRACE) { // Check for object operand
				return object();
			} else {
				throw new ParsingError("Expected an operand, got " + currentToken.value);
			}
		}
		
		// <object> -> { <keyValuePairs> }
		function object() {
			let start = matchValue(constants.OPERATOR.LBRACE);
			let obj = keyValuePairs();
			matchValue(constants.OPERATOR.RBRACE);
			
			let token = start.clone({ value: obj, type: constants.TYPE.OBJECT });
			return () => token;
		}
		
		// <keyValuePairs> -> <keyValuePair> <keyValuePairs> | ø
		function keyValuePairs() {
			let obj = {};
			
			while (currentToken.type === constants.TYPE.IDENTIFIER) {
				let pair = keyValuePair();
				obj[pair.key] = pair.value;
			}
			
			return obj;
		}
		
		// <identifier> : <expression> ;
		function keyValuePair() {
			let key = match();
			matchValue(constants.OPERATOR.COLON);
			let expr = expression();
			matchValue(constants.OPERATOR.SEMICOLON);
			
			return { key: key.value, value: expr };
		}
		
		// Loaded all functions into the closure, parse the given input as a file
		return file(); // Return for _testExpr === true case used in testing
	}
};