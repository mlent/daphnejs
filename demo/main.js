requirejs.config({
	'baseUrl': '/daphne',
	'paths': {
		'd3': 'lib/d3.min',
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

require(['daphne'], function(Daphne) {

	var x = new Daphne('div');

});
