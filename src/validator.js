var lexer = require("./lexer.js");

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
                return lexer.TOKEN.TYPE.NUMBER;
            else if (attribute === "number")
                return lexer.TOKEN.TYPE.NUMBER;
            else if (self.is("select"))
                return lexer.TOKEN.TYPE.STRING;
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
        return this;
    };
}
catch (ex) {
    console.log(ex);
}