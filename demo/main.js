requirejs.config({
	'baseUrl': '.',
	'paths': {
		'd3': '//cdnjs.cloudflare.com/ajax/libs/d3/3.4.8/d3.min',
		'daphne': 'dist/daphne.min'
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

require(['daphne'], function(Daphne) {

	var x = new Daphne('div');

});
