import constants from "./constants.js";
import tokenizer from "./lexer.js";

export default {
	parse: function (input) {
		// Stack for holding tokens retrieved via lookahead()
		var tokenStack = [];
		
		// Wrapper for the tokenize function to allow lookaheads
		var tokenize = (function () {
			// Parse the input once
			var getToken = tokenizer(input);
			
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
			var nextToken = tokenize();
			tokenStack.push(nextToken);
			return nextToken;
		}
		
		var currentToken = tokenize();
		
		function ParsingError(msg) {
			this.message = "Parsing Error (line: " + currentToken.line + ", col: " + currentToken.col + "): " + msg;
			this.lineNumber = currentToken.line;
			this.colNumber = currentToken.col;
		}
		ParsingError.prototype = Error.prototype;
		
		// Checks the expected type against the currentToken type
		// If they match, the next token is loaded into the currentToken and the matched token is returned
		// If they do not match, a ParsingError is thrown
		function matchType(expectedType) {
			if (expectedType === currentToken.type) {
				var tempCurrentToken = currentToken;
				currentToken = tokenize();
				return tempCurrentToken;
			} else {
				throw new ParsingError("Expected token of type " + expectedType + ", but got " + currentToken.type);
			}
		}
		
		// Checks the expected value against the currentToken value
		// If they match, the next token is loaded into the currentToken and the matched token is returned
		// If they do not match, a ParsingError is thrown
		function matchValue(expectedValue) {
			if (expectedValue === currentToken.value) {
				var tempCurrentToken = currentToken;
				currentToken = tokenize();
				return tempCurrentToken;
			} else {
				throw new ParsingError("Expected token of value " + expectedValue + ", but got " + currentToken.value);
			}
		}
		
		// Match the currentToken unconditionally and return the matched token
		function match() {
			var tempCurrentToken = currentToken;
			currentToken = tokenize();
			return tempCurrentToken;
		}
		
		// <file> -> <blockOrStatements>
		function file() {
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
				var nextToken = lookahead();
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
			blockOrStatements();
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
			expressionAndOr();
		}
		
		// <andOr> -> <not> <andOr_>
		// <andOr_> -> and | or <not> <andOr_>
		function expressionAndOr() {
			expressionNot();
			while (currentToken.value === constants.OPERATOR.AND
					|| currentToken.value === constants.OPERATOR.OR) {
				match();
				expressionNot();
			}
		}
		
		// <not> -> not <not> | <comparator>
		function expressionNot() {
			while (currentToken.value === constants.OPERATOR.NOT) {
				match();
			}
			
			expressionComparator();
		}
		
		// <comparator> -> <addSub> <comparator_>
		// <comparator_> -> equals | matches | is | < | > | <= | >= <addSub> <comparator_>
		function expressionComparator() {
			expressionAddSub();
			while (currentToken.isComparator()) {
				match();
				expressionAddSub();
			}
		}
		
		// <addSub> -> <mulDivMod> <addSub_>
		// <addSub_> -> + | - <mulDivMod> <addSub_>
		function expressionAddSub() {
			expressionMulDivMod();
			while (currentToken.value === constants.OPERATOR.ADD
					|| currentToken.value === constants.OPERATOR.SUB) {
				match();
				expressionMulDivMod();
			}
		}
		
		// <mulDivMod> -> <neg> <mulDivMod_>
		// <mulDivMod_> -> * | / | % <neg> <mulDivMod_>
		function expressionMulDivMod() {
			expressionNeg();
			while (currentToken.value === constants.OPERATOR.MUL
					|| currentToken.value === constants.OPERATOR.DIV
					|| currentToken.value === constants.OPERATOR.MOD) {
				match();
				expressionNeg()
			}
		}
		
		// <neg> -> - <neg> | <anyAll>
		function expressionNeg() {
			while (currentToken.value === constants.OPERATOR.SUB) {
				match();
			}
			
			expressionAnyAll();
		}
		
		// <anyAll> -> any | all | ø <dot>
		function expressionAnyAll() {
			if (currentToken.value === constants.OPERATOR.ANY
					|| currentToken.value === constants.OPERATOR.ALL) {
				match();
			}
			
			expressionDot();
		}
		
		// <dot> -> <paren> <dot_>
		// <dot_> -> . <identifier> <dot_>
		function expressionDot() {
			paren();
			while (currentToken.value === constants.OPERATOR.DOT) {
				match();
				matchType(constants.TYPE.IDENTIFIER);
			}
		}
		
		// <paren> -> ( <expression> ) | <operand>
		function paren() {
			if (currentToken.value === constants.OPERATOR.LPAREN) {
				match();
				expression();
				matchValue(constants.OPERATOR.RPAREN);
			} else {
				operand();
			}
		}
		
		// <operand> -> <number> | <string> | <variable> | <selector> | <state> | true | false | this | <object>
		function operand() {
			if (currentToken.isOperand()) { // Check for single-token operands
				match()
			} else if (currentToken.value === constants.OPERATOR.LBRACE) { // Check for object operand
				object();
			} else {
				throw new ParsingError("Expected an operand, got " + currentToken.value);
			}
		}
		
		// <object> -> { <keyValuePairs> }
		function object() {
			matchValue(constants.OPERATOR.LBRACE);
			keyValuePairs();
			matchValue(constants.OPERATOR.RBRACE);
		}
		
		// <keyValuePairs> -> <identifier> : <expression> ; <keyValuePairs> | ø
		function keyValuePairs() {
			while (currentToken.type === constants.TYPE.IDENTIFIER) {
				match();
				matchValue(constants.OPERATOR.COLON);
				expression();
				matchValue(constants.OPERATOR.SEMICOLON);
			}
		}
		
		// Loaded all functions into the closure, parse the given input as a file
		file();
	}
};