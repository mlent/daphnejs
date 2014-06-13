daphnejs
======

Library for creating, editing, and checking parse trees in d3.

## Installation
Installation via npm is only necessary if you'd like to be able to run tests against Daphne. Otherwise, you can jump down to **Example Usage**. 

```
npm install
```

## Running Tests
Daphne uses Mocha as its testing framework. From the home directory:
```
make test
```

# Example Usage

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

	// .init() only temporarily required
    new Daphne('div', { mode: 'edit' }).init();

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

