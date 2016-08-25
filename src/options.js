import { $ } from "./env.js";
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

// Boolean determining whether the library should validate client code to prevent the user from sending invalid data.
//This should only be disabled for debugging purposes to test that the server responds to bad inputs correctly.
export let validateClient = true;