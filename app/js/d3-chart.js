/* 
D3 chart template

Hat tip to http://ejb.github.io/2016/05/23/a-better-way-to-structure-d3-code.html for design pattern.

*/

var Chart = function(opts) {
  this.data = opts.data;
  this.element = opts.element;
  this.config = opts.config;
  this.layout = opts.layout;

  this.draw();

  // redraw on window resize
  var that = this;
  d3.select(window).on('resize', function(){
    that.draw();
  });
};
Chart.prototype.draw = function(){
  this.configLayout();

  // Clear viz element
  this.element.innerHTML = '';

  // append the svg canvas to the page
  this.svg = d3.select(this.element).append("svg")
    .attr("width", this.width)
    .attr("height", this.height);

  this.plot = this.svg.append('g')
    .attr("transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")");
  
  this.createScales();
  this.addGrid();
  this.plotLines(this.data);
  this.addAxes();
};
Chart.prototype.configLayout = function(){
  this.width = this.element.offsetWidth;

  this.drawMode = this.width > this.layout.mobileBreak ? 'desktop' : 'mobile';
  var layoutConfig = this.layout[this.drawMode];

  this.height = this.width * layoutConfig.aspect;
  this.margin = layoutConfig.margins;
  this.nodeWidth = layoutConfig.nodeWidth;
  this.nodePadding = layoutConfig.nodePadding;

  this.plotWidth = this.width - this.margin.left - this.margin.right;
  this.plotHeight = this.height - this.margin.top - this.margin.bottom;
};
Chart.prototype.createScales = function(){
  var xExtent = d3.extent(this.data[0].values, function(d) { return d.date; });

  // Set y-scale extent to config values if provided, or default to yRange
  if (this.config.yMin !== undefined) {
    var yMin = this.config.yMin;
  } else {
    var yMin = d3.min(this.data, function(c) { 
      return d3.min(c.values, function(v) { 
        return v.yVal; }); });
  }
  if (this.config.yMax !== undefined) {
    var yMax = this.config.yMax;
  } else {
    var yMax = d3.max(this.data, function(c) { 
    return d3.max(c.values, function(v) {
      return v.yVal; }); });
  }
  var yExtent = [yMin, yMax];
  
  this.xScale = d3.time.scale()
    .domain(xExtent)
    .range([0, this.plotWidth]);

  this.yScale = d3.scale.linear()
    .domain(yExtent)
    .range([this.plotHeight, 0]);
};
Chart.prototype.addGrid = function(){
  this.yGrid = d3.svg.axis()
    .scale(this.yScale)
    .orient("left")
    .tickSize(-this.plotWidth, 0, 0)
    .tickFormat("");

  // Draw horizontal gridlines
  this.plot.append("g")
    .attr("class", "y grid")
    .call(this.yGrid);
};
Chart.prototype.plotLines = function(plotData) {
  var that = this;
  var line = d3.svg.line()
    .interpolate("linear")
    .x(function(d) { return that.xScale(d.date); })
    .y(function(d) { return that.yScale(d.yVal); });

  var series = this.plot.selectAll(".series")
    .data(this.data).enter()
    .append("g")
    .attr("class", "series");

  series.append("path")
    .attr("class", "line")
    .attr("d", function(d) { return line(d.values); })
    .style("stroke", function(d) { return d.color; });

  series.append("text")
    .datum(function(d) { return {name: d.name, color: d.color, labelOffset: d.labelOffset, value: d.values[d.values.length - 1]}; })
    .attr("transform", function(d) { return translation(that.xScale(d.value.date), that.yScale(d.value.yVal)); })
    .attr("x", 3)
    .attr("dy", function(d) { return d.labelOffset; })
    .attr("fill", function(d) { return d.color; })
    .attr("class", "label-text")
    // .attr("fill", function(d) { return "#111"; })
    .text(function(d) { return d.name; });
};
Chart.prototype.addAxes = function(){
  this.xAxis = d3.svg.axis()
    .scale(this.xScale)
    .orient("bottom")
    .ticks(this.drawMode === 'mobile' ? 5 : 10);

  this.yAxis = d3.svg.axis()
    .scale(this.yScale)
    .orient("left")
    .tickFormat(d3.format('$,'));

  // Draw axes
  this.plot.append("g")
    .attr("class", "x axis")
    .attr("transform", translation(0, this.plotHeight))
    .call(this.xAxis);

  this.plot.append("g")
    .attr("class", "y axis")
    .call(this.yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("x", -4)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(this.config.ylabel);
};

// Utility functions
function translation(x,y) {
  return 'translate(' + x + ',' + y + ')';
}
