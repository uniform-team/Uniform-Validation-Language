// Pull the name out of the selector, can assume the selector matches /[name=".*"]/
// since that is the only format Uniform uses to reference selectors
function getName(selector) {
    if (!/\[name=".*"\]/.test(selector)) {
        throw new Error("Tried to determine the name of a malformed selector: $(\"" + selector + "\"). Only the format [name=\".*\"] is supported.");
    }
    
    // Get name of the input from the selector
    let startIndex = "[name=\"".length;
    let endIndex = selector.lastIndexOf("\"");
    let name = selector.substr(startIndex, endIndex - startIndex);
    
    return name;
}

// Expose a mock of the jQuery ($) function which looks up data from the request body given
export default function jQueryEnv(data) {
    let $ = function (sel) {
        // Instance members
        return {
            sel: sel,
            
            // Return the type of the input data
            // See GitHub #36 for bitching about "on"
            attr: function (attr) {
                if (attr !== "type") throw new Error("Called the jQuery $(...).attr(\"" + attr + "\"). Only $(...).attr(\"type\") is supported.");
                
                let name = getName(this.sel);
                return data[name] !== undefined && data[name] !== "on" ? "text" : "checkbox";
            },
            
            // Get the value of this selector by looking it up in the request data
            val: function () {
                // Pull the raw input name from the selector
                let name = getName(this.sel);
                
                // Lookup name and return its data
                return data[name];
            },
            
            // Returns whether or not this selector is checked
            // See GitHub #36 for bitching about "on"
            is: function (query) {
                if (query !== ":checked") throw new Error("Called the jQuery $(...).is(\"" + query + "\"). Only $(...).is(\":checked\") is supported.");
                
                // Lookup name, and return true if it is the value "on"
                let name = getName(this.sel);
                return data[name] === "on";
            },
            
            on: () => null,
            trigger: () => null
        };
    };
    
    // Static members
    $.ajax = () => null;
    
    return $;
};