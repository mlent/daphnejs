requirejs.config({
	'baseUrl': '/daphne/demo',
	'paths': {
		'jquery': '../lib/jquery.min',
		'd3': '../lib/d3.min',
		'daphne': '../daphne'
	},
	'shim': {
		'd3': {
			'exports': 'd3'
		},
		'daphne': {
			'deps': ['jquery', 'd3']
		}
	}
});

require(['jquery', 'daphne'], function($, daphne) {
	$(function() {
		$('div[data-toggle="daphne"]').daphne();
	});
});
