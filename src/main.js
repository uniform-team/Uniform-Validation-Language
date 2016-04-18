global.uniform = {
	validator: require("./validator.js"),
	evaluator: require("./evaluator.js"),
	parser: require("./parser.js"),
	options: require("./options.js"),
	lexer: require("./lexer.js"),
	scope: require("./scope.js"),
	listeners: require("./listeners.js")
};

module.exports = global.uniform;