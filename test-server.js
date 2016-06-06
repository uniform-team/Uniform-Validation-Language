var express = require("express");
var validate = require("./src/validator/validator.js");

var app = express();

// Serve build directory
app.use(express.static("build/"));

// Handle submission of the car form
app.post("/examples/car/submit", validate("build/examples/car/car.ufm", "#rootForm"), function (req, res) {
	res.end("Valid!"); // Successfully validated
}, function (err, req, res, next) {
	res.end("Invalid!"); // Failed to validate for some reason (stored in err)
});

// Listen to the process' port
var port = process.env.port || 8000;
app.listen(port, function () {
	console.log("Listening on port " + port);
});