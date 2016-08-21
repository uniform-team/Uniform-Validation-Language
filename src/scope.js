import {Variable} from "./variable.js";
import {DuplicateDeclarationError, AssertionError} from "./errors.js"
import Tag from "./tag.js";
import { Identifier } from "./identifier.js";

let currentScope = null;

/**
 * Class representing the Scope created by a block containing
 * tags, variables, and other blocks.
 *
 * Ex.
 * myIdentifier {
 *     valid: true;
 *     @test: true;
 *     myInnerIdentifier {
 *         ...
 *     }
 *     @myInnerVar {
 *         ...
 *     }
 *     ...
 * }
 *
 * or
 *
 * @myVariable {
 *     valid: true;
 *     @test: true;
 *     myInnerIdentifier {
 *         ...
 *     }
 *     @myInnerVar {
 *         ...
 *     }
 *     ...
 * }
 */
export default class Scope {
    // Construct a new Scope setting its parent as the current scope
    constructor() {
        this.variables = {};
        this.tags = {};
        this.identifiers = {};
        this.parentScope = Scope.thisScope();
    }
    
    // Static getter for the current scope used for testing / debugging purposes
    static get _currentScope() {
        return currentScope;
    }
    
    // Static setter for the current scope used for testing / debugging purposes
    static set _currentScope(scope) {
        currentScope = scope;
    }
    
    // Reset the scope hierarchy to default
    static reset() {
        currentScope = null;
    }
    
    // Get the lowest level scope currently pushed
    static thisScope() {
        return currentScope;
    }
    
    // Push this scope onto the hierarchy stack and invoke the callback
    // Automatically pops off the stack once the callback completes
    push(cb) {
        // Push this scope onto hierarchy stack
        let prevScope = currentScope;
        currentScope = this;
        
        // Invoke callback
        cb();
        
        // Pop this scope off the hierarchy stack
        currentScope = prevScope;
    }
    
    // Insert the given item into this scope
    insert(item) {
        if (item instanceof Variable) { // Insert into Variable map
            if (this.findVar(item.name))
                throw new DuplicateDeclarationError("Redeclared Variable \"" + item.name + "\" in same scope", item.line, item.col);
            this.variables[item.name] = item;
        } else if (item instanceof Tag) { // Insert into Tag map
            if (this.findTag(item.name))
                throw new DuplicateDeclarationError("Redeclared Tag \"" + item.name + "\" in same scope", item.line, item.col);
            this.tags[item.name] = item;
        } else if (item instanceof Identifier) { // Insert into Identifier map
        	if (this.findIdentifier(item.name))
        		throw new DuplicateDeclarationError("Redeclared Identifier \"" + item.name + "\" in same scope", item.line, item.col);
			this.identifiers[item.name] = item;
		} else {
            throw new AssertionError("Inserted an item of type \"" + typeof item + "\" expected Variable, Tag, or Identifier");
        }
    }
    
    // Looks for a variable with the name given under this scope and returns it if it exists or null otherwise
    findVar(name) {
        return this.variables[name] || null;
    }
    
    // Looks for a tag with the name given under this scope and returns it if it exists or null otherwise
    findTag(name) {
        return this.tags[name] || null;
    }
    
    // Looks for an identifier with the name given under this scope and returns it if it exists or null otherwise
    findIdentifier(name) {
    	return this.identifiers[name] || null;
	}

    // Looks for a variable with the name given under this scope and all ancestry scopes and returns it if it exists or null otherwise
    lookupVar(name) {
        // Check if the variable exists in this scope
        let variable = this.findVar(name);
        
        if (variable) return variable; // Return it if found
        else return this.parentScope && this.parentScope.lookupVar(name); // Not found, check parent recursively
    }
    
    // Looks for a tag with the name given under this scope and all ancestry scopes and returns it if it exists or null otherwise
    lookupTag(name) {
        // Check if the tag exists in this scope
        let tag = this.findTag(name);
        
        if (tag) return tag; // Return it if found
        else return this.parentScope && this.parentScope.lookupTag(name); // Not found, check parent recursively
    }
    
    // Looks for an identifier with the name given under this scope and all ancestry scopes and returns it if it exists or null otherwise
    lookupIdentifier(name) {
        // Check if the identifier exists in this scope
        let identifier = this.findIdentifier(name);
        
		if (identifier) return identifier; // Return it if found
		else return this.parentScope && this.parentScope.lookupIdentifier(name); // Not found, check parent recursively
	}
}

