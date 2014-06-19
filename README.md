daphnejs
======
Library for creating, editing, and checking parse trees. 

**Currently in development mode, and subject to constant breaking changes.**

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


    var words = [ 
        { id: 1, head: 3, relation: "OBJ", value: "ταῦτα" },
        { id: 2, head: 3, relation: "AuxY", value: "γὰρ" },
        { id: 3, head: 0, relation: "PRED", value: "εἶχον", },
        { id: 4, head: 3, relation: "SBJ", value: "Ἀθηναῖοι" },
        { id: 5, head: 1, relation: "ATR", value: "Πελοποννησίων" },
        { id: 6, head: 0, relation: "AuxK", value: "." }
    ];
    
    // Pass in query selector as first argument and options thereafter
    new Daphne('div[data-toggle="daphne"]', { 
        mode: 'play', 
        data: words, 
        width: 500, 
        height: 400, 
        initialScale: 0.8 
    });
    
});
```

Add to your `<head>`:
```html
<link rel="stylesheet" href="../dist/daphne.css" type="text/css">
<script data-main="main" src="//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.11/require.min.js"></script>
```

And to `<body>`:
```html
<div data-toggle="daphne"></div>
```
