import Token from "./token.js";
import constants from "./constants.js";
import * as errors from "./errors.js";
import tokenizer from "./lexer.js";
import parser from "./parser.js";
import * as coerce from "./coerce.js";
import * as evaluator from "./evaluator.js";
import Scope from "./scope.js";
import {Variable, BlockVariable, ExpressionVariable} from "./variable.js";
import Tag from "./tag.js";

// Create global Uniform object
window.uniform = {
	constants: constants,
	errors: errors,
	Token: Token,
	tokenizer: tokenizer,
	parser: parser,
	coerce: coerce,
	evaluator: evaluator,
	Scope: Scope,
	Variable: Variable,
	BlockVariable: BlockVariable,
	ExpressionVariable: ExpressionVariable,
	Tag: Tag
};