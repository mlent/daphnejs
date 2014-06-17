require.config({
	baseUrl: '../',
	paths: {
		'd3': 'node_modules/d3/d3',
		'chai': 'bower_components/chai/chai',
	},
	'shim': {
		'd3': {
			'exports': 'd3'
		}
	}
});

require(['chai'], function(chai) {

	chai.should();
	window.expect = chai.expect;
	window.assert = chai.assert;
	mocha.setup("tdd");

	console.log(blanket);

	require(['test/spec'], function() {
		mocha.run();
	});
});

