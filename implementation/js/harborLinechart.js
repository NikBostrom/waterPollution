/*
 * HarborLinechartVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _locationData				-- the list of locations where measurements in the NU Harbor were taken
 */

HarborLinechartVis = function(_parentElement, _locationData, _harborData2017){
    this.parentElement = _parentElement;
    this.locations = _locationData;
    this.harborData = _harborData2017;

    this.initVis();
};

HarborLinechartVis.prototype.initVis = function() {
    var vis = this;

    vis.updateVis();
}

HarborLinechartVis.prototype.updateVis = function() {

}

// SVG drawing area
var margin = {top: 40, right: 40, bottom: 100, left: 60};

var width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Date parser
// Convert current date to a human-readable string
var formatDate = d3.timeFormat("%Y");
// Convert a string back to a date
var parseDate = d3.timeParse("%Y");

// Global variables
var data;
var filteredData;
// Scales
var xScale = d3.scaleTime()
    .range([0, width]);
var yScale = d3.scaleLinear()
    .range([height, 0]);

// Axes
var xAxis = d3.axisBottom().scale(xScale);
var xAxisGroup = svg.append("g")
    .attr("class", "x-axis-group axis")
    .attr("transform", "translate(0," + height + ")");
var xAxisLabel = svg.append("text")
    .attr("class", "axis-label x-axis-label")
    .attr("transform", "translate(" + (width / 2) + ", " + (height + 0.5 * margin.bottom) + ")")
    .text("Date");

var yAxis = d3.axisLeft().scale(yScale);
var yAxisGroup = svg.append("g")
    .attr("class", "y-axis-group axis");
var yAxisLabel = svg.append("text")
    .attr("class", "axis-label y-axis-label")
    .attr("transform", "translate(" + -(margin.left * 3/4) + "," + (height / 2) + ") rotate(-90)");
// Line
// Add upper boundary line
var line;
var linePath = svg.append("path");

// Selection-box value
var selection;

// Second attempt with tooltips
var tooltip = d3.tip()
    .attr("class", "d3-tip")
    .attr("id", "tooltip")
    .offset([-10, 0])
    .html(function (d) {
        var tooltipText = d.EDITION + "<br>" + $("#select-box :selected").text() + ": " + d[selection];
        return tooltipText;
    });

// Tooltips
svg.call(tooltip);

// Slider
// var slider = d3.select("#slider");

// $( document ).ready(function() {
//     noUISlider.create(slider, {
//         start: [20, 80],
//         connect: true,
//         range: {
//             'min': 0,
//             'max': 100
//         }
//     });
// });

// Initialize data
loadData();

// Animations
var transitionDuration = 800;
var mainColor = "black";
var transitionColor = "#00664d";

// Load CSV file
function loadData() {
    d3.csv("data/fifa-world-cup.csv", function(error, csv) {

        csv.forEach(function(d){
            // Convert string to 'date object'
            d.YEAR = parseDate(d.YEAR);

            // Convert numeric values to 'numbers'
            d.TEAMS = +d.TEAMS;
            d.MATCHES = +d.MATCHES;
            d.GOALS = +d.GOALS;
            d.AVERAGE_GOALS = +d.AVERAGE_GOALS;
            d.AVERAGE_ATTENDANCE = +d.AVERAGE_ATTENDANCE;
        });

        // Store csv data in global variable
        data = csv;
        filteredData = data;

        // Draw the visualization for the first time
        updateVisualization();
    });
}


// Render visualization
function updateVisualization() {
    d3.select("#single-edition-stats").style("visibility", "hidden");

    selection = d3.select("#select-box").property("value");

    // Dynamically update the domains based on user selection
    xScale.domain(d3.extent(filteredData, function (d) {
        return d.YEAR;
    }));
    // console.log(xScale(data[1].YEAR));
    yScale.domain([0, d3.max(filteredData, function (d) {
        return d[selection];
    })]);

    // Add x-axis
    svg.select(".x-axis-group")
        .transition()
        .duration(transitionDuration)
        .call(xAxis);
    // Add y-axis
    svg.select(".y-axis-group")
        .transition()
        .duration(transitionDuration)
        .call(yAxis);

    // Update y-axis label
    yAxisLabel.text(function () {
        return $("#select-box :selected").text();
    });

    // Draw line
    line = d3.line()
        .x(function(d) { return xScale(d.YEAR); })
        .y(function(d) { return yScale(d[selection]); })
        .curve(d3.curveLinear);

    linePath.datum(filteredData)
        .style("opacity", 0.0)
        .transition()
        .duration(transitionDuration)
        .attr("d", line)
        .attr("fill", "none")
        // .attr("class", "line")
        .attr("stroke", mainColor)
        .on("end", function() {
            d3.select(this)
                .style("opacity", 1.0)
                .style("stroke", mainColor);
        });

    // Circles for data points
    var circles = svg.selectAll("circle")
        .data(filteredData, function (d) { return d.YEAR; });
    // Enter selection
    circles.enter()
        .append("circle")
        // Update selection (merge with enter selection)
        .merge(circles)
        // Show single FIFA World Cup edition info
        .on("click", function (d) {
            showEdition(d)
        })
        .style("opacity", 0.5)
        .style("fill", transitionColor)
        .style("stroke", transitionColor)
        .transition()
        .duration(transitionDuration)
        .attr("cx", function(d) { return xScale(d.YEAR); })
        .attr("cy", function(d) { return yScale(d[selection]); })
        .attr("r", 4)
        .attr("fill", "white")
        .attr("stroke", mainColor)
        .on("end", function() {
            d3.select(this)
                .style("opacity", 1.0)
                .style("fill", mainColor)
                .style("stroke", mainColor);
        })

    // Exit selection
    circles.exit().remove();

    // Add tooltips
    addTooltips();
}

function addTooltips() {

    svg.selectAll("circle")
        .data(filteredData, function (d) { return d.YEAR; })
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
        .on("mouseover", tooltip.show)
        // .on("mouseout", function() {
        //     tooltip.transition()
        //         .duration(500)
        //         .style("opacity", 0);
        // })
        // Second attempt with tooltips
        .on("mouseout", tooltip.hide);
}

function filterTime() {
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
    updateVisualization();
}

function resetVisualization() {
    // Clear input fields
    document.getElementById("lower-bound").value = "";
    document.getElementById("upper-bound").value = "";

    filteredData = data;
    console.log(filteredData);
    updateVisualization();
}

// Show details for a specific FIFA World Cup
function showEdition(d) {
    d3.select("#single-edition-stats").style("visibility", "visible");
    d3.select("#single-edition-stats-header")
        .text(d.EDITION);
    d3.select("#winner")
        .text(d.WINNER);
    d3.select("#goals")
        .text(d.GOALS);
    d3.select("#average-goals")
        .text(d.AVERAGE_GOALS);
    d3.select("#matches")
        .text(d.MATCHES);
    d3.select("#teams")
        .text(d.TEAMS);
    d3.select("#average-attendance")
        .text(d.AVERAGE_ATTENDANCE);
}
