requirejs.config({
	'baseUrl': '/daphne/demo',
	'paths': {
		'jquery': '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min',
		'd3': '//cdnjs.cloudflare.com/ajax/libs/d3/3.4.8/d3.min',
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
