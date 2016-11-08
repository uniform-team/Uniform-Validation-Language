import fs from "fs";

import denodeify from "denodeify";
import bodyParserModule from "body-parser";

import jQueryEnv from "./jquery.js";
import uniform from "../main.js";

let bodyParser = bodyParserModule.urlencoded({ extended: false });

// Export function which takes a path to a Uniform script and returns a middleware function which validates against it
module.exports = function (path) {
    let readFile = denodeify(fs.readFile); // Denodeify after invocation so fs.readFile can be mocked
    
    // Read the file given
    let fsPromise = readFile(path, { encoding: "utf8" });
    
    // Validate the request given
    let validate = function (req, res, next) {
        // Wait for file to finish reading
        fsPromise.then(function (script) {
            // Mock DOM and jQuery dependencies
            let document = {};
            let $ = jQueryEnv(req.body);
            
            // Start Uniform runtime
            let ufm = uniform(document, $);
            
            // Parse the given script
            ufm.parser.parse(script);
            
            // Stop Express with an error if invalid
            if (!ufm.root.valid.value) throw new Error("Data is invalid!");
            
            // Return the result of the validation
            return ufm.root.result && ufm.root.result.value;
        }).then(function (result) {
            req.ufmResult = result;
            next();
        }, function (err) {
            next(err);
        });
    };
    
    // Return middleware wrapper function to parse the body of the request if it is not already parsed
    return function (req, res, next) {
        if (!req.body) {
            bodyParser(req, res, function () {
                validate(req, res, next);
            });
        } else {
            validate(req, res, next);
        }
    };
};