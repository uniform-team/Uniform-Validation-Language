var path = require("path");

module.exports = {
	entry: "./src/main.js",
	output: {
		path: path.join(__dirname, "dist"),
		filename: "uniform.js",
		library: "uniform",
        libraryTarget: "umd"
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