/*
 * GraduatedSymbolVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data				-- water assessment data being visualized
 * @param _stateOutlines    -- usStatesOutline json
 * @param _stateCentroids   -- lat/longs of state centroids
 * @param _stateAbbs       -- 2-letter abbreviations for each state
 */

SymbVis = function(_parentElement, _data, _stateOutlines, _stateCentroids, _stateAbbs){
    this.parentElement = _parentElement;
    this.data = _data;
    this.stateOutlines = _stateOutlines;
    this.stateCentroids = _stateCentroids;
    this.stateAbbs = _stateAbbs;
    this.initVis();
};

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

SymbVis.prototype.initVis = function() {
    var vis = this;

    // SVG variables
    vis.margin = { top: 0, right: 0, bottom: 0, left: 0 };

    vis.width = 1000 - vis.margin.left - vis.margin.right;
    vis.height = 600 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height);

    // Set up map
    vis.projection = d3.geoAlbersUsa()
        .scale(1100);

    vis.path = d3.geoPath()
        .projection(vis.projection);

    // Pie chart variables
    vis.radius = 15;

    vis.arc = d3.arc()
        .innerRadius(0)
        .outerRadius(vis.radius);

    vis.pie = d3.pie()
        .sort(null) // alter to sort alphabetically by field
        .value(function(d) { return d; });

    vis.color = d3.schemeCategory10;

    // Filter, aggregate, modify data
    vis.wrangleData();
};

SymbVis.prototype.wrangleData = function() {
    var vis = this;

    // Nest data by state
    vis.cleanedData = d3.nest()
    // .key(function(d) { return d.Region })
        .key(function(d) { return d.State })
        .key(function(d) { return d['Water Status']})
        .rollup(function(leaves) { return leaves.length })
        // .entries(vis.data); // for array
        .object(vis.data); // for object
    // console.log(vis.cleanedData);

    // Combine nested data with lat/long of center
    console.log(vis.stateCentroids.features);
    vis.wrangledData = [];
    vis.stateCentroids.features.forEach(function (d) {
        var state = {};
        state["name"] = d.properties.name;
        state["center"] = d.geometry.coordinates;
        state["values"] = vis.cleanedData[vis.stateAbbs[d.properties.name]];
        vis.wrangledData.push(state);
    });

    console.log(vis.wrangledData);
    vis.updateVis()
};

SymbVis.prototype.updateVis = function() {
    var vis = this;

    // Draw geographic features
    vis.svg.selectAll("path")
        .data(vis.stateOutlines.features)
        .enter()
        .append("path")
        .attr("d", vis.path);

    // Draw circles
    vis.svg.selectAll(".symbol")
        .data(vis.stateCentroids.features)
        .enter().append("path")
        .attr("class", "symbol")
        .attr("d", vis.path.pointRadius(15))
        .attr("fill", "blue");

    // Draw pie charts
    console.log(vis.wrangledData);
    vis.points = vis.svg.selectAll("g")
        .data(vis.wrangledData)
        .enter()
        .append("g")
        .attr("transform", function(d) {return "translate(" + vis.projection(d.center) + ")"})
        .attr("class", "pie");

    vis.pies = vis.points.selectAll(".pie")
        .data(vis.wrangledData, function(d) {console.log(d.name)})
};