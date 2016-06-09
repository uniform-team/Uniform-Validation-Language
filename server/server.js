var express = require("express");

var validate;
try {
	validate = require("uniform-validation");
} catch (err) {
	console.log("Unable to require(\"uniform-validation\"). Link it with\n"
		+ "$ npm link\n"
		+ "$ cd server\n"
		+ "$ npm link uniform-validation\n"
		+ "$ cd .."
	);
	return;
}

var app = express();

// Serve build directory
app.use(express.static("build/"));

// Handle submission of the car form
app.post("/examples/car/submit", validate({ path: "build/examples/car/car.ufm", main: "#rootForm" }), function (req, res) {
	res.end("Valid!"); // Successfully validated
}, function (err, req, res, next) {
	res.end("Invalid!"); // Failed to validate for some reason (stored in err)
});

// Listen to the process' port
var port = process.env.port || 8000;
app.listen(port, function () {
	console.log("Listening on port " + port);
});