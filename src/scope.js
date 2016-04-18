var lexer = require("./lexer.js");

//root node of tree
var root = null;
var currentScope = null;

var KIND = {
    SELECTOR: "selector",
    VARIABLE: "variable",
    TAG: "tag"
};

function Symbol(name, expression, kind) {
    if (name === undefined) throw new Error("Undefined SYMBOL, missing name");
    //if (expression === undefined) throw new Error("Undefined SYMBOL, missing expression");
    if (kind === undefined) throw new Error("Undefined SYMBOL, missing kind");
    this.name = name;
    this.expression = expression;
    this.kind = kind;
}

function Scope(selector, parentScope) {
    if (selector === undefined) throw new Error("Undefined SCOPE, missing selector");
    this.parentScope = parentScope;
    this.selector = selector;
    this.selectorTable = {};
    this.variableTable = {};
    this.tagTable = {
        valid: new Symbol("valid", function () {return new lexer.Token(true, lexer.TOKEN.TYPE.BOOL, -1, -1);}, KIND.TAG),
        enabled: new Symbol("enabled", function () {return new lexer.Token(true, lexer.TOKEN.TYPE.BOOL, -1, -1);}, KIND.TAG),
        visible: new Symbol("visible", function () {return new lexer.Token(true, lexer.TOKEN.TYPE.BOOL, -1, -1);}, KIND.TAG),
        optional: new Symbol("optional", function () {return new lexer.Token(false, lexer.TOKEN.TYPE.BOOL, -1, -1);}, KIND.TAG),
    };
    this.find = find;
}

function find(name) {
    if (this.selectorTable[name] !== undefined)
        return this.selectorTable[name];
    else if (this.variableTable[name] !== undefined)
        return this.variableTable[name];
    else if (this.tagTable[name] !== undefined)
        return this.tagTable[name];
    else return null;
}

//newSelector should be "" if global scope
function openScope(newSelector) {
    if (root === null) {
        root = new Scope(new lexer.Token("", lexer.TOKEN.TYPE.SELECTOR, -1, -1), null);
        currentScope = root;
    }
    else {
        currentScope = new Scope(newSelector, currentScope);
    }
}

function closeScope() {
    var tempScope = currentScope;
    if (root === currentScope)
        root = null;
    currentScope = currentScope.parentScope;
    return tempScope;
}

module.exports = {
    KIND: KIND,

    thisScope: function () {
        return currentScope;
    },

    createScope: function (selector, callback) {
        openScope(selector);
        callback(currentScope);
        return closeScope();
    },

    insert: function (symbol) {
        if (symbol.kind === KIND.TAG)
           currentScope.tagTable[symbol.name] = symbol;
        else if (symbol.kind === KIND.SELECTOR)
            currentScope.selectorTable[symbol.name] = symbol;
        else if (symbol.kind === KIND.VARIABLE)
            currentScope.variableTable[symbol.name] = symbol;
        else throw new Error("invalid symbol, cannot insert");
    },

    //checks to see if name symbol exists in any scope and returns it, null if not found
    lookup: function (name) {
        if (currentScope === null)
            return null;
        var tempScope = currentScope;
        while (tempScope !== null) {
            if (tempScope.selectorTable[name] !== undefined)
                return tempScope.selectorTable[name];
            else if (tempScope.variableTable[name] !== undefined)
                return tempScope.variableTable[name];
            else if (tempScope.tagTable[name] !== undefined)
                return tempScope.tagTable[name];
            else tempScope = tempScope.parentScope;
        }
        return null;
    },

    isDefined: function (name) {
        var symbol = this.lookup(name);
        return (symbol !== null);
    },

    Symbol: Symbol
};







