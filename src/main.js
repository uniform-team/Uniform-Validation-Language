import Token from "./token.js";
import constants from "./constants.js";
import * as errors from "./errors.js";
import tokenizer from "./lexer.js";
import parser from "./parser.js";
import * as coerce from "./coerce.js";
import * as evaluator from "./evaluator.js";
import Scope from "./scope.js";
import { Variable, BlockVariable, ExpressionVariable } from "./variable.js";
import Tag from "./tag.js";
import { Identifier, BlockIdentifier, ExpressionIdentifier } from "./identifier.js";
import dependable from "./dependable.js";
import * as options from "./options.js";
import submit from "./submit.js";
import getRoot from "./root.js";

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
	Identifier,
	BlockIdentifier,
	ExpressionIdentifier,
	dependable,
	options,
    submit,
    get root() { return getRoot() }
};

submit.init();