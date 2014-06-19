define(['src/daphne'], function(Daphne) {
	suite('Daphne', function() {

		var daphne, el;

		setup(function(done) {
			el = document.createElement('div'); 
			document.body.appendChild(el);

			var words = [
				{ id: 1, head: 3, relation: "OBJ", value: "ταῦτα" },
				{ id: 2, head: 3, relation: "AuxY", value: "γὰρ" },
				{ id: 3, head: 0, relation: "PRED", value: "εἶχον", },
				{ id: 4, head: 3, relation: "SBJ", value: "Ἀθηναῖοι" },
				{ id: 5, head: 1, relation: "ATR", value: "Πελοποννησίων" },
				{ id: 6, head: 0, relation: "AuxK", value: "." }
			];

			daphne = new Daphne('div', { 
				mode: 'play', 
				data: words, 
				width: 500, 
				height: 400, 
				initialScale: 0.8 
			});

			done();
		});

		/*suite('manualData', function() {
			var data = {[
				{ id: 1, head: 3, relation: "OBJ", value: "ταῦτα" },
				{ id: 2, head: 3, relation: "AuxY", value: "γὰρ" },
				{ id: 3, head: 0, relation: "PRED", value: "εἶχον", },
				{ id: 4, head: 3, relation: "SBJ", value: "Ἀθηναῖοι" },
				{ id: 5, head: 1, relation: "ATR", value: "Πελοποννησίων" },
				{ id: 6, head: 0, relation: "AuxK", value: "." }
				]};
		});*/

		suite('removeChild', function() {
			test('remove child from middle ', function() {
				
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
});
