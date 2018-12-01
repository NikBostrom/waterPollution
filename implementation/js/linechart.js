
/*
 *  StationMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

LineChart = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = []; // see data wrangling

    this.initVis();
}


/*
 *  Initialize station map
 */

LineChart.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

    vis.width = $(`#${vis.parentElement}`).width() - vis.margin.left - vis.margin.right;
    vis.height = 400 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    // vis.svg = d3.select("#" + vis.parentElement).append("svg")
    vis.svg = d3.select("#newguy").append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // Scales
    vis.x = d3.scaleTime()
        .rangeRound([0, vis.width]);
    // vis.x = d3.scaleBand()
    //     .domain(['1','2','3','4','5','6','7','8','9','10','11','12'])
    //     .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);


//Define X axis
    vis.xAxis = d3.axisBottom()
        .scale(vis.x);


//Define Y axis
    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .ticks(5);

//Create X axis
    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");


//Create Y axis
    vis.svg.append("g")
        .attr("class", "y-axis axis");

    d3.selectAll(".domain").attr("stroke", "white");
    vis.wrangleData();
}


/*
 *  Data wrangling
 */

LineChart.prototype.wrangleData = function() {
    var vis = this;

    // Currently no data wrangling/filtering needed
    // vis.displayData = vis.data;

    // Update the visualization
    vis.updateVis();

}


/*
 *  The drawing function
 */

LineChart.prototype.updateVis = function() {

    var vis = this;
    var selectedOption = d3.select("#ranking-type").property("value");
    vis.x.domain([1985,2025]);
    vis.y.domain([0, d3.max(vis.data, function(d) { return d[selectedOption]; })]);


    //Update X axis
    vis.svg.select(".x-axis")
        .call(vis.xAxis);

    //Update Y axis
    vis.svg.select(".y-axis")
        .call(vis.yAxis);

    // add axis labels, area chart
    vis.svg.append("text")
        .attr("class", "x-label")
        .attr("transform", "translate(" + (vis.width/2) + ", " + (vis.height + 9*vis.margin.bottom/10) + ")")
        .style("text-anchor", "middle")
        .text("Date");
    vis.svg.append("text")
        .attr("class", "y-label")
        .attr("transform", "translate(-30, " + (0-5) + ")")
        .text("Goals");

    // create line function for line chart
    vis.line = d3.line()
        .x(function(d) { return vis.x(d.Year); })
        .y(function(d) { console.log(vis.y(d[selectedOption])); return vis.y(d[selectedOption]); });

    // draw line for chart
    vis.newLine = vis.svg.append("path");
    vis.newLine.datum(vis.data)
        .attr("class", "line")
        .attr("d", vis.line)
        .style("stroke-width", "20px");


    // // update chart when choosing different category
    // d3.select("#ranking-type").on("change", function() {
    //
    //     // update selected option and axes accordingly, along with filtered data
    //     selectedOption = d3.select("#ranking-type").property("value");
    //     x.domain(d3.extent(filteredData, function(d) { return d.YEAR; } ));
    //     y.domain([0, d3.max(filteredData, function(d) { return d[selectedOption]; })]);
    //
    //     // update X axis
    //     svg.select(".x-axis")
    //         .transition()
    //         .duration(800)
    //         .call(xAxis);
    //
    //     //Update Y axis
    //     svg.select(".y-axis")
    //         .transition()
    //         .duration(800)
    //         .call(yAxis);
    //
    //     svg.select(".y-label")
    //         .text(function() {
    //             if (selectedOption === "GOALS") {
    //                 return "Goals";
    //             }
    //             else if (selectedOption === "AVERAGE_GOALS") {
    //                 return "Average Goals";
    //             }
    //             else if (selectedOption === "MATCHES") {
    //                 return "Matches";
    //             }
    //             else if (selectedOption === "TEAMS") {
    //                 return "Teams";
    //             }
    //             else {
    //                 return "Average Attendance";
    //             }
    //         });
    //
    //     // create line function for line chart
    //     var line = d3.line()
    //         .x(function(d) { return x(d.YEAR); })
    //         .y(function(d) { return y(d[selectedOption]); });
    //
    //     // update line for chart
    //     newLine.datum(filteredData)
    //         .style("opacity", 0.0)
    //         .transition()
    //         .duration(800)
    //         .attr("class", "line")
    //         .attr("d", line)
    //         .on("end", function() {
    //             d3.select(this).transition().duration(200).style("opacity", 1.0);
    //         });
    //
    //     // update tooltip
    //     var tool_tip = d3.tip()
    //         .attr("class", "d3-tip")
    //         .offset([-8, 0])
    //         .html(function(d) { return "Edition: " + d.EDITION +
    //             "<br>" + selectedOption + " : " + d[selectedOption]; });
    //     svg.call(tool_tip);
    //
    //     // Data-join (circle now contains the update selection)
    //     var circle = svg.selectAll("circle")
    //         .data(filteredData);
    //
    //     // Enter (initialize the newly added elements)
    //     circle.enter().append("circle")
    //         .attr("class", "tooltip-circle")
    //         // Enter and Update (set the dynamic properties of the elements)
    //         .merge(circle)
    //         .on('mouseover', tool_tip.show)
    //         .on('mouseout', tool_tip.hide)
    //         .on("click", function(d) {
    //             showEdition(d)
    //         })
    //         .transition()
    //         .duration(800)
    //         .attr("r", 8)
    //         .attr("cx", function(d) { return x((d.YEAR)); })
    //         .attr("cy", function(d) { return y(d[selectedOption]); });
    //
    //     // Exit
    //     circle.exit().remove();
    //
    // });

}
