daphnejs
======

Library for creating, editing, and checking parse trees in d3.

## /demo

This folder contains all you need to see Daphne working, and provides a sample of how to use Daphne in a RequireJS (or other such AMD) environment. It's crazy easy with RequireJS:

In `main.js`:
```javascript
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

    new Daphne('div', { mode: 'edit' });

});
```

Add to your `<head>`:
```html
<script data-main="main" src="//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.11/require.min.js"></script>
```

You can pass your options into the constructor, or simply include them as `data-` attributes on the DOM element.

```
<div data-toggle="daphne" data-source="data.json" data-mode="edit"></div>
```
