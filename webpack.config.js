var path = require("path");

module.exports = {
	entry: "./src/main.js",
	output: {
		path: path.join(__dirname, "build"),
		filename: "uniform.js"
	},
	module: {
		loaders: [
			{
				test: /.js$/,
				loader: "babel-loader",
				query: {
					presets: [ "es2015" ]
				}
			}
		]
	},
	devtool: "inline-source-map"
};