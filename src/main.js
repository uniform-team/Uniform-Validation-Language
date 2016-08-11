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
import Identifier from "./identifier.js";

// Create global Uniform object
window.uniform = {
	constants,
	errors,
	Token,
	tokenizer,
	parser,
	coerce,
	evaluator,
	Scope,
	Variable,
	BlockVariable,
	ExpressionVariable,
	Tag,
	Identifier
};