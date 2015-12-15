module.exports = function (grunt) {
	grunt.initConfig({
		connect: {
			dev: {
				port: 8000,
				base: "build/"
			}
		},
		browserify: {
			build: {
				options: {
					browserifyOptions: {
						debug: true
					}
				},
				files: {
					"build/uniform.js": [ "src/**/*.js" ]
				}
			}
		}
	});

	grunt.loadNpmTasks("grunt-connect");
	grunt.loadNpmTasks("grunt-browserify");

	grunt.registerTask("build", [ "browserify:build" ]);
	grunt.registerTask("serve", [ "connect:dev" ]);
	grunt.registerTask("dev", [ "build", "serve" ]);
	grunt.registerTask("default", [ "dev" ])
};