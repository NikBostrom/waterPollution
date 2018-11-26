/*
 * MapVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data				-- original data being visualized
 * @param _stateOutlines    -- usStatesOutline json
 * @param _stateData        -- cleaned data nested by 2-letter state abbreviation
 * @param _stateToAbb       -- 2-letter abbreviations for each state
 */

MapVis = function(_parentElement, _data, _stateOutlines, _stateData, _stateToAbb ){
    this.parentElement = _parentElement;
    this.data = _data;
    this.stateOutlines = _stateOutlines;
    this.stateData = _stateData;
    this.stateToAbb = _stateToAbb;

    this.initVis();
};

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

// Set ranges of color for different map types
let colorRanges = {
    green: ["#E1F69E", "#455611"],
    pink: ["#E5AED1", "#7E195B"],
    purple: ["#C2A9D9", "#471C6E"]
};

MapVis.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 0, right: 0, bottom: 0, left: 0 };

    vis.width = 1000 - vis.margin.left - vis.margin.right;
    vis.height = 600 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height);

    // Set up map
    vis.projection = d3.geoAlbersUsa()
        .translate([vis.width/1.95, vis.height/3.75])
        .scale(600);

    vis.path = d3.geoPath()
        .projection(vis.projection);

    // Initialize variables for dynamic updates
    vis.type = d3.select("#measurable").node().value;

    // Dynamically update measurable
    d3.select("#measurable").on("change", function(){
        vis.type = d3.select("#measurable").node().value;
        console.log(vis.type);
        vis.updateChoropleth();
    });

    vis.updateChoropleth();
};


MapVis.prototype.updateChoropleth = function() {
    var vis = this;

    // Remove old paths and legend
    vis.svg.selectAll("path").remove();
    vis.svg.selectAll(".legend").remove();

    // console.log(vis.stateOutlines.features);
    // console.log(vis.stateData);

    // --> Choropleth implementation
    vis.stateOutlines.features.forEach(function(d) {
        // console.log(vis.stateToAbb[d.properties.NAME])
        // console.log(vis.stateData[vis.stateToAbb[d.properties.NAME]]);
        // console.log(d.properties.NAME.substr(0, 2).toUpperCase())
        if(vis.stateData[vis.stateToAbb[d.properties.NAME]]){
            d.properties.data = vis.stateData[vis.stateToAbb[d.properties.NAME]];
            d.properties.value = d.properties.data["avg_" + vis.type];
        }
    });

    // console.log(vis.stateOutlines.features);

    // Set up tooltip
    let tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) {
            if (d.properties.data){
                if (!isNaN(d.properties.data["avg_" + vis.type])){
                    return `${d.properties.NAME} <br/>${
                        d3.select("#measurable")
                            .node().options[d3.select("#measurable")
                            .node().selectedIndex].text}: ${d.properties.data["avg_" + vis.type].toFixed(2)}`;
                } else {
                    return `No data for ${d.properties.data ? d.properties.data.Country : "this state"}.`;
                }

            }
            else {
                return `No data for ${d.properties.data ? d.properties.data.Country : "this state"}.`;
            }
        });

    vis.svg.call(tool_tip);


    let colorSet;

    switch (vis.type) {
        case "Total_Nitrogen":
            colorSet = colorRanges.green;
            break;
        case "Turbidity":
            colorSet = colorRanges.pink;
            break;
        case "Total_Phosphorus":
            colorSet = colorRanges.purple;
            break;
    }
    var labels = [d3.min(vis.stateOutlines.features, d => d.properties.value), d3.max(vis.stateOutlines.features, d => d.properties.value)];

    color = d3.scaleLinear()
        .domain(d3.extent(vis.stateOutlines.features, d => d.properties.value))
        .range(colorSet);

    // Create countries
    vis.svg.selectAll("path")
        .data(vis.stateOutlines.features)
        .enter()
        .append("path")
        .attr("d", vis.path) .style("fill", function(d) {

        let value = d.properties.value;
        if (value) {
            //If value exists
            return color(value);
        }else{
            //If value is undefined
            return "#ccc";
        }
        })
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide);


    var w = 140, h = 300;

    var key = vis.svg
        .append("g")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "legend")
        .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

    var legend = key.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "100%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    legend.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorSet[1])
        .attr("stop-opacity", 1);

    legend.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorSet[0])
        .attr("stop-opacity", 1);

    key.append("rect")
        .attr("width", w - 100)
        .attr("height", h)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(100,10)");

    let domain = d3.extent(vis.stateOutlines.features, d => d.properties.value);

    var y = d3.scaleLinear()
        .range([h, 0])
        .domain(domain);

    var yAxis = d3.axisRight(y);

    key.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(141,10)")
        .call(yAxis)
};