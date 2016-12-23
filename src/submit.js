import { document, $ } from "./env.js";
import { validateClient } from "./options.js";
import parser from "./parser.js";
import root from "./root.js";

let getRoot = root;

// Initialize the module to hook onto form submission events
export default {
    // Setter for the root function used for testing / debugging purposes
    set _root(root) {
        getRoot = root;
    },
    
    init: function () {
        // When any form is submitted on the page
        $(document).on("submit", "form", function (evt) {
            // Check if a Uniform source file was provided for validation
            if (!parser.providedFile) {
                evt.preventDefault();
                alert("No Uniform file was provided for validation. Did you remember to call uniform.parser.parse(...)"
                    + " or uniform.options.href(...)?");
                return;
            }
            
            // Check if there is a root-level valid tag
            let validToken = getRoot().valid;
            if (!validToken) {
                evt.preventDefault();
                alert("No root-level valid tag to validate with!");
                return;
            }
            
            // Check if the form is valid
            let valid = validToken.value;
            if (validateClient && !valid) {
                evt.preventDefault();
                alert("Form is not valid!");
            }
            
            // Form is valid, let browser continue with submission
        });
    }
};