module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'src/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
		blanket_mocha: {
			all: ['test/index.html'],
			options: {
				threshold: 70,
				run: false,
				excludedFiles: [
					'node_modules/chai/chai',
					'node_modules/d3/d3',
					'test/spec.js',
					'test/main.js'
				]
			}
		},
		jshint: {
			files: ['src/daphne.js'],
			options: {
				globals: {
					d3: true,
					console: true,
					module: true,
					document: true
				}
			}
		},
		watch: {
			sass: {
				files: ['sass/**/*.{scss,sass}','sass/_partials/**/*.{scss,sass}'],
				tasks: ['sass:dist']
			},
			livereload: {
				files: ['*.html', 'js/**/*.{js,json}', 'css/*.css','img/**/*.{png, jpg, jpeg, gif, webp, svg}'],
				options: {
					livereload: true
				}
			}					
		},
		sass: {
			options: {
				sourceComments: 'map',
				outputStyle: 'extended'
			},
			dist: {
				files: {
					'dist/style.css': 'src/style.scss'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-blanket-mocha');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['uglify', 'sass:dist', 'watch']);
	grunt.registerTask('test', ['jshint', 'blanket_mocha']);

};
