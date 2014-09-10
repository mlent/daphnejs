define(['d3'], function(d3) {

	'use strict';

	function daphne(selector, options) {

		/*jshint validthis:true */
		if (typeof(selector) === 'string')
			this.el = document.querySelector(selector);
		else
			this.el = selector;

		this.options = options || {};

		if (this.el === null) {
			return this;
		}

		this.init();
		return this;
	}

	// Plugin Methods + Shared Properties
	daphne.prototype.defaults = {
		mode: 'edit',						// [str] How you want to interact with the tree. Opts: Edit, Play, Create, Display
		lang: 'grc',						// [str] Language of sentence being treebanked. Should correspond in daphne.css.
		data: null,							// [array<json>] Accepts array of JSON objects (the words in the sentence)
		marginTop: 30,						// [number] Tree display - margins
		marginRight: 0,
		marginBottom: 50,
		marginLeft: 0,
		width: 400,							// [number] Tree display - width
		height: 400,						// [number] Tree display - height
		initialScale: 0.9,					// [number] Tree display - initial zoom level
		duration: 500,						// [number] Time it takes for a node to mode (in milliseconds)
		include: null, 						// [array<str>] Fields to include from the data in the editing panel [whitelist]
		exclude: null,						// [array<str>]Fields to exclude from the data in the editing panel [blacklist]
		config: null
	};

	/**
	 * Initializes the plugin, combines user-set preferences with defaults.
	 */ 
	daphne.prototype.init = function() {

		this.config = this._extend({}, this.defaults, this.options);

		// Pass in a URL as data-source, or an array of word objects as a 'data' option
		/*
		TODO: Re-write logic to allow API endpoint + pass in a callback.
		if (!this.config.data) {
			this._fetchData();
			this.el.addEventListener('populated', this.render.bind(this));
		}*/

		this._configureSettings(this.options.config);
		this.data = this._convertData(this.config.data);
		this.render();

		return this;
	};

	/**
	 * In order to output a file, user needs to be able to configure how they want to be able to work on the tree.
	 * @param {object} config - the value the user has set for their configuration.
	 */
	daphne.prototype._configureSettings = function(config) {
		// They've passed us an endpoint, fetch configuration
		if (typeof config === 'string') {

			var request = new XMLHttpRequest();
			request.responseType = 'json';
			request.open('GET', config, false);

			request.onload = function() {
				if (request.status >= 200 && request.status < 400) {
					this.config.config = request.response;
				}
				else {
					console.log("Reached server but server error occured while trying to fetch data");
				}
			}.bind(this);

			request.onerror = function() {
				console.log("Connection error while trying to fetch data.");
			};

			request.send();
		}
		// They've passed us the object, so use directly
		// TODO: Validate against schema and log error if it doesn't match
		else if (typeof config === 'object') {
			this.config.config = config;
		}
		// Give them super basic configuration
		else if (typeof config  === 'undefined') {
			this.config.config = { "fields": [ 
				{ "name": "value", "type": "text", "label": "Value" },
				{ "name": "pos", "type": "text", "label": "Part of Speech"},
				{ "name": "relation", "type": "text", "label": "Relation" }]
			};
		}
	};

	/** 
	 * Fetches whatever data we want to use to build the parse tree. 
	 */
	daphne.prototype._fetchData = function() {

		var request = new XMLHttpRequest();
		request.responseType = 'json';
		request.open('GET', this.config.dataSource, true);

		request.onload = function() {
			if (request.status >= 200 && request.status < 400) {
				this.data = this._convertData(request.response.words);

				// Tell our app that data has populated
				var ev;
				if (window.CustomEvent) 
					ev = new CustomEvent('populated');
				else {
					ev = document.createEvent('CustomEvent');
					ev.initEvent('populated', true, true);
				}
				this.el.dispatchEvent(ev);
			}
			else {
				console.log("Reached server but server error occured while trying to fetch data");
			}
		}.bind(this);

		request.onerror = function() {
			console.log("Connection error while trying to fetch data.");
		};

		request.send();
	};

	/** 
	 * Converts data from flat JSON into hierarchical JSON that d3 needs to build our tree. 
	 * Creates replicate copy of the data if the user is in 'edit' mode or 'play' mode.
	 * @param {object} words - Array of word objects.
	 */
	daphne.prototype._convertData = function(words) {

		var that = this;

		// Store our good, untouched-by-the-user data somewhere safe 
		this.answers = JSON.parse(JSON.stringify(words));

		var dataMap = words.reduce(function(map, node) {
			map[node.id] = node;
			return map;
		}, []);

		// Calculate root node, and append it to our datasets 
		var rid = 0;
		for (var i = 0; i < words.length; i++) {
			var node = words[i];
			if (dataMap[node.head] === undefined) {
				rid = node.head;
				var rootNode = { 'id': rid, 'value': 'root', 'pos': 'root', 'relation': '' };

				words.push(rootNode);
				dataMap[rid] = rootNode;

				break;
			}
		}

		// If creating, update all head attrs.
		if (this.config.mode == 'play') {
			Object.keys(dataMap).forEach(function(id) {
				if (dataMap[id].pos !== 'root')
					dataMap[id].head = rid; 
			});
			words.forEach(function(node) {
				if (node.pos !== 'root')
					node.head = rid;
			});
		}

		var treeData = [];
		words.forEach(function(node) {
			var head = dataMap[node.head];
			if (head)
				(head.children || (head.children = [])).push(node);
			else
				treeData.push(node);
		});

		return treeData;
	};

	/**
	 * Uses the fetched data to render the parse tree, considering user options
	 */
	daphne.prototype.render = function(e) {
			
		var that = this;

		// Add daphne class if needed, regardless clean out inner html
		if (this.el.className.indexOf('daphne') === -1) {
			this.el.className += ' daphne';
		}
		this.el.innerHTML = '';

		// Append sentence header 
		this.header = document.createElement('div');
		this.header.className = 'sentence';
		this.el.appendChild(this.header);

		// If in play mode, append points tracker
		if (this.config.mode == 'play') {
			this.tracker = document.createElement('div');
			this.tracker.className = 'tracker';
			var points = document.createElement('span');
			points.className = 'points wiggle';
			points.innerHTML = '0';
			var feedback = document.createElement('span');
			feedback.className = 'feedback';
			feedback.innerHTML = 'Make your move!';
			this.tracker.appendChild(points);
			this.tracker.appendChild(feedback);
			this.el.appendChild(this.tracker);

			this._delayAddClass(feedback, 'hidden', 3000);
			this._delayRemoveClass(points, 'wiggle', 3000);
		}

		// And the footer
		this.footer = document.createElement('div');
		this.footer.className = 'footer';
		this.el.appendChild(this.footer);

		// Put the sentence as a whole into the header
		for (var i = 0; i < this.answers.length; i++) {
			var span = document.createElement('span'), space = document.createTextNode(' ');
			span.innerHTML = this.answers[i].value;
			span.setAttribute('data-id', this.answers[i].id);
			this.header.appendChild(span);
			this.header.appendChild(space);
		}

		// To keep multiple instances from stomping on each other's data/d3 references
		this.tree = d3.layout.tree().nodeSize([100, 50]);

		this.tree.separation(function(a, b) {
			var w1 = (a.value.length > a.relation.length) ? a.value.length : a.relation.length;
			var w2 = (b.value.length > b.relation.length) ? b.value.length : b.relation.length;

			var  scale = 0.1;

			return ((w1 * scale) + (w2 * scale) / 2);
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
		this.canvas.append('g');
		this.canvas.attr('transform', 'translate(' + this.config.width / 2 + ', ' + this.config.marginTop  +') scale(0.9)'); 

		// Bind zoom behavior to zoom function
		d3.select(this.el.querySelector('svg'))
			.call(d3.behavior.zoom()
				.scaleExtent([0.5, 5])
				.on("zoom", this._zoom.bind(this)))
			.on('dblclick.zoom', null);

		this._addEvent(window, "resize", this._respond.bind(this));
		//setInterval(this._respond.bind(this), 3000);

		// And alas, the d3 update function
		this.root = this.data[0];
		this._update(this.root);
	};

	daphne.prototype._respond = function(e) {
		var that = this;
		var width = this.el.offsetWidth - 70;
		this.el.querySelector('svg').style.width = width + 'px';
		this.canvas.attr('transform', 'translate(' + width / 2 + ', ' + this.config.marginTop  +') scale(0.9)'); 
		this.config.width = this.el.offsetWidth;
	};

	/**
	 * Zooming and scaling function for the parse tree's canvas. Gets attached to the SVG object at end of render function.
	 */
	daphne.prototype._zoom = function() {
		this.config.width = this.el.offsetWidth;
		var scale = d3.event.scale,
			trans = d3.event.translate,
			tbound = -this.config.height * scale,
			bbound = this.config.height * scale,
			lbound = (-this.config.width + this.config.marginRight) * scale,
			rbound = (this.config.width + this.config.marginLeft) * scale;

		var translation = [
			Math.max(Math.min(trans[0], rbound), lbound),
			Math.max(Math.min(trans[1], bbound), tbound)
		];

		this.canvas.attr('transform', 'translate(' + translation + ') scale(' + scale + ')');
	};

	/**
	 * Update function is called every time the structure of the tree changes. It manages adjusting
	 * the positions of the nodes, their colors, displaying attirbutes and relations, etc.
	 * @param {object} source - the data used to construct the tree 
	 */
	daphne.prototype._update = function(source) {

		var that = this;

		var diagonal = d3.svg.diagonal().projection(function(d) {
			return [d.x, d.y];
		});

		var nodes = this.tree(this.root).reverse(),
			links = this.tree.links(nodes);

		// Adjust height in tree and in surrounding DOM elements
		var depth = 0;
		nodes.forEach(function(d) {
			depth = (d.depth > depth) ? d.depth : depth;
			d.y = d.depth * 100;
		});
		var height = (depth * 100) + 200 + 'px';
		this.el.style.maxHeight = height;
		this.el.querySelector('svg').style.height = height;

		var node = this.svg.select('.canvas g').selectAll('g.node')
			.data(nodes, function(d, i) {
				return d.id;
			});

		var nodeEnter = node.enter().append('g')
			.attr('class', 'node')
			.attr('transform', function(d) {
				return 'translate(' + source.x + ', ' + source.y + ')';
			});

		nodeEnter.append('circle')
			.attr('r', 10)
			.on('click', function(d, i) {
				that._clickNode(d, i, d3.select(this));
			})
			.on('dblclick', function(d, i) {
				that._viewNodeProperties(d, i, d3.select(this));
			})
			.style('stroke', function(d) {
				return that.color(d.pos);
			});

		// Value of the Node
		nodeEnter.append('text')
			.attr('y', function(d, i) {
				return (d.pos == 'root') ? -30 : 15;
			})
			.attr('dy', '14px')
			.attr('lang', function(d, i) {
				return that.config.lang;
			})
			.attr('text-anchor', 'middle')
			.text(function(d) {
				return d.value;
			})
			.style('fill', function(d, i) {
				return (d.pos == 'root') ? '#CCC' : '#333';
			});

		// Relation of Node to Parent
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
			.duration(this.config.duration)
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
				if (d3.select(this).classed('match'))
					return d3.rgb(that.color(d.pos)).brighter();
				else
					return '#FFF';
			});

		var link = this.svg.select('.canvas g').selectAll('path.link')
			.data(links, function(d) {
				return d.target.id;
			});

		link.enter().insert('path', 'g')
			.attr('class', 'link')
			.style('stroke', '#CCC')
			.style('stroke-width', '2px')
			.style('fill', 'none')
			.attr('d', function(d) {
				var o = { x: source.x, y: source.y };
				return diagonal({ source: o, target: o });
			});

		link.transition()
			.duration(this.config.duration)
			.attr('d', diagonal);

		nodes.forEach(function(d, i) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	};

	daphne.prototype._deselectNode = function(d, node) {
		node.classed({ 'selected': false });
		if (d.pos !== 'root')
			this.el.querySelector('span[data-id="' + d.id + '"]').className = '';
	};

	daphne.prototype._selectNode = function(d, node) {
		node.classed({ 'selected': true });
		if (d.pos !== 'root')
			this.el.querySelector('span[data-id="' + d.id + '"]').className = 'selected';
	};

	daphne.prototype._deselectAllNodes = function() {
		var nodes = [];
		this.svg.selectAll('circle').each(function(d, i) {
			nodes.push({ d: d, node: d3.select(this) });
		});

		setTimeout(function() {
			for (var i = 0; i < nodes.length; i++)
				this._deselectNode(nodes[i].d, nodes[i].node);
		}.bind(this), 500);
	};

	// TODO: Break down this click handler into much smaller parts...
	/**
	 * Click handler for a node. Decides whether to select, deselect, or move a node.
	 * @param {object} d - data of the clicked node
	 * @param {number} i - clicked node's index
	 * @param {object} node - reference to the d3 selection of the node
	 */
	daphne.prototype._clickNode = function(d, i, node) {

		// If the node was previously selected, then unselect it
		if (node.classed('selected')) {
			this._deselectNode(d, node);
			return;
		}

		// If the user has the footer open, pass along the data
		if (this.footer.classList.contains('open'))
			this._viewNodeProperties(d, i, node);

		this._selectNode(d, node);

		// Otherwise, check to see if it's time to update links
		var selected = [];
		this.svg.selectAll('circle').each(function(d, i) {
			if (d3.select(this).classed('selected')) selected.push(d); 
		});

		// If two nodes are selected, update links
		if (selected.length == 2) {
			var parent = d;
			var child = (parent.id != selected[0].id) ? selected[0] : selected[1];

			if (this._validMove(child, parent)) {

				// Add child to new parent, remove from former parent
				parent.children = this._insertChild(parent.children, child);
				child.parent.children = this._removeChild(child.parent.children, child);
				child.parent = parent;
				child.head = parent.id;

				// Update our tree
				this._update(parent);

				// If the user is playing, check the connection for a match
				if (this.config.mode == 'play') {

					var childNode = this.svg.selectAll('circle').filter(function(d, i) {
						return d.id == child.id;
					});

					var match = this._checkMatch(child, parent);
					childNode.classed({ 'match' : match });
					this._update(childNode);

					// Send an event attached to this.el, so we know a node is moved.
					this._sendSubmission(child, match);

					if (this._checkCompletion()) {
						// Send an event, so we know user has completed the tree.
						this._sendSubmission(child, match, true);
					}
				}

			}

			this._deselectAllNodes();
		}
	};

	daphne.prototype._sendSubmission = function(child, match, isComplete) {
		var eventType = isComplete ? 'completed' : 'submitted';
		var e;

		// If Custom event is available, we want this to trasmit data via event about what user has just done 
		if (window.CustomEvent) {
			// Eliminate d3's circular data structure
			var kid = _.clone(child);
			kid.parent = child.parent.id;
			kid.children = _.pluck(child.children, "id");

			var detail = {
				"detail": {
					"accuracy": (match ? 100 : 0),
					"task": "build_parse_tree",
					"response": kid
				}
			};
			if (child.CTS) {
				detail.detail.encounteredWords = [child.CTS];
			}
			e = new CustomEvent(eventType, detail);
		}
		else {
			e = document.createEvent(eventType);	
		}
		this.el.dispatchEvent(e);
	};

	/**
	 * Double click handler for a node. Allows users to edit its properties.
	 * @param {object} d - data of the clicked node
	 * @param {number} i - clicked node's index
	 * @param {object} node - reference to the d3 selection of the node
	 */
	daphne.prototype._viewNodeProperties = function(d, i, node) {
		if (this.footer.querySelector('form') == null) 
			this._renderForm();

		// Populate the fields on data which correspond to config. Others, blank. 
		var fields = this.config.config.fields;

		for (var i = 0; i < fields.length; i++) {
			var el = this.footer.querySelector('[name="' + fields[i].name + '"]');
			var value = (d.hasOwnProperty(fields[i].name)) ? d[fields[i].name] : "";

			switch (el.tagName) {
				default:
					el.value = value;
					break;
			}
		}

		// Data's in place, so display the form
		this.footer.className = 'footer open';
		this.el.querySelector('.form-footer').style.display = 'block';
		this._showFields();
	};

	daphne.prototype._hideNodeProperties = function(e) {
		if (e) e.preventDefault();
		this.footer.className = 'footer';
		this.el.querySelector('.form-footer').style.display = 'none';
	};

	/**
	 * Grarly function for rendering the form. 
	 */
	daphne.prototype._renderForm = function() {

		var form = document.createElement('form');
		var fields = this.config.config.fields;

		// Use their config file to append appropriate fields
		for (var i = 0; i < fields.length; i++) {
			var div = document.createElement('div');
			div.setAttribute('data-name', fields[i].name);

			var label = document.createElement('label');
			label.innerHTML = fields[i].label;
			label.setAttribute('for', fields[i].name);
			div.appendChild(label);

			var el;
			switch (fields[i].type) {
				case 'text':
					el = document.createElement('input');
					el.type = 'text';
					break;
				case 'select':
					el = document.createElement('select'); 
					var opt = document.createElement('option');
					opt.innerHTML = 'Select ' + fields[i].label;
					opt.value = "";
					el.appendChild(opt);
					break;
				default:
					el = document.createElement(fields[i].type);
			}

			el.name = fields[i].name;

			if (fields[i].name == 'pos')
				el.onchange = this._showFields.bind(this);

			// The dreaded nested for-loop, for appending select options
			for (var key in fields[i].options) {
				if (fields[i].options.hasOwnProperty(key)) {
					var opt = document.createElement('option');
					opt.innerHTML = fields[i].options[key];
					opt.value = key;
					el.appendChild(opt);
				}
			}

			div.appendChild(el);
			form.appendChild(div);
		}
		var formFooter = document.createElement('div');
		formFooter.className = 'form-footer';

		var submitBtn = document.createElement('a');
		submitBtn.href = '#';
		submitBtn.className = 'save-link';
		submitBtn.appendChild(document.createTextNode('Save Word'));

		var cancelBtn = document.createElement('a');
		cancelBtn.href = '#';
		cancelBtn.className = 'cancel-link';
		cancelBtn.appendChild(document.createTextNode('Cancel'));
		cancelBtn.onclick = this._hideNodeProperties.bind(this);

		formFooter.appendChild(cancelBtn);
		formFooter.appendChild(submitBtn);
		this.footer.appendChild(form);
		this.el.appendChild(formFooter);
	};

	daphne.prototype._showFields = function() {
		var form = this.footer.querySelector('form'),
			el = form.querySelector('select[name="pos"]'),
			pos = el.options[el.selectedIndex].value,
			els = form.querySelectorAll('[data-name]');

		// Create quick lookup object to retrieve fields by name attr
		var lookup = {}, fields = this.config.config.fields;
		for (var i = 0, len = fields.length; i < len; i++)
			lookup[fields[i].name] = fields[i];

		// Display only the fields appropriate based on conf file
		for (var i = 0; i < els.length; i++) {
			var name = els[i].getAttribute('data-name');
			if (lookup[name].exclude && lookup[name].exclude.indexOf(pos) !== -1) {
				els[i].className = 'hidden';
				continue;
			}
			if (lookup[name].include && lookup[name].include.indexOf(pos) !== -1) {
				els[i].className = 'shown';
				continue;
			}
			if (lookup[name].include && lookup[name].include.indexOf(pos) === -1) {
				els[i].className = 'hidden';
				continue;
			}
			
			els[i].className = 'shown';
		}
	};

	daphne.prototype._editNode = function() {

	};

	/**
	 * Determine whether the move they're trying to make is valid.
	 * @param {object} child - node that will move.
	 * @param {object} parent - node to become the parent of child node.
	 */
	daphne.prototype._validMove = function(child, parent) {
		
		if (parent.id === child.parent.id) {
			console.log("Child is already assigned to this parent.");
			return false;
		}
		else if (child.pos === 'root') {
			console.log("Cannot move root.");
			return false;
		}
		else if (this._isAncestor(child, parent.id)) {
			console.log("Cannot make an ancestor the child of one of its descendants.");
			return false;
		}
		
		console.log("Valid Move");
		return true;
	};

	/**
	 * Get current max depth of tree to calculate height
	 */ 
	daphne.prototype._getMaxDepth = function(child, depth) {

		var children = child.children;
		if (children) {
			for (var i = 0, len = children.length; i < len; i++) {
				if (depth > children[i].depth)
					return depth;
				else
					return this._getMaxDepth(children[i], depth);
			}
		}
	};

	/**
	 * In the parse tree, an ancestor cannot become the child of one of its descendants. 
	 * @param {object} child - the node that will move, so long as it's not an ancestor of its new parent.
	 * @param {object} parentId - the ID of the node that we want to ensure is not actually a descendant.
	 */
	daphne.prototype._isAncestor = function(child, parentId) {

		var children = child.children;
		if (children) {
			for (var i = 0, len = children.length; i < len; i++) {
				if (children[i].id == parentId)
					return true;
				else if (this._isAncestor(children[i], parentId))
					return true;
			}
		}

		return false;
	};

	/**
	 * Helper function for _clickNode -- splices a child node into an existing array of children at
	 * correct index based on sentence order.
	 * @param {array} children - children of the node.
	 * @param {object} child - child to insert into array of children.
	 */
	daphne.prototype._insertChild = function(children, child) {
		
		if (!children)
			children = [];

		var i = 0;
		for (i; i < children.length; i++) {
			if (children[i].id > child.id)
				break;
		}

		children.splice(i, 0, child);

		return children;
	};

	/**
	 * Helper function for _clickNode -- removes a child node from its parents list of children. 
	 * @param {array} children - children of the node.
	 * @param {object} child - child to insert into array of children.
	 */
	daphne.prototype._removeChild = function(children, child) {

		var i = 0;
		for (i; i < children.length; i++) {
			if (children[i].id == child.id)
				break;
		}
		children.splice(i, 1);
		return children;
	};

	/**
	 * Helper function for _clickNode -- Determine whether the child has been appended to the 
	 * gold-standard parent.
	 * @param {object} child - the child node to check.
	 * @param {object} parent - the parent to check.
	 */
	daphne.prototype._checkMatch = function(child, parent) {

		if (!this.answers) {
			console.log("Cannot check connection without data to check against.");
			return false;
		}

		var correct;

		for (var i = 0; i < this.answers.length; i++) {
			if (child.id == this.answers[i].id) {
				correct = (parent.id === this.answers[i].head);
				break;
			}
		}

		this._updateScore(child, correct, false);

		return correct;
	};

	/**
	 * Helper function for _clickNode -- Checks whether the tree is complete based on stored 
	 * answers. Then triggers tree to update, so the unmoved but correct nodes can be marked.
	 */
	daphne.prototype._checkCompletion = function() {
		var complete = true, that = this, rootChildren = [], updateNodes = [];

		var answerMap = this.answers.reduce(function(m, node) {
			m[node.id] = node;
			return m;
		}, []);

		this.svg.selectAll('circle').each(function(d, i) {

			// Don't check the root
			if (d.pos === 'root')
				return;
			
			// Monitor tree completion
			if (d.parent.id == answerMap[d.id].head)
				complete = complete ? true : false;
			else
				complete = false;

			// If the node is a child of root, we have to count it is as correct without
			// requiring the user to move the node
			if (d.parent.id == that.root.id) {
				rootChildren.push(this);
				updateNodes.push(d);
			}
		});

		if (complete) {
			for (var i = 0; i < rootChildren.length; i++) {
				d3.select(rootChildren[i]).classed({ 'match': true });
				this._update(updateNodes[i]);
				this._updateScore(updateNodes[i], true, true);
			}
		}

		return complete;
	};

	daphne.prototype._updateScore = function(d, correct, complete) {
		
		if (this.correct === undefined)
			this.correct = [];

		var points = this.tracker.querySelector('.points');
		var feedback = this.tracker.querySelector('.feedback');

		var successMsgs = ['Super', 'Spot on'];
		var errorMsgs = ['Not quite', 'Try again'];

		// Earned a point
		if (correct && this.correct.indexOf(d) === -1) {
			this.correct.push(d);
			points.innerHTML = parseInt(points.innerHTML) + 1;

			if (complete)
				feedback.innerHTML = 'Complete!!';
			else
				feedback.innerHTML = 'Super!';

			this._delayAddClass(points, 'success bounce', 0);
			this._delayRemoveClass(points, 'success bounce', 3000);

		}
		// Lost a previously earned point
		else if (!correct && this.correct.indexOf(d) !== -1) {
			points.innerHTML = parseInt(points.innerHTML) - 1;
			var i = this.correct.indexOf(d);
			this.correct.splice(i, 1);

			feedback.innerHTML = 'You might want to put that back.';	
			this._delayAddClass(points, 'error wiggle', 0);
			this._delayRemoveClass(points, 'error wiggle', 3000);
		}
		// Answer is wrong altogether
		else {
			feedback.innerHTML = 'Try again!';	
			this._delayAddClass(points, 'error wiggle', 0);
			this._delayRemoveClass(points, 'error wiggle', 3000);
		}

		this._delayRemoveClass(feedback, 'hidden', 0);
		this._delayAddClass(feedback, 'hidden', 3000);

	};

	// ------------------------- //
	// Utility Functions         //
	// ------------------------- //

	daphne.prototype._extend = function(out) {
		out = out || {};

		for (var i = 1; i < arguments.length; i++) {
			if (!arguments[i])
				continue;

			for (var key in arguments[i]) {
				if (arguments[i].hasOwnProperty(key))
					out[key] = arguments[i][key];
			}
		}

		return out;
	};

	daphne.prototype._delayAddClass = function(el, className, waitTime) {
		setTimeout(function() {
			if (el.className.indexOf(className) === -1)
				el.className += ' ' + className;

		}, waitTime);
	};
	daphne.prototype._delayRemoveClass = function(el, className, waitTime) {
		setTimeout(function() {
			if (className.indexOf(" ") === -1)
				el.removeClass(className); 
			else {
				var classes = className.split(" ");
				for (var i = 0; i < classes.length; i++) 
					el.removeClass(classes[i]);
			}
		}, waitTime);
	};

	daphne.prototype._addEvent = function(el, type, handler) {
		if (el === null || typeof(el) === 'undefined') 
			return;

		if (el.addEventListener)
			el.addEventListener(type, handler, false);
		else if (el.attachEvent)
			el.attachEvent('on' + type, handler);
		else
			el['on' + type] = handler;
	};

	if (!HTMLElement.prototype.removeClass) {
		HTMLElement.prototype.removeClass = function(remove) {
			var newList = '';
			var classes = this.className.split(" ");
			for (var i = 0; i < classes.length; i++) {
				if (classes[i] !== remove)
					newList += classes[i] + " ";
			}
			this.className = newList.trim();
		};
	}

	if (!Function.prototype.bind) {
		Function.prototype.bind = function (oThis) {
			if (typeof this !== "function") {
				throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
			}

			var aArgs = Array.prototype.slice.call(arguments, 1), 
				FToBind = this, 
				FNOP = function () {},
				FBound = function () {
					return FToBind.apply(this instanceof FNOP && oThis ? this : oThis,
						aArgs.concat(Array.prototype.slice.call(arguments)));
				};

			FNOP.prototype = this.prototype;
			FBound.prototype = new FNOP();

			return FBound;
		};
	}

	(function () {
		function CustomEvent ( event, params ) {
			params = params || { bubbles: false, cancelable: false, detail: undefined };
			var evt = document.createEvent( 'CustomEvent' );
			evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
			return evt;
		};

		CustomEvent.prototype = window.Event.prototype;

		window.CustomEvent = CustomEvent;
	})();

	return daphne;

});
