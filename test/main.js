require.config({
	baseUrl: '../',
	paths: {
		'd3': '//cdnjs.cloudflare.com/ajax/libs/d3/3.4.8/d3.min',
		'bower_components/chai/chai'
	}
});

require(['chai'], function(chai) {
	chai.should();
	window.expect = chai.expect;
	mocha.setup("tdd");

	require(['specs'], function() {
		mocha.run();
	});
});

