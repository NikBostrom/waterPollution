/*
 * GraduatedSymbolVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data				-- water assessment data being visualized
 * @param _stateOutlines    -- usStatesOutline json
 * @param _stateCentroids   -- lat/longs of state centroids
 * @param _stateToAbb       -- 2-letter abbreviations for each state
 * @param _abbToState       -- state for each 2-letter abbreviation
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

    console.log(vis.data);
    // Nest data by state
    vis.byState = d3.nest()
    // .key(function(d) { return d.Region })
        .key(function(d) { return d.State })
        .key(function(d) { return d['Water Status']})
        .rollup(function(leaves) { return leaves.length })
        .entries(vis.data); // for array
        // .object(vis.data); // for object

    // console.log(vis.abbToState);

    // Filter out non-states
    vis.byState = vis.byState.filter(function(d) {return d.key in vis.abbToState});
    // Sort alphabetically by full state name
    vis.byState = vis.byState.sort(function(a, b) {
        var state1 = vis.abbToState[a.key];
        var state2 = vis.abbToState[b.key];
        if (state1 < state2) {return -1}
        if (state1 > state2) {return 1}
        return 0;
    });
    // console.log(vis.byState);

    // Combine nested data with lat/long of center
    // console.log(vis.stateCentroids.features);
    vis.assessTypes = ['GOOD', 'IMPAIRED', 'THREATENED', 'NOT_ASSESSED'];
    vis.wrangledData = [];

    for (i = 0; i < vis.stateCentroids.features.length; i++) {
        var d = vis.stateCentroids.features[i];
        // console.log(d);
        var state = {};
        state["name"] = d.properties.name;
        state["center"] = d.geometry.coordinates;
        state['values'] = [];
        vis.assessTypes.forEach(function(type) {
            // console.log(vis.byState[i].values);
            var idx = vis.byState[i].values.findIndex(x => x.key===type);
            // console.log(idx);
            if (idx === -1) {
                state['values'].push(0);
            }
            else {
                state['values'].push(vis.byState[i].values[idx].value);
            }
        });
        vis.wrangledData.push(state);
    }
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

    // // Draw circles
    // vis.svg.selectAll(".symbol")
    //     .data(vis.stateCentroids.features)
    //     .enter().append("path")
    //     .attr("class", "symbol")
    //     .attr("d", vis.path.pointRadius(15))
    //     .attr("fill", "blue");

    // Draw pie charts
    console.log(vis.wrangledData);
    vis.points = vis.svg.selectAll("g")
        .data(vis.wrangledData)
        .enter()
        .append("g")
        .attr("transform", function(d) {return "translate(" + vis.projection(d.center) + ")"})
        .attr("class", "pie");

    vis.pies = vis.points.selectAll(".pie")
        .data(function(d) {return vis.pie(d.values)})
        .enter()
        .append('g')
        .attr('class', 'arc');

    vis.pies.append('path')
        .attr('d', vis.arc)
        .attr("fill", function(d, i) { return vis.color[i]; })
        .attr("style", "fill-opacity: 0.8")
};