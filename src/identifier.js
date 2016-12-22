import { document, $ } from "./env.js";
import constants from "./constants.js";
import { AssertionError, RedeclaredError, NotImplementedError } from "./errors.js";
import Token from "./token.js";
import Scope from "./scope.js";
import Dependable from "./dependable.js";

// Global map storing all identifiers by name for later lookup
let identifierMap;

/**
 * Class representing an Identifier which static manages all identifiers created, holds a scope for
 * child tags, and can be depended on.
 */
export default class Identifier extends Dependable() {
    // Construct an Identifier by initializing its values from a token
    constructor(token, type) {
        super();
        
        this.name = token.value;
        this.type = type;
        this.token = token;
        this.scope = new Scope(this);
        
        // Initialize the dependable with an expression which pulls the identifier's value from the DOM tree
        let self = this;
        this.initDependable(() => self.getToken());
        this.update();
        
        // When the DOM element changes, update this identifier
        $(document).on("change", token.getSelector(), () => this.update());
    }
    
    // Static getter for the global identifier map, used for testing / debugging
    static get _map() {
        return identifierMap;
    }
    
    // Static setter for the global identifier map, used for testing / debugging
    static set _map(map) {
        identifierMap = map;
    }
    
    // Initialize the identifier map
    static init() {
        identifierMap = {};
    }
    
    // Declare an identifier with the given name and type
    static declare(identifier) {
        if (identifierMap[identifier.name]) throw new RedeclaredError(identifier.name + " was already declared.",
                identifier.token.line, identifier.token.col);
        identifierMap[identifier.name] = identifier;
    }
    
    // Find an identifier with the given name in the global map or null
    static find(name) {
        return identifierMap[name] || null;
    }
    
    // Get the tag with the given name under this BlockIdentifier's scope
    getTag(tagName) {
        // Find the tag in the contained scope
        return this.scope.findTag(tagName);
    }
    
    // Return a token containing this identifier's value and type
    getToken() {
        let $el = $(this.token.getSelector());
        
        switch (this.type) {
            case constants.TYPE.STRING:
                return new Token($el.val() || "", constants.TYPE.STRING, this.line, this.col);
            case constants.TYPE.BOOL:
                return new Token($el.is(":checked"), constants.TYPE.BOOL, this.line, this.col);
            case constants.TYPE.NUMBER:
                throw new NotImplementedError("The number type is not yet implemented, due to possible parsing errors.");
            default:
                throw new AssertionError("Expected " + this.name + " to have a UFM type, but it was of type " + this.type);
        }
    }
}