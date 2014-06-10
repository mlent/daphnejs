daphne
======

jQuery plugin for creating, editing, and checking parse trees in d3.

# /demo

This folder contains all you need to see Daphne working, and provides a sample of how to use Daphne in a RequireJS (or other such AMD) environment. It's crazy easy with RequireJS:

In `main.js`:
```javascript
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
```

Add to your `<head>`:
```html
<script data-main="main" src="//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.11/require.min.js"></script>
```

And anywhere you want a parse tree to appear, simply add `data-toggle="daphne"` and specify the config parameters as you please:

```
<div data-toggle="daphne" data-source="data.json" data-mode="edit"></div>
```

*Note that Daphne expects to have access to `d3` as a global variable. If you use Daphne outside of an AMD environment, you will need to ensure that d3 loads before Daphne does.*
