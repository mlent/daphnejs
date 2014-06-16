module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: '<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}
		},
		blanket_mocha: {
			all: ['test/*.html'],
			options: {
				threshold: 90,
				run: false 
			}
		},
		jshint: {
			files: ['daphne.js'],
			options: {
				globals: {
					d3: true,
					console: true,
					module: true,
					document: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-blanket-mocha');

	grunt.registerTask('default', ['uglify', 'blanket_mocha']);
	grunt.registerTask('test', ['jshint', 'blanket_mocha']);

};
