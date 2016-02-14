var scopes = [];

var KIND = {
    SELECTOR: "selector",
    VARIABLE: "variable",
    TAG: "tag"
};

function Scope(selector) {
    if (selector === undefined) throw new Error("Undefined SCOPE, missing selector");
    this.selector = selector;
    this.symbolTable = {};
    this.find = find;
}

//checks to see if name symbol exists in this scope and returns it, null if not found
function find(name) {
    var symbol = this.symbolTable[name];
    if (symbol !== undefined) {
        return symbol;
    }
    else return null;
}



module.exports = {

    KIND: KIND,

    thisScope: function () {
        return scopes[scopes.length-1];
    },

    openScope: function (newSelector) {
        console.log(" > Scope Open");
        if (scopes.length <= 0)
            scopes.push(new Scope(newSelector));
        else
            scopes.push(new Scope(scopes[scopes.length-1].selector+newSelector));
    },

    closeScope: function () {
        console.log(" < Scope Close");
        //delete tail scope
        scopes.pop();
    },
    appendToSymbol: function (name, string) {
        scopes[scopes.length - 1].symbols[name] += string;
    },
    insert: function (symbol) {
        //add symbol to tail scope
        scopes[scopes.length - 1].symbolTable[symbol.name] = symbol;
    },

    //checks to see if name symbol exists in any scope and returns it, null if not found
    lookup: function (name) {
        for (var i = scopes.length - 1; i >= 0; i--) {
            if (scopes[i].symbolTable[name] !== undefined)
                return scopes[i].symbolTable[name];
        }
        return null;
    },

    isDefined: function (name) {
        var symbol = this.lookup(name);
        if (symbol === null)
            return true;
        else
            false;
    },

    Symbol: function (name, expression, kind) {
        if (name === undefined) throw new Error("Undefined SYMBOL, missing name");
        if (expression === undefined) throw new Error("Undefined SYMBOL, missing expression");
        if (kind === undefined) throw new Error("Undefined SYMBOL, missing kind");
        this.name = name;
        this.expression = expression;
        this.kind = kind;
    }
};







