/*
 * GlyphVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data				-- the actual data
 */

GlyphVis = function(_parentElement, _data ){
    this.parentElement = _parentElement;
    this.data = _data;

    this.initVis();
};

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

GlyphVis.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 100, right: 100, bottom: 100, left: 100 };

    vis.width = 500 - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height);

//COMMD OUT
//    console.log(vis.data);

    // bar chart?
    // pie chart?

    vis.x = d3.scaleBand()
        .domain(['GOOD', 'IMPAIRED', 'NOT_ASSESSED'])
        .range([0, vis.width])
        .paddingInner(0.3);

    vis.y = d3.scaleLinear()
        .domain([0, 500]) // fix this
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);
        //.tickFormat()

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.xAxisGroup = vis.svg.append("g")
        .attr("class", "x-axis axis");

    vis.yAxisGroup = vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.bars = vis.svg.selectAll(".bar")
        .remove()
        .exit()
        .data(vis.data[0].values);

    vis.bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return vis.x(d.key)})
        .attr("y", function(d) { return vis.y(d.value)})
        .attr("height", function(d) { return vis.height - vis.y(d.value)})
        .attr("width", vis.x.bandwidth());

    vis.xAxisGroup = vis.svg.select(".x-axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(vis.xAxis);

    vis.yAxisGroup = vis.svg.select(".y-axis")
        .call(vis.yAxis);

    vis.svg.select("text.axis-title").remove();
    vis.svg.append("text")
        .attr("class", "axis-title")
        .attr("x", -5)
        .attr("y", -15)
        .attr("dy", ".1em")
        .style("text-anchor", "end")
        .text("Rhode Island")
};


