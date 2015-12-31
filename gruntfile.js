module.exports = function (grunt) {
	grunt.initConfig({
		connect: {
			// Run development server on port 8000
			dev: {
				port: 8000,
				base: "build/"
			}
		},

		browserify: {
			// Build production (minified) script
			prod: {
				files: {
					"build/uniform.min.js": [ "src/**/*.js" ]
				}
			},

			// Build development (mapped) script
			dev: {
				options: {
					browserifyOptions: {
						debug: true
					}
				},
				files: {
					"build/uniform.js": [ "src/**/*.js" ]
				}
			}
		},

		uglify: {
			// Minify production script
			prod: {
				files: [{
					src: [ "build/uniform.min.js" ],
					dest: "build/uniform.min.js"
				}]
			}
		},

		karma: {
			options: {
				configFile: "karma.conf.js"
			},

			// Run Jasmine tests with Karma
			test: {
				singleRun: true
			}
		}
	});

	// Load Grunt modules
	grunt.loadNpmTasks("grunt-connect");
	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-karma");

	// Register build tasks
	grunt.registerTask("build-dev", [ "browserify:dev" ]);
	grunt.registerTask("build-prod", [ "browserify:prod", "uglify:prod" ]);

	// Register test tasks
	grunt.registerTask("test", [ "karma:test" ]);

	// Register serve task
	grunt.registerTask("serve", [ "connect:dev" ]);

	// Register aliases
	grunt.registerTask("build", [ "build-dev", "build-prod" ]);
	grunt.registerTask("dev", [ "build-dev", "serve" ]);
	grunt.registerTask("default", [ "dev" ])
};