export default {
	TYPE: {
		BOOL: "boolean",
		VARIABLE: "variable",
		NUMBER: "number",
		STRING: "string",
		IDENTIFIER: "identifier",
		KEYWORD: "keyword",
		REGEX: "regex",
		STATE: "state",
		UFM: "ufm",
		DATE: "date",
		ARRAY: "array",
		ANY: "any_array",
		ALL: "all_array",
		OBJECT: "object"
	},
	OPERATOR: {
		ADD: "+",
		SUB: "-",
		MUL: "*",
		DIV: "/",
		MOD: "%",
		AND: "and",
		OR: "or",
		NOT: "not",
		MATCHES: "matches",
		EQUALS: "equals",
		COLON: ":",
		LBRACE: "{",
		RBRACE: "}",
		LPAREN: "(",
		RPAREN: ")",
		SEMICOLON: ";",
		LT: "<",
		GT: ">",
		LTE: "<=",
		GTE: ">=",
		REGEX: "regex",
		DOT: ".",
		ALL: "all",
		ANY: "any",
		IF: "if",
		THEN: "then",
		ELIF: "elif",
		ELSE: "else",
		END: "end"
	},
	TAG: {
		VALID: "valid",
		ENABLED: "enabled",
		VISIBLE: "visible",
		RESULT: "result",
		SELECTOR: "selector"
	},
	VALUE: {
		TRUE: "true",
		FALSE: "false"
	},
    REGEX_FLAGS: {
        IGNORE_CASE: "i",
		MULTI_LINE: "m",
		MATCH_LINE: "x"
    },
	ENDOFFILE: "EOF"
};