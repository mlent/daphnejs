// Make our plugin AMD comptaible: https://github.com/umdjs/umd
!function(root, factory) {

	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	}
	else {
		factory(jQuery);
	}

}(this, function($) {
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
			'source': 'data.json' 	// For testing purposes, will be removed
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

			var dataMap = words.reduce(function(map, node) {
				map[node.id] = node;
				return map;
			}, {});

			var treeData = [];
			words.forEach(function(node) {
				var head = dataMap[node.head];
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
			console.log(this.data);
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
