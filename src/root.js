import Scope from "./scope.js";
import Token from "./token.js";

// Get the root tags and filter them to be more friendly to user-code
export default function () {
    let root = {};
    let tags = Scope.rootScope.tags;
    
    // For each tag in the root scope, expose only its Token for simplicity
    for (let tagName in tags) {
        if (!tags.hasOwnProperty(tagName)) continue;
        
        root[tagName] = tags[tagName].value;
    }
    
    // Flatten the result
    if (root.result) root.result.value = Token.flatten(root.result.value);
    
    return root;
}