var assert = require("assert"), 
	requirejs = require("requirejs"), 
	jsdom = requirejs('jsdom'); 

var window = jsdom.jsdom().createWindow('<html><body></body></html>');
global.document = window.document;
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
window.XMLHttpRequest.prototype.withCredentials = false;

requirejs.config({
	'baseUrl': '.',
	nodeRequire: require
});

var Daphne = requirejs('daphne');

suite('Daphne', function() {

	var daphne;

	setup(function(done) {
		var el = document.createElement('div'); 
		document.body.appendChild(el);
		daphne = new Daphne('div'); 

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
			var output = [
				{ 'id' : 3 },
				{ 'id' : 5 }
			];

			assert.deepEqual(output, daphne._removeChild(children, child));

		});
	});
});
