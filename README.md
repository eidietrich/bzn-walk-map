# D3 project template

Repository template for d3.js data visulization projects, using gulp.

## Template components
(in app/ directory, intended folder for development)

- index.html - base html template, with inline script calling external data file and creating an instance of a Chart class. Chart is configured with inline-defined config object.
- js/d3-chart.js - template for a d3 multi-series line chart class, Chart.
- js/d3.min.js - standard v3 d3.js library.
- data/dummy-data.json - dummy data set
- css/viz-style.css - basic chart styling

node_modules directory contains modules for Gulp operation

## Gulp command reference

Assumes [Gulp](http://gulpjs.com/) command line interface is installed locally
```
$ npm install --global gulp-cli
```

### Spinning up development server:
```
$ gulp
```
Calls gulp default function. Currently starts a development server and calls an automatic referesh on changes to .html, .css, .js or data files.

### Building distribution files with minified js, etc.

```
$ gulp build
```
Builds contents of app/ into dist/, concatenating and minifying js and css into a single file.

## TODO

- Clean up CSS
- Work on abstracting chart template
- Figure out how to incorporate D3.js v 4.0 into this.