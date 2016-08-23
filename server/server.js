var express = require("express");
var app = express();

var bodyParser = require("body-parser").urlencoded({ extended: false });

// Use build directory to serve static files
app.use(express.static("build"));

// On car submission, parse body and echo the data as JSON
app.post("/examples/car/submit", bodyParser, function (req, res) {
    res.status(200).end(JSON.stringify(req.body, null, 4));
});

// Listen on port given by environment
var port = 8000 || process.env.PORT;
app.listen(port, function () {
	console.log("Listening on port: " + port);
});