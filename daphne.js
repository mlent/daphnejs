// Make our plugin AMD comptaible: https://github.com/umdjs/umd
!function(root, factory) {

	if (typeof define === 'function' && define.amd) {
		define(['jquery', 'd3'], factory);
	}
	else {
		factory(jQuery, d3);
	}

}(this, function($, d3) {
	'use strict';

	// Plugin Constructor
	var Daphne = function(el, options) {
		this.el = el;
		this.$el = $(el);
		this.options = options;
	};

	// Plugin Methods + Shared Properties
	Daphne.prototype = {

		defaults: {
			'mode': 'edit',
			'source': 'data.json', 	// For testing purposes, will be removed
			'dimensions': {
				'margins': {
					'top': 50,
					'right': 0,
					'bottom': 50,
					'left': 0
				},
				'width': 600,
				'height': 600,
				'initialScale': 0.9
			},
			'duration': 500
		},

		init: function() {
			this.config = $.extend({}, this.defaults, this.options);

			this.$el.bind('populated', this.render.bind(this));

			this._fetchData();
			return this;
		},
		
		/** Fetches whatever data we want to use to build the parse tree. */
		_fetchData: function() {
			var that = this;

			$.ajax({
				url: that.config.source,
				dataType: 'text',
				that: that,
				success: function(response) {
					that.data = that._convertData(JSON.parse(response).words);
					that.$el.trigger('populated');
				},
				error: function(xhr, textStatus, error) {
					console.log(xhr, textStatus, error);
				}
			});
		},

		/** 
		 * Converts data from flat JSON into hierarchical JSON that d3 needs to build our tree. Creates replicate copy of the
		 * data if the user is in 'edit' mode or 'play' mode.
		 * @param {object} words - Array of word objects.
		 */
		_convertData: function(words) {

			var that = this;

			// Store our good, untouched-by-the-user data somewhere safe 
			this.answers = JSON.parse(JSON.stringify(words));

			var dataMap = words.reduce(function(map, node) {
				map[node.id] = node;
				return map;
			}, {});

			// Calc root node, and append it to our datasets 
			var rid = 0, node = {};
			for (var i = 0; i < words.length; i++) {
				node = words[i];
				if (dataMap[node.head] == undefined)
					break;	
			}
			var rootNode = { 'tbwid': node.head, 'value': 'root', 'pos': 'root' };
			words.push(rootNode);
			dataMap[node.head] = rootNode;

			var treeData = [];
			words.forEach(function(node) {

				// If we're in 'play' mode, reset head property of all nodes to the root node
				var head = (that.config.mode == 'play' && node.pos != 'root') ? dataMap[rootNode.tbwid] : dataMap[node.head];

				// Then, create the hierarchical data d3 needs
				if (head)
					(head.children || (head.children = [])).push(node);
				else
					treeData.push(node);
			});

			return treeData;
		},

		/**
		 * Uses the fetched data to render the parse tree, considering user options
		 */
		render: function(e) {
			
			var that = this;

			// To keep multiple instances from stomping on each other's data/d3 references
			this.tree = d3.layout.tree().nodeSize([100, 50]);

			this.tree.separation(function(a, b) {
				var w1 = (a.value.length > a.relation.length) ? a.value.length : a.relation.length;
				var w2 = (b.value.length > b.relation.length) ? b.value.length : b.relation.length;

				var  scale = 0.13;

				return Math.ceil((w1 * scale) + (w2 * scale) / 2);
			});

			var diagonal = d3.svg.diagonal().projection(function(d) {
				return [d.x, d.y];
			});

			// TODO: Get tag names from conf file
			this.color = d3.scale.ordinal()
				.domain(["noun", "verb", "participle", "adj", "adverb", "particle", "conj", "prep", "pron", "numeral", "interjection", "exclam", "punct", "article", "root", "_", "unassigned"])
				.range(["#019292", "#D15241", "#8CD141", "#4E6087", "#8CD141", "#FF881A", "#754574", "#149069", "#523D5B", "#812F0F", "#F4BC78", "#F4BC78", "#1D78AA", "#257008", "#333", "#999", "#999"]);

			// Now we start working on the elements themselves
			this.svg = d3.select(this.el).append('svg')
				.attr('class', 'svg-container');
			this.canvas = this.svg.append('g')
				.attr('class', 'canvas');
			this.canvas.append('g')
				.attr('transform', 'translate(' + 
					((that.config.dimensions.width / 2)) + ', ' + 
					that.config.dimensions.margins.top + ') scale(' + 
					that.config.dimensions.initialScale + 
				')');

			// Zooming and scale function for SVG -- attached to action object after update function below
			function zoom() {
				var scale = d3.event.scale,
					translation = d3.event.translate,
					tbound = -that.config.dimensions.height * scale,
					bbound = that.config.dimensions.height * scale,
					lbound = (-that.config.dimensions.width + that.config.dimensions.margins.right) * scale,
					rbound = (that.config.dimensions.width + that.config.dimensions.margins.left) * scale;

				var translation = [
					Math.max(Math.min(translation[0], rbound), lbound),
					Math.max(Math.min(translation[1], bbound), tbound)
				];

				that.canvas.attr('transform', 'translate(' + translation + ') scale(' + scale + ')');
			}

			// And alas, the d3 update function
			this.root = this.data[0];
			update(this.root);

			/**
			 * Update function is called every time the structure of the tree changes. It manages adjusting
			 * the positions of the nodes, their colors, displaying attirbutes and relations, etc.
			 *
			 */
			function update(source) {
				var nodes = that.tree(that.root).reverse(),
					links = that.tree.links(nodes);

				nodes.forEach(function(d) {
					d.y = d.depth * 100;
				});

				var node = that.svg.select('.canvas g').selectAll('g.node')
					.data(nodes, function(d, i) {
						return d.id || (d.id = ++i);
					});

				var nodeEnter = node.enter().append('g')
					.attr('class', 'node')
					.attr('transform', function(d) {
						return 'translate(' + source.x + ', ' + source.y + ')';
					});

				nodeEnter.append('circle')
					.attr('r', 10)
					.style('stroke', function(d) {
						return that.color(d.pos);
					})
					.style('fill', function(d) {
						return '#FFF';
					});

				nodeEnter.append('text')
					.attr('y', function(d, i) {
						return (d.pos == 'root') ? -30 : 15;
					})
					.attr('dy', '14px')
					.attr('text-anchor', 'middle')
					.text(function(d) {
						return d.value;
					})
					.style('fill', function(d, i) {
						return (d.pos == 'root') ? '#CCC' : '#333';
					})
					.style('fill-opacity', 1);

				nodeEnter.append('text')
					.attr('y', function(d, i) {
						return (d.pos == 'root') ? 0 : -30;
					})
					.attr('dy', '12px')
					.attr('text-anchor', 'middle')
					.attr('class', 'label')
					.text(function(d) {
						return d.relation;
					});

				var nodeUpdate = node.transition()
					.duration(that.config.duration)
					.attr('transform', function(d) {
						return 'translate(' + d.x + ', ' + d.y + ')';
					});

				nodeUpdate.select('text.label')
					.text(function(d) {
						return d.relation;
					});

				nodeUpdate.select('circle')
					.style('stroke', function(d) {
						return that.color(d.pos);
					})
					.style('fill', function(d) {
						return '#FFF';
					});

				var link = that.svg.select('.canvas g').selectAll('path.link')
					.data(links, function(d) {
						return d.target.id;
					});

				link.enter().insert('path', 'g')
					.attr('class', 'link')
					.attr('d', function(d) {
						var o = { x: source.x, y: source.y };
						return diagonal({ source: o, target: o });
					});

				link.transition()
					.duration(that.config.duration)
					.attr('d', diagonal);

				nodes.forEach(function(d, i) {
					d.x0 = d.x;
					d.y0 = d.y;
				});
			}
			// End of Update function

			d3.select(this.$el.find('svg')[0])
				.call(d3.behavior.zoom()
					.scaleExtent([0.5, 5])
					.on("zoom", zoom))
				.on('dblclick.zoom', null);

			this.update = update;
		}
	};

	$.fn.daphne = function(options) {
		return this.each(function() {
			new Daphne(this, options).init();
		});
	};

	$.fn.daphne.Daphne = Daphne;
	window.Daphne = Daphne;

});
