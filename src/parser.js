import constants from "./constants.js";
import { ParsingError as ParsingErrorClass, AssertionError as AssertionErrorClass, UndeclaredError as UndeclaredErrorClass,
    TypeError as TypeErrorClass, NotImplementedError } from "./errors.js";
import tokenizer from "./lexer.js";
import Identifier from "./identifier.js";
import { BlockVariable, ExpressionVariable } from "./variable.js";
import Tag from "./tag.js";
import * as evaluator from "./evaluator.js";
import Scope from "./scope.js";

export default {
    _testExpr: false,
    
    parse: function (input, spy) {
        let self = this;
        
        // Stack for holding tokens retrieved via lookahead()
        let tokenStack = [];
        
        // Load the input and generate a tokenizer
        let getToken = tokenizer(input);
        
        // Wrapper for the tokenize function to allow lookaheads
        let tokenize = function () {
            // Check if a token was looked ahead previous and use it
            if (tokenStack.length > 0) return tokenStack.shift();
            
            // No token from previous lookahead, invoke lexer
            return getToken();
        };
        tokenize.hadNewlineBeforeLastToken = getToken.hadNewlineBeforeLastToken;
        tokenize._setExpectRegex = getToken._setExpectRegex;
        
        // Return the next token without altering the currentToken
        function lookahead() {
            let nextToken = tokenize();
            tokenStack.push(nextToken);
            return nextToken;
        }
        
        if (this._testExpr) tokenize._setExpectRegex(true); // If testing an expression, assume regex for first token
        let currentToken = tokenize();
        
        // Wrap the error classes to automatically insert the current line number and column
        class ParsingError extends ParsingErrorClass {
            constructor(msgOrError) {
                super(msgOrError, currentToken.line, currentToken.col);
            }
        }
        class AssertionError extends AssertionErrorClass {
            constructor(msgOrError) {
                super(msgOrError, currentToken.line, currentToken.col);
            }
        }
        class UndeclaredError extends UndeclaredErrorClass {
            constructor(msgOrError) {
                super(msgOrError, currentToken.line, currentToken.col);
            }
        }
        class TypeError extends TypeErrorClass {
            constructor(msgOrError) {
                super(msgOrError, currentToken.line, currentToken.col);
            }
        }
        
        // Warn the developer of a possible issue they should be aware of
        function warn(msg) {
            console.warn("Warning (line %s, col %s): %s", currentToken.line, currentToken.col, msg);
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
        function match(unused) {
            // Easy mistake to accidentally use match() instead of matchValue() or matchType()
            // Check for this case and throw an error
            if (unused) throw new AssertionError("Passed unused argument to match(), "
                    + "did you mean to use matchValue() or matchType()?");
            
            let tempCurrentToken = currentToken;
            currentToken = tokenize();
            return tempCurrentToken;
        }
        
        // Defer the given function to be invoked after the entire file is parsed
        let deferred = [];
        function defer(cb) {
            deferred.push(cb);
        }
        
        // <file> -> <blockOrStatementOrDecls>
        function file(spy) {
            let result;
            
            // If testing expressions, declare variables then directly invoke and return expression()
            if (self._testExpr) {
                while (currentToken.isUfmType()) decl();
                result = expression(spy);
            }
            
            // Parse all blocks, statements, and declarations
            // Declarations are only allowed at the root scope
            blockOrStatementOrDecls();
            
            if (currentToken.type !== constants.ENDOFFILE) {
                throw new ParsingError("Expected an identifier or variable, got " + currentToken.value);
            }
            
            // File has been parsed, executed deferred actions
            for (let cb of deferred) cb();
            
            return result;
        }
        
        // <blockOrStatementOrDecls> -> ( <decl> | <blockOrStatement> ) <blockOrStatementOrDecls> | ø
        function blockOrStatementOrDecls() {
            while (currentToken.isUfmType() || currentToken.type === constants.TYPE.IDENTIFIER
                    || currentToken.type === constants.TYPE.VARIABLE || currentToken.isTag()) {
                if (currentToken.isUfmType()) {
                    decl();
                } else {
                    blockOrStatement();
                }
            }
        }
        
        // <decl> -> <type> : <identifier> ;
        function decl() {
            if (!currentToken.isUfmType()) throw new AssertionError("Expected a UFM Type token.");
            
            // Parse declaration
            let ufmType = match(); // <type>
            matchValue(constants.OPERATOR.COLON);
            let identifierToken = matchType(constants.TYPE.IDENTIFIER);
            matchValue(constants.OPERATOR.SEMICOLON);
            
            // Declare identifier
            Identifier.declare(new Identifier(identifierToken, ufmType.value));
        }
        
        // <blockOrStatements> -> <blockOrStatement> <blockOrStatements> | ø
        function blockOrStatements() {
            while (currentToken.type === constants.TYPE.IDENTIFIER || currentToken.type === constants.TYPE.VARIABLE
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
            let token = match();
            matchValue(constants.OPERATOR.LBRACE);
            
            if (token.type === constants.TYPE.IDENTIFIER) {
                let identifier = Identifier.find(token.value);
                if (!identifier) throw new UndeclaredError("Identifier " + token.value + " was not declared");
                
                identifier.scope.push(function () {
                    blockOrStatements();
                });
            } else if (token.type === constants.TYPE.VARIABLE) {
                let variable = new BlockVariable(token);
                
                Scope.thisScope.insert(variable);
                variable.scope.push(function () {
                    blockOrStatements();
                });
            } else {
                throw new AssertionError("Expected token identifier or variable, but got " + token.value);
            }
            
            matchValue(constants.OPERATOR.RBRACE);
        }
        
        // <statement> -> <variable> | <tag> : <expression> ;
        function statement() {
            let token = match(); // <variable> | <tag>
            matchValue(constants.OPERATOR.COLON);
            
            if (token.type === constants.TYPE.VARIABLE) {
                let variable = new ExpressionVariable(token);
                
                Scope.thisScope.insert(variable);
                variable.initDependable(expression(variable));
                defer(() => variable.update()); // Don't update until file is parsed and everything is declared
            } else if (token.isTag()) {
                let tag = new Tag(token, Scope.thisScope);
                
                Scope.thisScope.insert(tag);
                tag.initDependable(expression(tag));
                defer(() => tag.update()); // Don't update until file is parsed and everything is declared
            } else {
                throw new AssertionError("Expected ExpressionVariable or Tag, got " + token.value);
            }
            
            matchValue(constants.OPERATOR.SEMICOLON);
        }
        
        // <expression> -> <andOr>
        // Owner is the Tag or ExpressionVariable which owns the expression being parsed.
        // valid: <expression> ; // valid tag owns the expression
        // @test: <expression> ; // @test var owns the expression
        function expression(owner) {
            return expressionAndOr(owner);
        }
        
        // <andOr> -> <not> <andOr_>
        // <andOr_> -> and | or <not> <andOr_>
        function expressionAndOr(owner) {
            let leftExpr = expressionNot(owner);
            
            while (currentToken.value === constants.OPERATOR.AND
                    || currentToken.value === constants.OPERATOR.OR) {
                let operator = match();
                let rightExpr = expressionNot(owner);
                
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
        function expressionNot(owner) {
            let negations = 0;
            
            // Count chained not tokens
            while (currentToken.value === constants.OPERATOR.NOT) {
                match(); // -
                ++negations;
            }
            
            let expr = expressionComparator(owner);
            
            // Not the expression if there was an odd number of negations
            if (negations % 2 === 1) return evaluator.not(expr);
            else return expr;
        }
        
        // <comparator> -> <addSub> <comparator_>
        // <comparator_> -> equals | matches | < | > | <= | >= <addSub> <comparator_>
        function expressionComparator(owner) {
            let leftExpr = expressionAddSub(owner);
            
            while (currentToken.isComparator()) {
                let operator = match();
                let rightExpr = expressionAddSub(owner);
                
                switch (operator.value) {
                    case constants.OPERATOR.EQUALS:
                        leftExpr = evaluator.equals(leftExpr, rightExpr);
                        break;
                    case constants.OPERATOR.MATCHES:
                        leftExpr = evaluator.matches(leftExpr, rightExpr);
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
        function expressionAddSub(owner) {
            let leftExpr = expressionMulDivMod(owner);
            
            while (currentToken.value === constants.OPERATOR.ADD
                    || currentToken.value === constants.OPERATOR.SUB) {
                let operator = match();
                let rightExpr = expressionMulDivMod(owner);
                
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
        function expressionMulDivMod(owner) {
            let leftExpr = expressionNeg(owner);
            
            while (currentToken.value === constants.OPERATOR.MUL
                    || currentToken.value === constants.OPERATOR.DIV
                    || currentToken.value === constants.OPERATOR.MOD) {
                let operator = match();
                let rightExpr = expressionNeg(owner);
                
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
        function expressionNeg(owner) {
            let negations = 0;
            
            // Count chained negations
            while (currentToken.value === constants.OPERATOR.SUB) {
                match(); // -
                ++negations;
            }
            
            let expr = expressionAnyAll(owner);
            
            // Negate the expression if there was an odd number of negations
            if (negations % 2 === 1) return evaluator.neg(expr);
            else return expr;
        }
        
        // <anyAll> -> any | all | ø <ifBlock>
        function expressionAnyAll(owner) {
            if (currentToken.value === constants.OPERATOR.ANY
                    || currentToken.value === constants.OPERATOR.ALL) {
                match(); // any | all
            }
            
            return expressionIfBlock(owner);
        }

        // <ifBlock> -> if <expr> then <expr> <elseIf> else <expr> end | <dot>
        // <elseIf> -> elif <expr> then <expr> <elseIf> | ø
        function expressionIfBlock(owner) {
            if (currentToken.value === constants.OPERATOR.IF) {
                let conditionExprs = [ ];
                let resultExprs = [ ];

                // Parse if expression
                match(); // if
                conditionExprs.push(expression(owner));
                matchValue(constants.OPERATOR.THEN);
                resultExprs.push(expression(owner));

                // Parse all elif expressions
                while (currentToken.value === constants.OPERATOR.ELIF) {
                    match(); // elif
                    conditionExprs.push(expression(owner));
                    matchValue(constants.OPERATOR.THEN);
                    resultExprs.push(expression(owner));
                }

                // Parse else expression
                matchValue(constants.OPERATOR.ELSE);
                if (currentToken.value === constants.OPERATOR.IF && !tokenize.hadNewlineBeforeLastToken()) {
                    // Warn developer that they tried to do "else if" rather than "elif"
                    warn("Used \"else\" and \"if\" on the same line. Did you mean to use \"elif\"?"
                            + " If not, consider putting the \"if\" on a new line with an indent for clarity.");
                }
                let elseResultExpr = expression(owner);
                matchValue(constants.OPERATOR.END);

                return evaluator.ifStmt(conditionExprs, resultExprs, elseResultExpr);
            } else {
                return expressionDot(owner);
            }
        }
        
        // <dot> -> <paren> <dot_>
        // <dot_> -> . <identifier> <dot_>
        function expressionDot(owner) {
            let leftExpr = expressionParen(owner);
            while (currentToken.value === constants.OPERATOR.DOT) {
                match(); // .
                let right = matchType(constants.TYPE.IDENTIFIER);
                
                leftExpr = evaluator.dotObject(leftExpr, right);
            }
            
            return leftExpr;
        }
        
        // <paren> -> ( <expression> ) | <operand>
        function expressionParen(owner) {
            let result;
            
            if (currentToken.value === constants.OPERATOR.LPAREN) {
                match(); // (
                result = expression(owner);
                matchValue(constants.OPERATOR.RPAREN);
            } else {
                result = operand(owner);
            }
            
            return result;
        }
        
        // <operand> -> <identifier> | <number> | <string> | <variable> | <selector> | <state> | true | false | this | <object>
        function operand(owner) {
            if (currentToken.type === constants.TYPE.IDENTIFIER) { // Check for identifier usage
                return identifier(owner);
            } else if (currentToken.type === constants.TYPE.VARIABLE) { // Check for variable usage
                return variable(owner);
            } else if (currentToken.isOperand()) { // Check for single-token operands
                let operand = match();
                
                return () => operand;
            } else if (currentToken.value === constants.OPERATOR.LBRACE) { // Check for object operand
                return object(owner);
            } else {
                throw new ParsingError("Expected an operand, got " + currentToken.value);
            }
        }
        
        // <identifier>
        function identifier(owner) {
            let identifierToken = match();
            
            if (currentToken.value !== constants.OPERATOR.DOT) {
                // Usage of just the identifier, meaning the owner is dependent on it directly
                // ex. valid: make;
                
                // Create an ExpressionIdentifier object from the token
                let identifierObj = Identifier.find(identifierToken.value);
                if (!identifierObj) throw new UndeclaredError("Identifier " + identifierToken.value + " was not declared");
                
                // Set the owner as dependent on the identifier
                identifierObj.addDependent(owner);
                owner.addDependee(identifierObj);
                
                // Return the value of the identifier as the result
                return () => identifierObj.value;
            }
            
            // Dependent on a tag from an identifier
            // ex. valid: make.enabled;
            match(); // .
            if (!currentToken.isTag()) {
                throw new ParsingError("Expected identifier.tag, but got " + identifierToken.value + "." + currentToken.value);
            }
            let tag = match(); // <tag>
            
            // Defer adding the dependency until AFTER the entire file is parsed
            // In case the identifier / tag have not been parsed yet
            defer(function () {
                // Get the identifier referenced
                let identifierObj = Identifier.find(identifierToken.value);
                if (!identifierObj) throw new NotImplementedError();
                
                // Get the tag from the identifier
                let tagObj = identifierObj.getTag(tag.value);
                if (!tagObj) throw new NotImplementedError();
                
                // Set the owner as dependent on the found tag
                tagObj.addDependent(owner);
                owner.addDependee(tagObj);
            });
            
            return evaluator.dotTag(identifierToken, tag);
        }
        
        // <variable>
        function variable(owner) {
            let varToken = match();
            let scope = Scope.thisScope;
            let varObj;
            
            if (currentToken.value !== constants.OPERATOR.DOT) {
                // Usage of an expression variable, meaning the owner is dependent on it directly
                // ex. valid: @make;
    
                // Defer adding the dependency until AFTER the entire file is parsed
                // as expression variables are not inserted into the scope until after their expressions are parsed
                defer(function () {
                    varObj = scope.lookupVar(varToken.value);
                    if (!varObj) throw new UndeclaredError("Variable @" + varToken.value + " was not declared");
                    if (!(varObj instanceof ExpressionVariable)) throw new TypeError("Variable @" + varToken.value + " is a block, not an expression.");
        
                    // Set the owner as dependent on the variable
                    varObj.addDependent(owner);
                    owner.addDependee(varObj);
                });
    
                // Return the value of the variable as the result
                return () => varObj.value;
            }
            
            // Usage of a block variable, meaning the owner is dependent on a child tag
            // ex. valid: @make.valid;
            match(); // .
            if (!currentToken.isTag()) {
                throw new ParsingError("Expected variable.tag, but got @" + varToken.value + "." + currentToken.value);
            }
            let tag = match(); // <tag>
            
            // Defer adding the dependency until AFTER the entire file is parsed
            // In case the variable / tag have not been parsed yet
            defer(function () {
                // Get the variable referenced
                let varObj = Scope.thisScope.lookupVar(varToken.value);
                if (!varObj) throw new UndeclaredError("Variable @" + varToken.value + " was not declared");
                if (!(varObj instanceof BlockVariable)) throw new TypeError("Variable @" + varToken.value + " is an expression, not a block");
                
                // Get the tag from the variable
                let tagObj = varObj.getTag(tag.value);
                if (!tagObj) throw new UndeclaredError("Tag @" + varToken.value + "." + tag.value + " was not declared");
                
                // Set the owner as dependent on the found tag
                tagObj.addDependent(owner);
                owner.addDependee(tagObj);
            });
            
            return evaluator.dotTag(varToken, tag);
        }
        
        // <object> -> { <keyValuePairs> }
        function object(owner) {
            let startToken = matchValue(constants.OPERATOR.LBRACE);
            let expr = keyValuePairs(owner, startToken);
            matchValue(constants.OPERATOR.RBRACE);
            
            return expr;
        }
        
        // <keyValuePairs> -> <keyValuePair> <keyValuePairs> | ø
        function keyValuePairs(owner, startToken) {
            let pairs = [];
            
            // Parse all key-value expressions
            while (currentToken.type === constants.TYPE.IDENTIFIER) {
                pairs.push(keyValuePair(owner));
            }
            
            // Create a new object after evaluating each pair
            return function () {
                let obj = {};
                
                for (let pair of pairs) {
                    obj[pair.key] = pair.expr();
                }
                
                return startToken.clone({ value: obj, type: constants.TYPE.OBJECT });
            };
        }
        
        // <identifier> : <expression> ;
        function keyValuePair(owner) {
            let key = matchType(constants.TYPE.IDENTIFIER);
            matchValue(constants.OPERATOR.COLON);
            let expr = expression(owner);
            matchValue(constants.OPERATOR.SEMICOLON);
            
            return { key: key.value, expr: expr };
        }
        
        // Loaded all functions into the closure, parse the given input as a file
        return file(spy); // Return for _testExpr === true case used in testing
    }
};