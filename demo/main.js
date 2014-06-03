requirejs.config({
	'baseUrl': '/daphne/demo',
	'paths': {
		'jquery': '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min',
		'd3': '//cdnjs.cloudflare.com/ajax/libs/d3/3.4.8/d3.min'
	},
	'shim': {
		'd3': {
			'exports': 'd3'
		}
	}
});

require(['jquery', 'd3', '../daphne'], function($, d3, daphne) {
	$(function() {
		$('div[data-toggle="daphne"]').daphne();
	});
});
