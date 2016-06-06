var lexer = require("./lexer.js");

require("./env.js")(function (document, $) {
	var State = function ($sel) {
		this.valid = $sel.valid();
		this.enabled = $sel.enabled();
		this.visible = $sel.visible();
		this.optional = $sel.optional();
	};

	State.prototype = {
		different: function (other) {
			return this.valid !== other.valid
				|| this.enabled !== other.enabled
				|| this.visible !== other.visible
				|| this.optional !== other.optional
			;
		}
	};

	try {
		$.fn.ufm = function () {
			var self = this;

			function stateAttr(state, value) {
				if (value === undefined)
					return self.attr("ufm-" + state) === "true";
				else
					self.attr("ufm-" + state, value);
			}

			// Set value to read from DOM (if not overridden by server)
			this.value = this.value || function (token) {
				var line = token && token.line;
				var col = token && token.col;

				// Get value depending on the type
				var type = this.type();
				if (type === lexer.TOKEN.TYPE.BOOL)
					return new lexer.Token(this.is(":checked"), lexer.TOKEN.TYPE.BOOL, line, col);
				else if (type === lexer.TOKEN.TYPE.NUMBER)
					return new lexer.Token(parseInt(this.val()), lexer.TOKEN.TYPE.NUMBER, line, col);
				else if (type === lexer.TOKEN.TYPE.STRING)
					return new lexer.Token(this.val(), lexer.TOKEN.TYPE.STRING, line, col);
				else if (type === lexer.TOKEN.TYPE.STATE)
					return new lexer.Token(this.getState(), lexer.TOKEN.TYPE.STATE_OBJECT, line, col);
			};

			// Set type to determine type from DOM (if not overridden by server)
			this.type = this.type || function () {
				var attribute = this.attr("type");
				if (attribute === "checkbox")
					return lexer.TOKEN.TYPE.BOOL;
				else if (attribute === "text")
					return lexer.TOKEN.TYPE.STRING;
				else if (attribute === "radio")
					return lexer.TOKEN.TYPE.STRING;
				else if (attribute === "number")
					return lexer.TOKEN.TYPE.NUMBER;
				else if (self.is("select"))
					return lexer.TOKEN.TYPE.STRING;
				else if (attribute === "date")
					return lexer.TOKEN.TYPE.STRING; //will add additional support later
				else if (attribute === "email")
					return lexer.TOKEN.TYPE.STRING; //will add additional support later
				else
					return lexer.TOKEN.TYPE.STATE; //will add additional support later
			};

			this.valid = function (value) {
				return stateAttr("valid", value);
			};
			this.enabled = function (value) {
				return stateAttr("enabled", value);
			};
			this.visible = function (value) {
				return stateAttr("visible", value);
			};
			this.optional = function (value) {
				return stateAttr("optional", value);
			};

			this.getState = function () {
				return new State(this);
			};

			return this;
		};
	}
	catch (ex) {
		console.log(ex);
	}
});