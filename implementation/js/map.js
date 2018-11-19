/*
 * MapVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data				-- the actual data
 * @param _worldData              -- the map data
 */

MapVis = function(_parentElement, _data, _worldData ){
    this.parentElement = _parentElement;
    this.data = _data;
    this.worldData = _worldData;

    this.initVis();
};

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

MapVis.prototype.initVis = function() {
    var vis = this;

    console.log(vis.worldData);

    vis.margin = { top: 0, right: 0, bottom: 0, left: 0 };

    vis.width = 1000 - vis.margin.left - vis.margin.right;
    vis.height = 600 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height);

    // vis.path = d3.geoPath();
    //
    // vis.svg.selectAll("path")
    //     .data(topojson.feature(vis.worldData, vis.worldData.objects.states).features)
    //     .enter().append("path")
    //     .attr("d", vis.path);
    //
    // vis.svg.append("path")
    //     .attr("class", "state-borders")
    //     .attr("d", vis.path(topojson.mesh(vis.worldData, vis.worldData.objects.states, function(a, b) { return a !== b; })));


    vis.projection = d3.geoMercator()
        .translate([vis.width/2, vis.height/2])
        .center([0, 20])
        .scale(150);

    vis.path = d3.geoPath()
        .projection(vis.projection);

    vis.us = topojson.feature(vis.worldData, vis.worldData.objects.states).features;
    vis.svg.selectAll("path")
        .data(vis.us)
        .enter().append("path")
        .attr("d", vis.path);
    //
    // var world = topojson.feature(data1, data1.objects.countries).features;

    // vis.svg.append("path")
    //     .attr("class", "state-borders")
    //     .attr("d", vis.path(topojson.mesh(vis.worldData, vis.worldData.objects.states, function(a, b) { return a !== b; })));




    // Convert TopoJSON to GeoJSON (target object = 'countries')
    // vis.world = topojson.feature(vis.worldData, vis.worldData.objects.countries).features;
    //
    // // Render the U.S. by using the path generator
    // // this may be problematic as we add more paths...
    // vis.svg.selectAll("path")
    //     .data(vis.world)
    //     .enter().append("path")
    //     .attr("d", vis.path);
    //
    // // Add country boundaries
    // vis.svg.append("path")
    //     .datum(topojson.mesh(vis.worldData, vis.worldData.objects.countries, function(a,b) {return a !== b; }))
    //     .attr("d", vis.path)
    //     .attr("class", "subunit-boundary");

};


