require.config({
	baseUrl: '../',
	paths: {
		'd3': '//cdnjs.cloudflare.com/ajax/libs/d3/3.4.8/d3.min',
		'chai': 'bower_components/chai/chai',
		'daphne': 'daphne'
	},
	'shim': {
		'd3': {
			'exports': 'd3'
		},
		'daphne': {
			'exports': 'daphne',
			'deps': ['d3']
		}
	}
});

require(['chai'], function(chai) {

	chai.should();
	window.expect = chai.expect;
	window.assert = chai.assert;
	mocha.setup("tdd");

	require(['test/spec'], function() {
		mocha.run();
	});
});

