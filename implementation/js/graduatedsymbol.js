/*
 * GraduatedSymbolVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data				-- water assessment data being visualized
 * @param _stateOutlines    -- usStatesOutline json
 * @param _stateCentroids   -- lat/longs of state centroids
 * @param _stateToAbb       -- 2-letter abbreviations for each state
 * @param _abbToState       -- state for each 2-letter abbreviation
 */

/*
TODO: Add tooltips
TODO: Pie charts by region
 */

SymbVis = function(_parentElement, _data, _stateOutlines, _stateCentroids, _stateToAbb, _abbToState){
    this.parentElement = _parentElement;
    this.data = _data;
    this.stateOutlines = _stateOutlines;
    this.stateCentroids = _stateCentroids;
    this.stateToAbb = _stateToAbb;
    this.abbToState = _abbToState;
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
        .attr("height", vis.height)
        .on("click", vis.stopped, true);

    vis.svg.append("rect")
        .attr("class", "background")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .attr("fill", "white")
        .on("click", vis.reset);

    vis.g = vis.svg.append("g");

    // Set up map
    vis.projection = d3.geoAlbersUsa()
        .scale(1100)
        .translate([vis.width*4/7, vis.height/2]);

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

    // Ordinal color scale
    vis.assessTypes = ['GOOD', 'IMPAIRED', 'THREATENED', 'NOT_ASSESSED'];
    vis.colorScale = d3.scaleOrdinal()
        .domain(vis.assessTypes)
        .range(['#386CB0', '#FFFF99', '#FDC086', '#666666']);
    // console.log(vis.colorScale(vis.assessTypes[0]));

    // Zoom
    vis.active = d3.select(null);

    vis.zoom = d3.zoom()
        .scaleExtent([1,8])
        .on("zoom", function() {vis.zoomed()});

    // vis.svg
    //     .call(vis.zoom); // delete this line to disable free zooming

    // Filter, aggregate, modify data
    vis.wrangleData();
};

SymbVis.prototype.wrangleData = function() {
    var vis = this;

    // console.log(vis.data);
    // Nest data by state
    vis.byState = d3.nest()
    // .key(function(d) { return d.Region })
        .key(function(d) { return d.State })
        .key(function(d) { return d['Water Status']})
        .rollup(function(leaves) { return leaves.length })
        .entries(vis.data);

    // console.log(vis.abbToState);

    // Filter out non-states
    vis.byState = vis.byState.filter(function(d) {return d.key in vis.abbToState});

    // console.log(vis.byState);
    // console.log(vis.stateCentroids.features);

    // Combine nested data with lat/long of center
    vis.byState.forEach(function(d) {
        // console.log(d);

        // Find state name
        var state = vis.abbToState[d.key];
        d.key = state;

        // Get coordinates of centroid
        var coords = vis.stateCentroids.features.find(function(element) {
            return element.properties.name === state
        });

        // Store coordinates in nested data
        d.center = coords.geometry.coordinates;

        // Convert values from object to array and store in nested data
        var tempVals = [];
        vis.assessTypes.forEach(function(type) {
            var idx = d.values.findIndex(x => x.key===type);
            if (idx === -1) {
                tempVals.push(0);
            }
            else {
                tempVals.push(d.values[idx].value)
            }
        });
        d.values = tempVals;
        // console.log(d);
    });
    // console.log(vis.byState);

    vis.updateVis()
};

SymbVis.prototype.updateVis = function() {
    var vis = this;

    // Draw geographic features
    vis.g.selectAll("path")
        .data(vis.stateOutlines.features)
        .enter()
        .append("path")
        .attr("d", vis.path)
        .attr("class", "state")
        .on("click", function(d) {vis.clicked(d)});

    // Draw pie charts
    // console.log(vis.byState);
    vis.points = vis.g.selectAll("g")
        .data(vis.byState)
        .enter()
        .append("g")
        .attr("transform", function(d) {return "translate(" + vis.projection(d.center) + ")"})
        .attr("class", "pie");

    vis.pies = vis.points.selectAll(".pie")
        .data(function(d) {return vis.pie(d.values)})
        .enter()
        .append('g')
        .attr('class', 'arc');
    // console.log(vis.pies);

    vis.pies.append('path')
        .attr('d', vis.arc)
        .attr("fill", function(d, i) {
            return vis.colorScale(vis.assessTypes[i])
        })
        .attr("style", "fill-opacity: 0.8");

    // Create legend
    vis.g.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(20, 40)");

    vis.legendOrdinal = d3.legendColor()
        .title("Water Assessment Status")
        .labels(['Good', 'Impaired', 'Threatened', 'Not Assessed'])
        .scale(vis.colorScale);

    vis.g.select(".legendOrdinal")
        .call(vis.legendOrdinal);
};

SymbVis.prototype.clicked = function(d) {
    var vis = this;
    console.log(d);
    console.log(vis);
    console.log(vis.active);
    console.log(vis.active.node());

    if (vis.active.node() === this) {return vis.reset()};
    vis.active.classed("active", false);
    vis.active = d3.select(this).classed("active", true);

    vis.bounds = vis.path.bounds(d),
        vis.dx = vis.bounds[1][0] - vis.bounds[0][0],
        vis.dy = vis.bounds[1][1] - vis.bounds[0][1],
        vis.x = (vis.bounds[0][0] + vis.bounds[1][0]) / 2,
        vis.y = (vis.bounds[0][1] + vis.bounds[1][1]) / 2,
        vis.scale = Math.max(1, Math.min(8, 0.9 / Math.max(vis.dx / vis.width, vis.dy / vis.height))),
        vis.translate = [vis.width / 2 - vis.scale * vis.x, vis.height / 2 - vis.scale * vis.y];

    vis.svg.transition()
        .duration(750)
        .call(vis.zoom.transform, d3.zoomIdentity.translate(vis.translate[0], vis.translate[1]).scale(vis.scale) );


};

SymbVis.prototype.reset = function() {
    var vis = this;

    vis.active.classed("active", false);
    vis.active = d3.select(null);

    vis.svg.transition()
        .duration(750)
        .call(vis.zoom.transform, d3.zoomIdentity);
};

SymbVis.prototype.zoomed = function() {
    var vis = this;

    vis.g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
    vis.g.attr("transform", d3.event.transform);
};

SymbVis.prototype.stopped = function() {
    var vis = this;

    if (d3.event.defaultPrevented) d3.event.stopPropagation();
};