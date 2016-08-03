var express = require("express");
var app = express();

// Use build directory to serve static files
app.use(express.static("build"));

// Listen on port given by environment
var port = 8000 || process.env.PORT;
app.listen(port, function () {
	console.log("Listening on port: " + port);
});