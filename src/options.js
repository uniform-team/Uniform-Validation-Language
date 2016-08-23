import parser from "./parser.js";

// Send a GET request to the given URL and parse the resulting data as a Uniform script
export function href(url) {
    // Perform an ajax request for the Uniform script
    return $.ajax({
        method: "GET",
        url: url,
        
        // When script is successfully received, parse it
        success: function (res) {
            parser.parse(res);
        }
    });
}