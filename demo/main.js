requirejs.config({
	'baseUrl': '../',
	'paths': {
		'd3': '//cdnjs.cloudflare.com/ajax/libs/d3/3.4.8/d3.min',
		'daphne': 'src/daphne'
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

	var words = [
		{ id: 1, head: 3, relation: "OBJ", value: "ταῦτα" },
		{ id: 2, head: 3, relation: "AuxY", value: "γὰρ" },
		{ id: 3, head: 0, relation: "PRED", value: "εἶχον", },
		{ id: 4, head: 3, relation: "SBJ", value: "Ἀθηναῖοι" },
		{ id: 5, head: 1, relation: "ATR", value: "Πελοποννησίων" },
		{ id: 6, head: 0, relation: "AuxK", value: "." }
	];

	new Daphne('div', { 
		mode: 'play', 
		data: words, 
		width: 500, 
		height: 400, 
		initialScale: 0.8,
		config: '../src/conf.json'
	});

});
