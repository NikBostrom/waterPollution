/*
 * HarborLinechartVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _locationData				-- the list of locations where measurements in the NU Harbor were taken
 */

HarborLinechartVis = function(_parentElement, _harborData, _allLocationsAverageData){
    this.parentElement = _parentElement;
    // this.locations = _locationData;
    this.harborData = _harborData;
    this.allLocationsAverageData = _allLocationsAverageData;

    this.filteredData = this.harborData;

    // console.log(this.filteredData);

    this.initVis();
};

HarborLinechartVis.prototype.initVis = function() {
    var vis = this;

    // SVG drawing area
    vis.margin = {top: 40, right: 40, bottom: 100, left: 75};

    vis.width = $(`#${vis.parentElement}`).width() - vis.margin.left - vis.margin.right;

    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    // console.log(vis.harborData);

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
        .attr("id", "harbor-linechart-svg-group");


    // Date parser
    // Convert current date to a human-readable string
    vis.formatDate = d3.timeFormat("%Y");
    // Convert a string back to a date
    vis.parseDate = d3.timeParse("%Y");

    // Scales, axes, and labels
    vis.xScale = d3.scaleTime()
        .range([0, vis.width]);
    vis.xAxis = d3.axisBottom()
        .scale(vis.xScale)
        .tickFormat(d3.timeFormat("%b, %Y"));
    vis.xAxisGroup = vis.svg.append("g")
        .attr("class", "x-axis-group harbor axis")
        .attr("transform", "translate(0," + vis.height + ")");
    vis.xAxisLabel = vis.svg.append("text")
        .attr("class", "axis-label x-axis-label")
        .attr("transform", "translate(" + (vis.width / 2) + ", " + (vis.height + 0.75 * vis.margin.bottom) + ")")
        .text("Date")
        .style("text-anchor", "middle");

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);
    vis.yAxis = d3.axisLeft().scale(vis.yScale);
    vis.yAxisGroup = vis.svg.append("g")
        .attr("class", "y-axis-group harbor axis");
    vis.yAxisLabel = vis.svg.append("text")
        .attr("class", "axis-label y-axis-label")
        .attr("transform", "translate(" + -(vis.margin.left * 3/4) + "," + (vis.height / 2) + ") rotate(-90)");

    // Line
    // Add upper boundary line
    vis.linePath = vis.svg.append("path");

    d3.selectAll("text").style("fill", "white");
    d3.selectAll(".axis").attr("stroke", "white");
    d3.selectAll("#harbor-linechart-svg-group .domain").attr("stroke", "white");
    vis.updateVis($("#harbor-select-box :selected").val(), null);

    vis.handle = vis.svg.insert("g","first-child")
        .append("line")
        .attr("id","stackhandle")
        .attr("class","handle")
        .attr("x1",0)
        .attr("y1", 0)
        .attr("x2",0)
        .attr("y2",vis.height + 6)
        .style("stroke-linecap","round")
        .style("stroke-width",2)
        .attr("d","M5 40 l215 0")
        .attr("stroke","black")
        .style("stroke-dasharray","10,10")
        .attr("z-index",10);
}



// Initialize data
// loadData();

// Animations
var transitionDuration = 800;

// var mainColor = "white";
// var mainColor = "#6dabd5";
var mainColor = "#0f6d70";
var transitionColor = "#00664d";

// Render visualization
HarborLinechartVis.prototype.updateVis = function(measureSelection, locationSelection) {
    var vis = this;
    // vis.filterTime();

    // vis.filteredData = vis.harborData.filter(function(d) {return d[selection] !== "NS";});
    if (locationSelection !== null) {
        vis.filteredData = vis.harborData.filter(function(loc) {
            return loc["Site"] === locationSelection;
        })[0][measureSelection].filter(function(loc) {
            return (!isNaN(loc["Value"]));
        });
    }
    // Use average data
    else {
        vis.filteredData = vis.allLocationsAverageData[measureSelection];
        // console.log(vis.allLocationsAverageData);

        // vis.filteredData = vis.harborData.filter(function(loc) {
        //     return loc["Site"] === "CIC2";
        // })[0][measureSelection].filter(function(loc) {
        //     return (!isNaN(loc["Value"]));
        // });
    }

    // vis.filteredData.sort(function(a, b) { return a["Date"] - b["Date"]; });
    // console.log(vis.filteredData);
    // console.log(vis.harborData);

    // Dynamically update the domains based on user selection
    vis.xScale.domain(d3.extent(vis.filteredData, function (d) {
        // console.log(d);
        // console.log(d["Date"]);
        return d["Date"];
    }));

    // else {
    //     if (d["Value"] !== 0) {
    //         return d["Value"];
    //     }
    // }

    // if
    vis.yScale.domain([0, d3.max(vis.filteredData, function (d) {
        if (!isNaN(d["Value"])) {
            // console.log(d["Value"]);
             {
                return d["Value"];
            }
        }
    })]);

    // Add x-axis
    vis.svg.select(".x-axis-group")
        .transition()
        .duration(transitionDuration)
        .call(vis.xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
            return "rotate(-45)"
        });
    // Add y-axis
    vis.svg.select(".y-axis-group")
        .transition()
        .duration(transitionDuration)
        .call(vis.yAxis);

    // Update y-axis label
    // vis.yAxisLabel.text(function () {
    //     return $("#select-box :selected").text();
    // });

    vis.yAxisLabel.text(measureSelection);
    $("#harbor-linchart-title").text($("#harbor-select-box :selected").text());

    if (locationSelection === "CIC2" || locationSelection === null) {
        $("#harbor-location-label").text("Average Over All Sample Sites");

    }
    // Use average data
    else {
        $("#harbor-location-label").text("Sample Site: " + locationSelection);

    }

    // console.log(vis.filteredData);


    // Draw line
    vis.line = d3.line()
        .x(function(d) { return vis.xScale(d["Date"]); })
        // The data is filtered for NaN values on measure-selection, so the line can be drawn here without checking for NaN
        .y(function(d) { return vis.yScale(d["Value"]); })
        .curve(d3.curveLinear);

    // console.log(vis.filteredData);

    vis.linePath.datum(vis.filteredData)
        .style("opacity", 0.0)
        .transition()
        .duration(transitionDuration)
        .attr("d", vis.line)
        .attr("fill", "none")
        // .attr("class", "line")
        .attr("stroke", mainColor)
        .on("end", function() {
            d3.select(this)
                .style("opacity", 1.0)
                .style("stroke", "#fff");
                // .style("stroke", mainColor);
        });


}

// function addTooltips() {
//
//     svg.selectAll("circle")
//         .data(filteredData, function (d) { return d.YEAR; });
        // .on("mouseover", function(d) {
        //     tooltip.transition()
        //         .duration(200)
        //         .style("opacity", .9);
        //     d3.select("#tooltip-line-1").html(d.EDITION);
        //     d3.select("#tooltip-line-2").html($("#select-box :selected").text() + ": " + d[selection]);
        //     tooltip
        // 		.style("left", (d3.event.pageX) + "px")
        //         .style("top", (d3.event.pageY) + "px")
        // 		.attr("fill", "black");
        // })
        // Second attempt with tooltips
        // .on("mouseover", tooltip.show)
        // .on("mouseout", function() {
        //     tooltip.transition()
        //         .duration(500)
        //         .style("opacity", 0);
        // })
        // Second attempt with tooltips
        // .on("mouseout", tooltip.hide);


HarborLinechartVis.prototype.filterTime = function() {
    var lowerBound = +document.getElementById("lower-bound").value;
    var upperBound = +document.getElementById("upper-bound").value;
    if (lowerBound === 0 || upperBound === 0) {
        console.log("Gotta reset");
        resetVisualization();
    } else {
        filteredData = data.filter(function (d) {
            var year = +formatDate(d.YEAR);
            return lowerBound < year && year < upperBound;
        });
    }
    // vis.updateVis();
}

// function resetVisualization() {
//     // Clear input fields
//     document.getElementById("lower-bound").value = "";
//     document.getElementById("upper-bound").value = "";
//
//     filteredData = data;
//     console.log(filteredData);
//     updateVisualization();
// }