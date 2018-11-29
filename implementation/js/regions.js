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
// TODO: Add legend back in
// TODO: Add DC to states, OR CHANGE DC TO REGION 11

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
    vis.regionColorScale = d3.schemeCategory10;

    // Filter, aggregate, modify data
    vis.wrangleData();
};

RegionsVis.prototype.wrangleData = function() {
    var vis = this;

    // // console.log(vis.data);
    // // Nest data by state
    // vis.byState = d3.nest()
    //     // .key(function(d) { return d.Region })
    //     .key(function(d) { return d.State })
    //     .key(function(d) { return d['Water Status']})
    //     .rollup(function(leaves) { return leaves.length })
    //     .entries(vis.data); // for array
    // // .object(vis.data); // for object
    //
    // console.log(vis.byState);

    // // Filter out non-states
    // vis.byState = vis.byState.filter(function(d) {return d.key in vis.abbToState});
    // // Sort alphabetically by full state name
    // vis.byState = vis.byState.sort(function(a, b) {
    //     var state1 = vis.abbToState[a.key];
    //     var state2 = vis.abbToState[b.key];
    //     if (state1 < state2) {return -1}
    //     if (state1 > state2) {return 1}
    //     return 0;
    // });
    // console.log(vis.byState);

    // Nest data by region
    vis.byRegion = d3.nest()
        .key(function(d) { return d.Region })
        .key(function(d) { return d['Water Status']})
        .rollup(function(leaves) { return leaves.length })
        .entries(vis.data);

    console.log(vis.byRegion);

    // // Combine data nested by state with lat/long of center
    // // console.log(vis.stateCentroids.features)
    // vis.wrangledData = [];
    //
    // for (i = 0; i < vis.stateCentroids.features.length; i++) {
    //     var d = vis.stateCentroids.features[i];
    //     // console.log(d);
    //     var state = {};
    //     state["key"] = d.properties.name;
    //     state["center"] = d.geometry.coordinates;
    //     state['values'] = [];
    //     vis.assessTypes.forEach(function(type) {
    //         // console.log(vis.byState[i].values);
    //         var idx = vis.byState[i].values.findIndex(x => x.key===type);
    //         // console.log(idx);
    //         if (idx === -1) {
    //             state['values'].push(0);
    //         }
    //         else {
    //             state['values'].push(vis.byState[i].values[idx].value);
    //         }
    //     });
    //     vis.wrangledData.push(state);
    // }
    // // console.log(vis.wrangledData);

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

    vis.updateVis()
};

RegionsVis.prototype.updateVis = function() {
    var vis = this;

    // Draw regional geographic features
    vis.g.selectAll("path")
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
        .on("click", function(d) {vis.regionZoom(d.properties.EPA_REGION)});

    console.log(vis.byRegion);
    // Draw regional pie charts
    vis.points = vis.g.selectAll("g")
        .data(vis.byRegion)
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
        .attr("fill", function(d, i) {
            return vis.colorScale(vis.assessTypes[i])
        })
        .attr("style", "fill-opacity: 1");

    // // Draw geographic features
    // vis.g.selectAll("path")
    //     .data(vis.stateFeatures)
    //     .enter()
    //     .append("path")
    //     .attr("d", vis.path)
    //     .attr("class", "state");
    //
    // // Draw pie charts
    // // console.log(vis.wrangledData);
    // vis.points = vis.g.selectAll("g")
    //     .data(vis.wrangledData)
    //     .enter()
    //     .append("g")
    //     .attr("transform", function(d) {return "translate(" + vis.projection(d.center) + ")"})
    //     .attr("class", "pie");
    //
    // vis.pies = vis.points.selectAll(".pie")
    //     .data(function(d) {return vis.pie(d.values)})
    //     .enter()
    //     .append('g')
    //     .attr('class', 'arc');
    //
    // vis.pies.append('path')
    //     .attr('d', vis.arc)
    //     .attr("fill", function(d, i) {
    //         return vis.colorScale(vis.assessTypes[i])
    //     })
    //     .attr("style", "fill-opacity: 0.8");

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

    // Define region
    vis.regionFocus = vis.regionFeatures.find(function(d) {return d.properties.EPA_REGION === id});

    // Filter out states not belonging to that region
    vis.regionStates = vis.stateRegionFeatures.filter(function(d) {
        return d.properties.EPA_REGION === id;
    });

    // Define transition
    vis.t = d3.transition().duration(800);

    // Define statePaths
    vis.statePaths = vis.svg.selectAll(".state")
        .data(vis.regionStates, function(d) { return d.properties.EPA_REGION });

    // Define enterStatePaths
    vis.enterStatePaths = vis.statePaths.enter().append("path")
        .attr("class", "state")
        .attr("d", vis.path);

    // Define statePies

    // need state data (wrangled?)

    // // Draw regional pie charts
    // vis.points = vis.g.selectAll("g")
    //     .data(vis.wrangledData)
    //     .enter()
    //     .append("g")
    //     .attr("transform", function(d) {return "translate(" + vis.projection(d.center) + ")"})
    //     .attr("class", "pie");
    //
    // vis.pies = vis.points.selectAll(".pie")
    //     .data(function(d) {return vis.pie(d.values)})
    //     .enter()
    //     .append('g')
    //     .attr('class', 'arc');
    //
    // vis.pies.append('path')
    //     .attr('d', vis.arc)
    //     .attr("fill", function(d, i) {
    //         return vis.colorScale(vis.assessTypes[i])
    //     })
    //     .attr("style", "fill-opacity: 1");

    // Change projection

    // Transition statePaths

    // Transition enterStatePaths

    // Transition state pie charts?

    // Exit statePaths

    // Exit statePies?
};

RegionsVis.prototype.usZoom = function() {
    // Define transition

    // Scale projection

    // Transition back to region paths and pie charts

    // Remove state data
}