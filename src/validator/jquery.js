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
const chainable = function () { return this; };
export default function jQueryEnv(data) {
    let $ = function (sel) {
        // Instance members
        return {
            sel: sel,
            
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
                if (query === ":checked") {
                    // Lookup name, and return true if it is the value "on", false if missing or any other value
                    let name = getName(this.sel);
                    return data[name] === "on";
                } else if (query === ":input") {
                    return true; // Assume all server side values are inputs
                } else {
                    throw new Error(`Called $(...).is("${query}"). Only $(...).is(":checked") or $(...).is(":input") is supported.`);
                }
            },
            
            attr: chainable,
            prop: chainable,
            parent: chainable,
            find: chainable,
            
            show: () => null,
            hide: () => null,
            
            on: () => null,
            trigger: () => null,
            ready: (onReady) => onReady()
        };
    };
    
    // Static members
    $.ajax = () => null;
    
    return $;
};