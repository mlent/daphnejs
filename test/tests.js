var assert = require("assert"), 
	requirejs = require("requirejs"), 
	jsdom = requirejs('jsdom'); 

var document = jsdom.jsdom("<html><body></body></html>"),
   window = document.createWindow();

var jQuery = global.$ = require('jquery')(window);
global.document = document, global.window = window;

requirejs.config({
	'baseUrl': '.',
	nodeRequire: require
});

var Daphne = requirejs('daphne');

suite('Daphne', function() {

	var daphne;

	setup(function(done) {
		var el = $('div').appendTo('body');
		daphne = el.Daphne();

		done();
	});

	suite('test', function() {
		test('1 = 1', function() {
			assert.equal(1, 1);
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

			assert.equal(output, daphne._removeChild(children, child));

		});
	});
});
