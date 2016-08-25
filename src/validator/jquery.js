// Expose a mock of the jQuery ($) function which looks up data from the request body given
export default function jQueryEnv(data) {
    let $ = function (sel) {
        // Instance members
        return {
            sel: sel,
            
            // Get the value of this selector by looking it up in the request data
            val: function () {
                // Get name of the input
                let startIndex = "[name=\"".length;
                let endIndex = this.sel.lastIndexOf("\"");
                let name = this.sel.substr(startIndex, endIndex - startIndex);
                
                // Lookup name and return its data
                return data[name];
            },
            
            on: () => null,
            trigger: () => null
        };
    };
    
    // Static members
    $.ajax = () => null;
    
    return $;
};