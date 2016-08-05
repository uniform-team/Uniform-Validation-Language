import Token from "./token.js";
import constants from "./constants.js";
import tokenizer from "./lexer.js";
import parser from "./parser.js";

// Create global Uniform object
window.uniform = {
	constants: constants,
	Token: Token,
	tokenizer: tokenizer,
	parser: parser
};