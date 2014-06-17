daphnejs
======

Library for creating, editing, and checking parse trees. Its only dependency is d3.

## Installation
Installation via npm is only necessary if you'd like to be able to run tests. Otherwise, you can jump down to **Example Usage**. 

```
npm install
npm install phantomjs grunt-cli -g
bower install
```

## Running Tests
Daphne uses Mocha as its testing framework. From the project root:
```
grunt test
```

# Example Usage

The demo folder contains all you need to see daphne working, and provides a sample of how to use daphne in a RequireJS (or other such AMD) environment. For example, with RequireJS:

In `main.js`:
```javascript
requirejs.config({
    'baseUrl': '../',
    'paths': {
        'd3': '//cdnjs.cloudflare.com/ajax/libs/d3/3.4.8/d3.min',
        'daphne': 'dist/daphne.min'
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

	// Pass in query selector as first argument and options thereafter
    new Daphne('div', { mode: 'edit' })
});
```

Add to your `<head>`:
```html
<link rel="stylesheet" href="../dist/daphne.css" type="text/css">
<script data-main="main" src="//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.11/require.min.js"></script>
```
