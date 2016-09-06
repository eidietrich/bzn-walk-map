# Leaflet Bozeman walkability map

Interactive visualizing the distances to restaurants, stores, etc. in different parts of Bozeman.

Built on a repository template for d3.js data visulization projects, using gulp.

## Components
(in app/ directory, development folder)

- index.html
- js/walk-map.js - Primary JS file
- js/d3.min.js - standard v3 d3.js library (used for DOM management)
- js/leaflet.js - mapping library
- js/jquery-3.1.0.min.js - Used for AJAX call
- css/viz-style.css - Map styling
- css/bootstrap.css - Used for buttons / text
- css/leaflet.css - CSS for Leafle
- data/all-bzn-places.geojson - Data for map

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
Calls gulp default function. Currently starts a development server and calls an automatic referesh on changes.

### Building distribution files with minified js, etc.

```
$ gulp build
```
Builds contents of app/ into dist/, concatenating and minifying js and css into a single file.

(This is having trouble with the Stamen tiles extension to Leaflet.js. Abandoning build portion of this for the time being...)