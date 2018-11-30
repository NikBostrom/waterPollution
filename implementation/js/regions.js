/*
 * GraduatedSymbolVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data				-- water assessment data being visualized
 * @param _stateOutlines    -- usStatesOutline json
 * @param _stateCentroids   -- lat/longs of state centroids
 * @param _stateToAbb       -- 2-letter abbreviations for each state
 * @param _abbToState       -- state for each 2-letter abbreviation
 * @param _mergedStates     -- regionsOutline.json
 * @param _statesWithRegion -- usStatesOutline json with regions
 */

// TODO: Add state outlines on top of regions
// TODO: Add legend on the side
// TODO: Fix centers of regions?

RegionsVis = function(_parentElement, _data, _stateOutlines, _stateCentroids, _stateToAbb, _abbToState, _mergedStates, _statesWithRegion){
    this.parentElement = _parentElement;
    this.data = _data;
    this.stateFeatures = _stateOutlines.features;
    this.stateCentroids = _stateCentroids;
    this.stateToAbb = _stateToAbb;
    this.abbToState = _abbToState;
    this.regionFeatures = _mergedStates.features;
    this.stateRegionFeatures = _statesWithRegion.features;
    this.initVis();

};

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

RegionsVis.prototype.initVis = function() {
    var vis = this;

    // SVG variables
    vis.margin = { top: 0, right: 0, bottom: 0, left: 0 };

    vis.width = 1000 - vis.margin.left - vis.margin.right;
    vis.height = 600 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height);

    vis.svg.append("rect")
        .attr("class", "background")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .attr("fill", "white");

    vis.g = vis.svg.append("g");

    // Set up map
    vis.projection = d3.geoAlbersUsa()
        .scale(1100)
        .translate([vis.width/2, vis.height/2]);

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
    vis.regionColorScale = d3.schemeCategory10;

    // Filter, aggregate, modify data
    vis.wrangleData();
};

RegionsVis.prototype.wrangleData = function() {
    var vis = this;

    // Nest data by region
    vis.byRegion = d3.nest()
        .key(function(d) { return d.Region })
        .key(function(d) { return d['Water Status']})
        .rollup(function(leaves) { return leaves.length })
        .entries(vis.data);

    console.log(vis.byRegion);

    // Define center state for each region
    vis.EPARegions = [
        {"Region": "1", "Center": "New Hampshire"},
        {"Region": "2", "Center": "New York"},
        {"Region": "3", "Center": "Maryland"},
        {"Region": "4", "Center": "Georgia"},
        {"Region": "5", "Center": "Indiana"},
        {"Region": "6", "Center": "Texas"},
        {"Region": "7", "Center": "Nebraska"},
        {"Region": "8", "Center": "Wyoming"},
        {"Region": "9", "Center": "Nevada"},
        {"Region": "10", "Center": "Washington"}
    ];

    // Combine data nested by region with lat/long of center state
    vis.byRegion.forEach(function(d) {

        // Find center state
        var tempCenterStateObj = vis.EPARegions.find(function(element) {
            return element.Region === d.key
        });
        // console.log(centerStateObj);

        // Get coordinates of center state centroid
        var centerStateCoords = vis.stateCentroids.features.find(function(element) {
            return element.properties.name === tempCenterStateObj.Center
        });

        // Store coordinates in nested data
        d.center = centerStateCoords.geometry.coordinates;

        // Convert values from object to array
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

    // Nest data by state
    vis.byState = d3.nest()
    // .key(function(d) { return d.Region })
        .key(function(d) { return d.State })
        .key(function(d) { return d['Water Status']})
        .rollup(function(leaves) { return leaves.length })
        .entries(vis.data); // for array

    vis.stateToRegion = d3.nest()
        .key(function(d) { return d.Region })
        .key(function(d) { return vis.abbToState[d.State] })
        .rollup(function(leaves) {return 0})
        .object(vis.data);
    console.log(vis.stateToRegion);

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
    console.log(vis.byState);

    vis.updateVis()
};

RegionsVis.prototype.updateVis = function() {
    var vis = this;

    // Draw regional geographic features
    vis.regionPaths = vis.g.selectAll("path")
        .data(vis.regionFeatures)
        .enter()
        .append("path")
        .attr("d", vis.path)
        .attr("class", "region")
        .attr("fill", function(d) {
            // convert region to number
            var region = +d.properties.EPA_REGION;
            if (region > 0) {return vis.regionColorScale[region-1]}
            else {return "white"}
        })
        .attr("id", function(d) {
            return d.properties.EPA_REGION
        })
        .on("click", function(d) {vis.regionZoom(d.properties.EPA_REGION)});

    console.log(vis.byRegion);

    // TODO: Factor drawing pie charts into usZoom function
    // Draw regional pie charts
    vis.regionPoints = vis.g.selectAll(".region-pie")
        .data(vis.byRegion)
        .enter()
        .append("g")
        .attr("transform", function(d) {return "translate(" + vis.projection(d.center) + ")"})
        .attr("class", "region-pie pie");

    vis.regionPies = vis.regionPoints.selectAll(".region-pie")
        .data(function(d) {return vis.pie(d.values)})
        .enter()
        .append('g')
        .attr('class', 'arc');

    vis.regionPiePaths = vis.regionPies.append('path')
        .attr('d', vis.arc)
        .attr("fill", function(d, i) {
            return vis.colorScale(vis.assessTypes[i])
        })
        .attr("style", "fill-opacity: 1")
        .attr('class', 'region-pie-path pie-path');
        // .style('opacity', 0);

    // // Create legend
    // vis.g.append("g")
    //     .attr("class", "legendOrdinal")
    //     .attr("transform", "translate(20, 40)");
    //
    // vis.legendOrdinal = d3.legendColor()
    //     .title("Water Assessment Status")
    //     .labels(['Good', 'Impaired', 'Threatened', 'Not Assessed'])
    //     .scale(vis.colorScale);
    //
    // vis.g.select(".legendOrdinal")
    //     .call(vis.legendOrdinal);
};

RegionsVis.prototype.regionZoom = function(id) {
    var vis = this;

    // Define transition
    vis.t = d3.transition().duration(1000);

    // Remove regionPies
    vis.g.selectAll('.region-pie')
        .data([])
        .exit().transition(vis.t)
        .style('opacity', 0)
        .remove();

    // Define region
    vis.regionFocus = vis.regionFeatures.find(function(d) {return d.properties.EPA_REGION === id});

    // Filter out state features not belonging to that region
    vis.regionStates = vis.stateRegionFeatures.filter(function(d) {
        return d.properties.EPA_REGION === id;
    });

    // Define statePaths
    vis.statePaths = vis.g.selectAll(".state")
        .data(vis.regionStates, function(d) { return d.properties.EPA_REGION });

    // Define enterStatePaths
    vis.enterStatePaths = vis.statePaths.enter().append("path")
        .attr("class", "state")
        .attr("d", vis.path)
        .style('opacity', 0)
        .on('click', function() {vis.usZoom()});

    // Change projection
    vis.padding = 20;
    vis.projection.fitExtent(
        [[vis.padding, vis.padding], [vis.width - vis.padding, vis.height - vis.padding]],
        vis.regionFocus
    );

    // console.log(vis.byState);

    // Filter out state data not in region
    vis.regionByState = vis.byState.filter(function(d) {
        return vis.stateToRegion[id].hasOwnProperty(d.key)
    });
    console.log(vis.regionByState);

    // Define statePies
    vis.statePoints = vis.g.selectAll(".state-pie")
        .data(vis.regionByState)
        .enter()
        .append("g")
        .attr("transform", function(d) {
            // console.log(d);
            return "translate(" + vis.projection(d.center) + ")"})
        .attr("class", "state-pie pie");

    vis.statePies = vis.statePoints.selectAll(".state-pie")
        .data(function(d) { return vis.pie(d.values)})
        .enter()
        .append('g')
        .attr('class', 'arc');

    vis.statePiePaths = vis.statePies.append('path')
        // .attr('d', vis.arc)
        .attr("fill", function(d, i) {
            return vis.colorScale(vis.assessTypes[i])
        })
        .attr("style", "fill-opacity: 1")
        .attr('class', 'state-pie-path pie-path')
        .style('opacity', 0);

    // Transition regionPaths to grey
    vis.regionPaths.transition(vis.t)
        .attr('d', vis.path)
        .style('fill', '#444');

    // Transition enterStatePaths into opacity
    vis.enterStatePaths.transition(vis.t)
        .attr('d', vis.path)
        .style('opacity', 1);

    // Transition state pie charts into opacity
    // TODO: either delay until zoom in is complete, or slide in during zoom
    vis.statePiePaths.transition(vis.t)
        .attr('d', vis.arc)
        .style('opacity', 1);

    // Exit statePaths (this doesn't seem completely necessary. exit is empty
    vis.statePaths.exit().transition(vis.t)
        .attr('d', vis.path)
        .style('opacity', 0)
        .remove();

    // // Exit statePiePaths TODO: what would this do?
    // vis.statePiePaths.exit().transition(vis.t)
    //     .attr('d', vis.path)
    //     .style('opacity', 0)
    //     .remove();
};

RegionsVis.prototype.usZoom = function() {
    var vis = this;
    // Define transition

    // Scale/translate projection back to normal
    vis.projection
        .scale(1100)
        .translate([vis.width/2, vis.height/2]);

    // Transition back to region paths
    vis.regionPaths.transition(vis.t)
        .attr('d', vis.path)
        .style("fill", function(d) {
            // convert region to number
            var region = +d.properties.EPA_REGION;
            if (region > 0) {return vis.regionColorScale[region-1]}
            else {return "white"}
        });

    // TODO: Add transitions back to pie charts

    // Remove statePies
    vis.g.selectAll('.state-pie')
        .data([])
        .exit().transition(vis.t)
        .style('opacity', 0)
        .remove();

    // Draw regional pie charts
    vis.regionPoints = vis.g.selectAll(".region-pie")
        .data(vis.byRegion)
        .enter()
        .append("g")
        .attr("transform", function(d) {return "translate(" + vis.projection(d.center) + ")"})
        .attr("class", "region-pie pie");

    vis.regionPies = vis.regionPoints.selectAll(".region-pie")
        .data(function(d) {return vis.pie(d.values)})
        .enter()
        .append('g')
        .attr('class', 'arc');

    vis.regionPiePaths = vis.regionPies.append('path')
        // .attr('d', vis.arc)
        .attr("fill", function(d, i) {
            return vis.colorScale(vis.assessTypes[i])
        })
        .attr("style", "fill-opacity: 1")
        .attr('class', 'region-pie-path pie-path')
        .style('opacity', 0);

    // Transition region pie charts into opacity
    // TODO: either delay until zoom in is complete, or slide in during zoom
    vis.regionPiePaths.transition(vis.t)
        .attr('d', vis.arc)
        .style('opacity', 1);

    // Remove state data?
    vis.g.selectAll('.state')
        .data([])
        .exit().transition(vis.t)
        .attr('d', vis.path)
        .style('opacity', 0)
        .remove();
};