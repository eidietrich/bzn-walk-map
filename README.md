# Leaflet Bozeman walkability map

Interactive visualizing the distances to restaurants, stores, etc. in different parts of Bozeman.

Built on a repository template for d3.js data visulization projects, using gulp for workflow automation.

## TODOS:

- Usability testing from github.io
- Seems like Leaflet zoom is hanging on my iPhone 6 (otherwise, things run pretty smoothly). Or are icons are taking too long to load?
- See to-dos in walk-map.js
- Refactor for elegance before I forget how the code is put together

## Components
(in app/ directory, development folder)

- index.html
- js/walk-map.js - Primary JS file
- js/d3-(several) - Portions of d3 4.0 library 
- js/leaflet.js - mapping library
- css/viz-style.css - Map styling
- css/bootstrap.css - Used for buttons / text
- css/leaflet.css - CSS for Leaflet
- css/leaflet-override.css - Hacky place for overriding Leaflet CSS I wanted to change
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