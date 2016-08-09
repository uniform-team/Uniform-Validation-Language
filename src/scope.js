import constants from "./constants.js";
import {Variable} from "./variable.js";
import {DuplicateDeclarationError, AssertionError} from "./errors.js"
import Tag from "./tag.js";

let currentScope = null;

export default class Scope {

    constructor(callback){
        this.variables = {};
        this.tags = {};
        this.parentScope = currentScope; //open scope
        currentScope = this;
        if (callback)
            callback(this);
        currentScope = this.parentScope; //close scope
    }
    static reset() {
        currentScope = null;
    }

    static thisScope() {
        return currentScope;
    }

    insert(item) {
        if (item instanceof Variable) {
            if (this.findVar(item.name))
                throw new DuplicateDeclarationError("Redeclared variable \"" + item.name + "\" in same scope", item.line, item.col);
            this.variables[item.name] = item;
        }
        else if (item instanceof Tag) {
            if (this.findTag(item.name))
                throw new DuplicateDeclarationError("Redeclared tag \"" + item.name + "\" in same scope", item.line, item.col);
            this.tags[item.name] = item;
        }
        else throw new AssertionError("Inserted an item of type \"" + typeof item + "\" expected Variable or Tag");
    }

    //checks to see if name exists in variable table
    //returns variable if it exists or undefined if it doesn't
    findVar(name) {
        return this.variables[name] || null;
    }

    findTag(name) {
        return this.tags[name] || null;
    }

    //checks to see if name exists in any scope and returns it
    //returns null if not found
    lookupVar(name) {
        let variable = this.findVar(name);
        if (variable)
            return variable;
        else
            return this.parentScope && this.parentScope.lookupVar(name);
    }

    lookupTag(name) {
        let tag = this.findTag(name);
        if (tag)
            return tag;
        else
            return this.parentScope && this.parentScope.lookupTag(name);
    }
}

