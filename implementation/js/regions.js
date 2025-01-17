/*
 * RegionsVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data				-- water assessment data being visualized
 * @param _stateOutlines    -- usStatesOutline json
 * @param _stateCentroids   -- lat/longs of state centroids
 * @param _stateToAbb       -- 2-letter abbreviations for each state
 * @param _abbToState       -- state for each 2-letter abbreviation
 * @param _mergedStates     -- regionsOutline.json
 * @param _statesWithRegion -- usStatesOutline json with regions
 * @param _legendElement    -- the HTML element in which to draw the legend
 */

// TODO: Fix centers of regions?

RegionsVis = function(_parentElement, _data, _stateOutlines, _stateCentroids, _stateToAbb, _abbToState, _mergedStates, _statesWithRegion, _legendElement){
    this.parentElement = _parentElement;
    this.data = _data;
    this.stateFeatures = _stateOutlines.features;
    this.stateCentroids = _stateCentroids;
    this.stateToAbb = _stateToAbb;
    this.abbToState = _abbToState;
    this.regionFeatures = _mergedStates.features;
    this.stateRegionFeatures = _statesWithRegion.features;
    this.legendElement = _legendElement;
    this.initVis();

};

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

RegionsVis.prototype.initVis = function() {
    var vis = this;

    // SVG variables
    vis.margin = { top: 0, right: 0, bottom: 0, left: 0 };

    vis.width = $(`#${vis.parentElement}`).width() - vis.margin.left - vis.margin.right;
    vis.height = 550 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height);

    vis.g = vis.svg.append("g");

    // Set up map
    vis.projection = d3.geoAlbers()
        .precision(0)
        .scale(800).translate([vis.width / 2, vis.height / 2]);

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
    vis.assessLabels = ['Good', 'Impaired', 'Threatened', 'Not Assessed'];
    vis.colorScale = d3.scaleOrdinal()
        .domain(vis.assessTypes)
        .range(['#60A718', '#E9BF00', '#6B8BAD', '#CC0048']);
        // .range(['#386CB0', '#FFFF99', '#FDC086', '#666666']);
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

    // console.log(vis.byRegion);

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
    // console.log(vis.stateToRegion);

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
    // console.log(vis.byState);

    vis.updateVis()
};

RegionsVis.prototype.updateVis = function() {
    var vis = this;

    // console.log(vis.byRegion);

    // Define region tool tip
    vis.regionToolTip = d3.tip()
        .attr("class", "region-tip d3-tip")
        .offset(function(d) {
            var region = d.properties.EPA_REGION;
            // custom offsets for regions 9 and 10 because of Hawaii and Alaska
            if (region === '9') {
                return [-5,325]
            }
            else if (region === '10') {
                return [500,275]
            }
            return [-5,0]
        })
        .html(function(d) {
            var region = d.properties.EPA_REGION;
            var data = vis.byRegion.find(function(d) {return d.key === region});
            var text = "EPA Region " + region + "<br/>";
            for (var i=0; i<data.values.length; i++) {
                text += vis.assessLabels[i] + ": " + data.values[i] + "<br/>"
            }
            return text
        });

    vis.svg.call(vis.regionToolTip);

    // Draw regional geographic features
    vis.regionPaths = vis.g.selectAll(".region")
        .data(vis.regionFeatures)
        .enter()
        .append("path")
        .attr("d", vis.path)
        .attr("class", "region region-on")
        .attr("id", function(d) {
            return d.properties.EPA_REGION
        })
        .style("fill", "#D3D3D3")
        .style("stroke", "#A9A9A9")
        .on("click", function(d) {vis.regionZoom(d.properties.EPA_REGION)})
        // .on("mouseover", function(d) {d3.select(this).style("stroke-width", "3")})
        .on("mouseover", vis.regionToolTip.show)
        // .on("mouseout", function(d) {d3.select(this).style("stroke-width", "1")})
        .on("mouseout", vis.regionToolTip.hide);

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

    // Define SVG for legend
    vis.legendSvg = d3.select("#" + vis.legendElement).append("svg")
        .attr("width", 200)
        .attr("height", 150);

    // Create legend
    vis.legendSvg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(0, 40)");

    vis.legendOrdinal = d3.legendColor()
        .title("Water Assessment Status")
        .labels(vis.assessLabels)
        .scale(vis.colorScale);

    vis.legendSvg.select(".legendOrdinal")
        .call(vis.legendOrdinal);
};

RegionsVis.prototype.regionZoom = function(id) {
    var vis = this;
    console.log("regionZoom");

    // Define transition
    // vis.t = d3.transition().duration(1000);
    vis.t0 = d3.transition().duration(750); // remove regionPies
    vis.t1 = d3.transition().duration(1000); // zoom in
    vis.t2 = d3.transition().delay(1000).duration(500); // bring in statePies

    // Remove regionPies
    vis.g.selectAll('.region-pie')
        .data([])
        .exit().transition(vis.t0)
        .style('opacity', 0)
        .remove();

    // Remove statePies
    vis.g.selectAll('.state-pie')
        .data([])
        .exit().transition(vis.t0)
        .style('opacity', 0)
        .remove();

    // console.log("remove state data");
    // console.log("    vis.g.selectAll('.state')\n" +
    //     "        .data([])");console.log(
    //     vis.g.selectAll('.state')
    //         .data([])
    // );
    // console.log("vis.g.selectAll('.state')\n" +
    //     "        .data([])\n" +
    //     "        .exit()");
    // console.log(vis.g.selectAll('.state')
    //     .data([])
    //     .exit());
    // console.log(vis.g.selectAll('.state'));

    // Remove state data?
    vis.g.selectAll('.state')
        .data([])
        .exit().transition(vis.t)
        .attr('d', vis.path)
        .style('opacity', 0)
        .remove();

    // // Disable region click and mouseover
    vis.regionPaths
        .on("click", null)
        .on("mouseover", null)
        .attr("class", "region region-off");

    // Define region
    vis.regionFocus = vis.regionFeatures.find(function(d) {return d.properties.EPA_REGION === id});

    // Filter out state features not belonging to that region
    vis.regionStates = vis.stateRegionFeatures.filter(function(d) {
        return d.properties.EPA_REGION === id;
    });

    // Define state tool tip
    vis.stateToolTip = d3.tip()
        .attr("class", "state-tip d3-tip")
        .offset([-3,0])
        .html(function(d) {
            var state = d.properties.NAME;
            var data = vis.byState.find(function(d) {return d.key === state});
            var text = state + "<br/>";
            for (var i=0; i<data.values.length; i++) {
                text += vis.assessLabels[i] + ": " + data.values[i] + "<br/>"
            }
            return text
        });

    vis.svg.call(vis.stateToolTip);

    // Define statePaths
    // vis.stateG =
    vis.statePaths = vis.g.selectAll(".state")
        .data(vis.regionStates, function(d) { return d.properties.EPA_REGION });

    // Define enterStatePaths
    vis.enterStatePaths = vis.statePaths.enter().append("path")
        .attr("class", "state")
        .attr("d", vis.path)
        .style("fill", "#D3D3D3")
        .style("stroke", "#A9A9A9")
        .style('opacity', 0)
        .on('click', function() {vis.usZoom()})
        .on('mouseover', vis.stateToolTip.show)
        .on('mouseout', vis.stateToolTip.hide);

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
    // console.log(vis.regionByState);

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
    vis.regionPaths.transition(vis.t1)
        .attr('d', vis.path)
        .style('fill', '#444');

    // Transition enterStatePaths into opacity
    vis.enterStatePaths.transition(vis.t1)
        .attr('d', vis.path)
        .style('opacity', 1);

    // Transition state pie charts into opacity
    vis.statePiePaths.transition(vis.t2)
        .attr('d', vis.arc)
        .style('opacity', 1);

    // Exit statePaths (this doesn't seem completely necessary. exit is empty
    vis.statePaths.exit().transition(vis.t1)
        .attr('d', vis.path)
        .style('opacity', 0)
        .remove();

    console.log('vis.statePiePaths');
    console.log(vis.statePiePaths);
    // Exit statePiePaths
    vis.statePiePaths.transition(vis.t1)
        .attr('d', vis.path)
        .style('opacity', 0);

    console.log(vis.statePiePaths);
};

RegionsVis.prototype.usZoom = function() {
    var vis = this;

    // TODO: replace usZoom with updateVis?

    // Scale/translate projection back to normal
    vis.projection
        .scale(800)
        .translate([vis.width/2, vis.height/2]);

    // Transition back to region paths
    vis.regionPaths.transition(vis.t)
        .attr('d', vis.path)
        .attr("id", function(d) {
            return d.properties.EPA_REGION
        })
        .style("fill", "#D3D3D3")
        .style("stroke", "#A9A9A9");
    // Re-enable region clicking and mouseover
    vis.regionPaths.on("click", function(d) {vis.regionZoom(d.properties.EPA_REGION)})
        .on("mouseover", vis.regionToolTip.show)
        .on("mouseout", vis.regionToolTip.hide)
        .attr("class", "region region-on");

    // Remove statePies
    vis.g.selectAll('.state-pie')
        .data([])
        .exit().transition(vis.t)
        .style('opacity', 0)
        .remove();

    // Remove tool tips
    console.log(d3.selectAll('.state-tip'));
    d3.selectAll('.state-tip').remove();

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