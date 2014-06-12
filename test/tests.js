'use strict';
var requirejs = require("requirejs"); 

requirejs.config({
	'baseUrl': '.',
	nodeRequire: require
});

var assert = require("assert");

suite('Daphne', function() {

	var Daphne;

	setup(function(done) {
		requirejs(['daphne'], function(d) {
			console.log("fired!");
			Daphne = d;
			done();
		});
	});

	// This doesn't work yet...maybe one day
	suite('removeChild', function() {
		test('removeChild should remove child from array of children', function() {
			
			var children = [
				{ 'id' : 1 },
				{ 'id' : 3 },
				{ 'id' : 5 }
			];
			var child = { 'id': 1 };
			var ouput = [
				{ 'id' : 3 },
				{ 'id' : 5 }
			];

			assert.equal(output, Daphne._removeChild(children, child));

		});
	});
});
