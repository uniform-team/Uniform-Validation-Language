var lexer = require("./lexer.js");

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
			|| this.optional !== other.optional;
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

        this.type = function () {
            var attribute = self.attr("type");
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