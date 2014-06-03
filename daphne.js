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

	// Defaults
	var defaults = {
		'mode': 'edit'
	};

	// Plugin Methods + Shared Properties
	Daphne.prototype = {

		init: function() {
			this.config = $.extend({}, this.defaults, this.options);

			console.log("Initialize");

			return this;
		},
	};

	$.fn.daphne = function(options) {
		return this.each(function() {
			new Daphne(this, options).init();
		});
	};

	$.fn.daphne.defaults = defaults;
	$.fn.daphne.Daphne = Daphne;

	window.Daphne = Daphne;

});
