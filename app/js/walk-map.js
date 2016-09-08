  /* 
  Icons from https://design.google.com/icons/

  TODOS:

  - Add in walkspeed / time estimate
  - Add paragraph to bottom explaining time estimate

  Possible extras:
  - toggles for each establishment type?
  - Address to coordinate functionality (geocode?, autocomplete?) See: http://rjshade.com/projects/gmaps-autocomplete/
  - Add label layer
  - Legend/toggles for each establishment type
  - Add popups for selecting individual names?
  - Add city limits? MSU boundary?
  - Fine-tune animation on zoom? (use listeners to set line creation to happen after zoom movement?)
  
  Data quirks:
  - Currently missing anything out near Four Corners. How to get this (other than Googling?)
  */
  

  // VARS
  // var INITIAL_TARGET_POINT = [45.7, -111.0] // lat-lng
  var INITIAL_TARGET_POINT = null;
  var MAP_DEFAULT = {
    center: [45.68,-111.06],
    zoom: 13
  };
  var WALK_SPEED = 3.1; // miles / hour

  // GLOBAL MAP OBJECTS
  var map = new L.map('map', {
   center: MAP_DEFAULT.center,
   zoom: MAP_DEFAULT.zoom,
   attributionControl: false,
   minZoom: 12,
   maxZoom: 15, 
   scrollWheelZoom: false,
   maxBounds: [[45.751,-110.866],[45.607,-111.253]]   
  });
  var baseLayer = new L.StamenTileLayer("terrain-lines");
  var labelLayer = new L.StamenTileLayer("toner-labels");
  
  var infoBox = d3.select('#info');
  
  var scale = L.control.scale({
    metric: false
  });

  var buttons = [
    {name: 'Southside', className: 'place-icon home', onClick: function() {moveTargetMarker([45.6733686, -111.0415]); } },
    {name: 'Westside', className: 'place-icon home', onClick: function() {moveTargetMarker([45.688698, -111.086413]); }},
    {name: 'Reset', className: null, onClick: resetMap},
  ];

  var legend = [
    {key: 'coffee shop', className: 'place-icon coffee', label: 'Coffee shop', text: 'Coffee shops, ice cream shops and bakeries'},
    {key: 'restaurant', className: 'place-icon restaurant', label: 'Restaurant', text: 'Restaurants, bars and breweries'},
    {key: 'grocery store', className: 'place-icon grocery', label: 'Grocery', text: 'Grocery stores, excluding convenience stores'},
    {key: 'park', className: 'place-icon park', label: 'Park', text: 'Larger public parks'},
    {key: 'school', className: 'place-icon school', label: 'School', text: 'Public elementary schools'},
    ];

  var walkTimeExplanation = "Walk times calculated for distances as the crow flies, assume a " + WALK_SPEED + " mph walking speed.";

  var formatMiles = d3.format('.1f');
  var formatMin = d3.format('.0f');

  // State objects
  var targetPointAcquired = false;
  var resultsToDisplay = false;
  var info = null; // could rename to results, perhaps redundant

  // LAYERS 
  var sourcePointsLayer = new L.geoJson(null, {
      pointToLayer: function(feature, latlng) {
        return L.marker(latlng, {icon: iconSort(feature.properties.type)
        });
      }
    });

  var connectionLinesLayer = L.featureGroup();
  var targetPointLayer = L.featureGroup();

  var targetPoint = L.marker(INITIAL_TARGET_POINT, {
    icon: L.divIcon({
      iconSize: [20,20],
      className: 'place-icon home'
    }),
    zIndexOffset: 1000
  });

  // TODO: iconSort & lineStyle functions have redundant switch statement - could consolidate
  function iconSort(type){
    options = {iconSize: [14,14], className: 'place-icon'}
    switch(type){
      case 'restaurant':
        options.className += ' restaurant';
        break;
      case 'coffee shop':
        options.className += ' coffee';
        break;
      case 'grocery store':
        options.className += ' grocery';
        break;
      case 'park':
        options.className += ' park';
        break;
      case 'school':
        options.className += ' school';
        break;
      default:
        console.log("error w/ icon for type ", type);
        return null;
    }

    return L.divIcon(options);
  }

  function lineStyle(type){
    options = {
      clickable: false,
      className: 'conn-line'
    };
    switch(type){
      case 'restaurant':
        options.className += ' restaurant';
        break;
      case 'coffee shop':
        options.className += ' coffee';
        break;
      case 'grocery store':
        options.className += ' grocery';
        break;
      case 'park':
        options.className += ' park';
        break;
      case 'school':
        options.className += ' school';
        break;
      default:
        console.log("error w/ icon for type ", type);
        return null;
    }
    return options;
  }

  // FUNCTION CALLS
  initializeMap();

  // FUNCTIONS
  function initializeMap(){
    // Things to do when map is first loaded
    
    map.addLayer(baseLayer);
    sourcePointsLayer.addTo(map);
    map.addLayer(labelLayer);
    scale.addTo(map);
    // Adjust scale bar opacity (hacky)
    d3.select('.leaflet-control-scale-line')
      .style("background","rgba(255,255,255,0.8)");

    addButtonBar();
    renderInfoBox();

    d3.json("data/all-bzn-places.geojson", function(data){
      sourcePointsLayer.addData(data);
      targetPointLayer.addTo(map);
      renderMap();
      map.on('click', handleMapClick);
    });
  }

  function renderMap(){
    // Things to do every time map is updated
    targetPointLayer.clearLayers();
    connectionLinesLayer.clearLayers();

    // Draw connections if targetPoint has a value
    if (targetPointAcquired){
      drawConnections(sourcePointsLayer, targetPointLayer);
      targetPoint.addTo(targetPointLayer);
    }
  }

  function addButtonBar(){
    var button = d3.select('#button-container')
      .append("div")
        .attr("class", "btn-group")
        .attr("role","group")
        .selectAll("button")
          .data(buttons).enter()
          .append("button")
          .attr("type", "button")
          .attr("name", function(d){ return d.name; })
          .attr("class", "btn btn-default")
          .text(function(d){ return d.name; })
          .on("click", function(d){ d.onClick(); })
          .append('span')
            .attr("class", function(d){ return d.className; })
            .attr("style", "border: none; margin-left: 3px; box-shadow: none;");

  }

  function renderInfoBox(){

    infoBox.selectAll('*').remove();
    
    if (info === null) {
      infoBox.append('h4')
        .text("Legend");
      var legendLine = infoBox.selectAll('div')
        .data(legend).enter()
        .append('p')
        .attr("class",'info-box-lines');
      legendLine
        .append('span')
        .style("margin-right", "10px")
        .attr("class", function(d){ return d.className; });
      legendLine
        .append('span')
        .html(function(d){
          return d.text;
        }); 
    } else {

      // Append info from legend to info
      info.forEach(function(d){
        var legendEntry = legend.filter(function(legendItem){
          return legendItem.key === d.type;
        });
        legendEntry = legendEntry[0]; // Hopefully there's only one match

        d.className = legendEntry.className;
        d.label = legendEntry.label;
      });

      infoBox.append('h4')
        .text("What's closest:");
      var resultsLine = infoBox.selectAll('div')
        .data(info).enter()
        .append('p')
        .attr("class",'info-box-lines');
      resultsLine
        .append('span')
        .style("margin-right", "10px")
        .attr("class", function(d){ return d.className; });
      resultsLine
        .append('span')
        .html(function(d){
          var name = "<strong>" + d.name + "</strong>, ";
          var distance = formatMiles(d.distance) + " miles ";
          var time = "(~" + formatMin(d.distance / WALK_SPEED * 60) + " min)"
          return  name + distance + time;
        });
      infoBox.append('p')
        .text(walkTimeExplanation);
    }
  }

  function drawConnections(sourcePointsLayer, destPointLayer){

    connections = calcConnections(sourcePointsLayer, destPointLayer);

    // nest by establishment type
    connections = d3.nest()
      .key(function(d){ return d.type; })
      .entries(connections);

    // sort ascending by distance, filter to closest
    var limits = {
      'coffee shop': 1,
      'restaurant': 2,
      'grocery store': 1,
      'park': 1,
      'school': 1
    }; // How many of each category to include
    function get_closest(connections){
      connections.forEach(function(d){
        var includeNum = limits[d.key];
        sorted = d.values.sort(function(a,b){
          // sort ascending by distance
          return a.distance - b.distance;
        });
        d.values = sorted.slice(0,includeNum);
      });
      return connections;
    }
    connections = get_closest(connections);

    // Populate info box array
    info = [];
    connections.forEach(function(d){
      d.values.forEach(function(conn){
        infoLine = {};
        infoLine.type = d.key;
        infoLine.name = conn.name;
        infoLine.distance = conn.distance;
        info.push(infoLine);
      });
    });

    // Zoom to points
    var boundPoints = [L.latLng(targetPoint.getLatLng())];
    connections.forEach(function(d){
      d.values.forEach(function(conn){
        boundPoints.push(conn.sourcePoint);
      });
    });
    map.fitBounds(L.latLngBounds(boundPoints));

    // Plot connection lines for each establishment type    
    connections.forEach(function(d) {
      d.values.forEach(function(conn){
        var pointArray = [conn.sourcePoint, conn.targetPoint];
        L.polyline(pointArray, lineStyle(d.key)).addTo(connectionLinesLayer);
      });
      connectionLinesLayer.addTo(map);      
    });
  }
  function calcConnections(sourcePointsLayer, destPointLayer){
    // Calculates all connections from multiple source points to a single destination point
    var M_PER_MI = 1609.34;

    fromPoints = sourcePointsLayer.toGeoJSON();
    toPoint = destPointLayer.toGeoJSON();

    toLatLng = targetPoint.getLatLng();

    var connections = [];

    fromPoints.features.forEach(function(feature){
      conn = {};
      conn.sourcePoint = new L.latLng(flip(feature.geometry.coordinates));
      conn.targetPoint = toLatLng;
      conn.distance = conn.sourcePoint.distanceTo(toLatLng) / M_PER_MI;
      conn.name = feature.properties.name;
      conn.type = feature.properties.type;
      connections.push(conn);
    });

    return connections;
  }
  
  // Map movement functions

  function handleMapClick(e){
    moveTargetMarker(e.latlng);
  }
  function moveTargetMarker(latlng){
    targetPointAcquired = true;
    targetPoint.setLatLng(latlng);
    renderMap();
    renderInfoBox();
  }

  function resetMap(){
    map.setView(MAP_DEFAULT.center, MAP_DEFAULT.zoom);
    info = null;
    targetPointAcquired = false;
    resultsToDisplay = false;
    
    // targetPointLayer.clearLayers();
    renderMap();
    renderInfoBox();
  }

  
  // Utility functions

  function flip(xy_array){
    // Swaps 0 and 1 coordinate to get from xy to lat-long coords
    return [xy_array[1], xy_array[0]];
  }