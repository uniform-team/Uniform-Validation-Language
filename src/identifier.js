import { document, $ } from "./env.js";
import constants from "./constants.js";
import Token from "./token.js";
import Scope from "./scope.js";
import Dependable from "./dependable.js";

// Global map storing all identifiers by name for later lookup
let identifierMap = {};

/**
 * Class representing the static Identifier class which
 * manages the various identifiers which are created
 * throughout the lifetime of the library.
 */
export class Identifier {
    // Construct an Identifier by initializing its values from a token
	constructor(token) {
		this.name = token.value;
		this.line = token.line;
		this.col = token.col;
	}
    
	// Static getter for the global identifier map, used for testing / debugging
	static get _map() {
	    return identifierMap;
    }
    
    // Static setter for the global identifier map, used for testing / debugging
    static set _map(map) {
        identifierMap = map;
    }
    
    // Insert the given identifier into the global map
	static insert(identifier) {
		identifierMap[identifier.name] = identifier;
	}
    
	// Find an identifier with the given name in the global map or null
	static find(name) {
		return identifierMap[name] || null;
	}
}

/**
 * Class representing a block identifier, one which contains a scope.
 *
 * Ex.
 * myIdentifier {
 *     ...
 * }
 */
export class BlockIdentifier extends Identifier {
    // Construct a BlockIdentifier, initializing its internal state
	constructor(token) {
		super(token);
		this.scope = new Scope();
	}
    
	// Get the tag with the given name under this BlockIdentifier's scope
	getTag(tagName) {
	    // Find the tag in the contained scope
		return this.scope.findTag(tagName);
	}
}

/**
 * Class representing an expression identifier, one used in an expression.
 * Mixes in Dependable.
 *
 * Ex.
 * valid: myIdentifier equals true;
 */
export class ExpressionIdentifier extends Dependable(Identifier) {
    // Construct an ExpressionIdentifier, initializing its dependency system
	constructor(token) {
		super(token);
        this.token = token;
        
        // Initialize the dependable with an expression which pulls the identifier's value from the DOM tree
		let self = this;
        this.initDependable(() => self.getToken());
        this.update();
		
        // When the DOM element changes, update this identifier
		$(document).on("change", token.getSelector(), () => this.update());
	}
	
	// Return a token containing this identifier's value and type
	getToken() {
		let $el = $(this.token.getSelector());
	    
        switch ($el.attr("type")) {
        case "checkbox":
            return new Token($el.is(":checked"), constants.TYPE.BOOL, this.line, this.col);
        default:
            return new Token($el.val(), constants.TYPE.STRING, this.line, this.col);
        }
	}
}