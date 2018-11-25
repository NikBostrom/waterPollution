
var margin = { top: 40, right: 40, bottom: 60, left: 100 };

var width = 800 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;


// SVG drawing area
// vis.svg = d3.select("#" + vis.parentElement).append("svg")
var svg = d3.select("#chesapeakeChart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Scales
var x = d3.scaleTime()
    .rangeRound([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);


//Define X axis
var xAxis = d3.axisBottom()
    .scale(x);


//Define Y axis
var yAxis = d3.axisLeft()
    .scale(y);

//Create X axis
svg.append("g")
    .attr("class", "x-axis axis")
    .attr("transform", "translate(0," + height + ")");


//Create Y axis
svg.append("g")
    .attr("class", "y-axis axis");

svg.append("text")
    .attr("class", "x-label")
    .attr("transform", "translate(" + (width/2) + ", " + (height + 9*margin.bottom/10) + ")")
    .style("text-anchor", "middle")
    .text("Date");
svg.append("text")
    .attr("class", "y-label")
    .attr("transform", "translate(-70, " + (0-5) + ")")
    .text("Goals");

// create line function for line chart
var DCline = d3.line()
    .x(function(d) { return x(d.Year); })
    .y(function(d) { return y(d[selectedOption]); });
var DCnewLine = svg.append("path");

var DEline = d3.line()
    .x(function(d) { return x(d.Year); })
    .y(function(d) { return y(d[selectedOption]); });
var DEnewLine = svg.append("path");

var MDline = d3.line()
    .x(function(d) { return x(d.Year); })
    .y(function(d) { return y(d[selectedOption]); });
var MDnewLine = svg.append("path");

var NYline = d3.line()
    .x(function(d) { return x(d.Year); })
    .y(function(d) { return y(d[selectedOption]); });
var NYnewLine = svg.append("path");

var PAline = d3.line()
    .x(function(d) { return x(d.Year); })
    .y(function(d) { return y(d[selectedOption]); });
var PAnewLine = svg.append("path");

var VAline = d3.line()
    .x(function(d) { return x(d.Year); })
    .y(function(d) { return y(d[selectedOption]); });
var VAnewLine = svg.append("path");

var WVline = d3.line()
    .x(function(d) { return x(d.Year); })
    .y(function(d) { return y(d[selectedOption]); });
var WVnewLine = svg.append("path");





var selectedOption = d3.select("#ranking-type").property("value");
var formatDate = d3.timeFormat("%Y");
var parseDate = d3.timeParse("%Y");

// Initialize data
loadData();

// Chesapeake Bay Data
var chesapeakeData;

function loadData() {
    d3.csv("data/chesapeakeBayLoads.csv", function(chesapeake) {
        // COMMD OUT - Nik
        // console.log(chesapeake);
        chesapeakeData = chesapeake.map(function(d) {
            return {
                "Region": d.Region,
                "Year": parseDate(d.Year),
                "Nitrogen": +d.Nitrogen,
                "Phosphorous": +d.Phosphorous,
                "TSS": +d.TSS
            }
        });
        // COMMD OUT - Nik
        // console.log(chesapeakeData);
    });

    setTimeout(updateChesapeake, 200);
}


// Render visualization
function updateChesapeake() {



    // sort the data, define axes
    selectedOption = d3.select("#ranking-type").property("value");

    chesapeakeData.sort(function(a, b) { return a.Year - b.Year; });
    var DCdata = chesapeakeData.filter(function(d) {
        return d.Region === "DC";
    });
    var DEdata = chesapeakeData.filter(function(d) {
        return d.Region === "DE";
    });
    var MDdata = chesapeakeData.filter(function(d) {
        return d.Region === "MD";
    });
    var NYdata = chesapeakeData.filter(function(d) {
        return d.Region === "NY";
    });
    var PAdata = chesapeakeData.filter(function(d) {
        return d.Region === "PA";
    });
    var VAdata = chesapeakeData.filter(function(d) {
        return d.Region === "VA";
    });
    var WVdata = chesapeakeData.filter(function(d) {
        return d.Region === "WV";
    });
    x.domain(d3.extent(chesapeakeData, function(d) { return d.Year; } ));
    y.domain([0, d3.max(chesapeakeData, function(d) {
        if (d.Region === "All") {
            return 0;
        }
        else {
            return d[selectedOption];
        }
    })]);

    //Update X axis
    svg.select(".x-axis")
        .call(xAxis);

    //Update Y axis
    svg.select(".y-axis")
        .call(yAxis);

    svg.select(".x-label").text("Year");
    svg.select(".y-label").text(selectedOption + " (lbs/year)");

    // create line function for line chart
    DCline = d3.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d[selectedOption]); });
    // draw line for chart
    DCnewLine.datum(DCdata)
        .attr("class", "DCline")
        .attr("d", DCline);

    // create line function for line chart
    DEline = d3.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d[selectedOption]); });
    // draw line for chart
    DEnewLine.datum(DEdata)
        .attr("class", "DEline")
        .attr("d", DEline);

    // create line function for line chart
    MDline = d3.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d[selectedOption]); });
    // draw line for chart
    MDnewLine.datum(MDdata)
        .attr("class", "MDline")
        .attr("d", MDline);

    // create line function for line chart
    NYline = d3.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d[selectedOption]); });
    // draw line for chart
    NYnewLine.datum(NYdata)
        .attr("class", "NYline")
        .attr("d", NYline);

    // create line function for line chart
    PAline = d3.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d[selectedOption]); });
    // draw line for chart
    PAnewLine.datum(PAdata)
        .attr("class", "PAline")
        .attr("d", PAline);

    // create line function for line chart
    VAline = d3.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d[selectedOption]); });
    // draw line for chart
    VAnewLine.datum(VAdata)
        .attr("class", "VAline")
        .attr("d", VAline);

    // create line function for line chart
    WVline = d3.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d[selectedOption]); });
    // draw line for chart
    WVnewLine.datum(WVdata)
        .attr("class", "WVline")
        .attr("d", WVline);

    // create tooltips for circles
    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) { return "Region: " + d.Region + ", Year: " + formatDate(d.Year) + "<br>" + selectedOption + ": " + d[selectedOption] + " lbs/year"; });
    svg.call(tool_tip);

    // Data-join (circle now contains the update selection)
    var DCcircle = svg.selectAll(".DCcircle")
        .data(DCdata);

    // Enter (initialize the newly added elements)
    DCcircle.enter().append("circle")
        .attr("class", "tooltip-circle DCcircle")
        // Enter and Update (set the dynamic properties of the elements)
        .merge(DCcircle)
        .attr("r", 4)
        .attr("cx", function(d) { return x(d.Year); })
        .attr("cy", function(d) { return y(d[selectedOption]); })
        .style("fill", function(d) {
            if (formatDate(d.Year) === "2025") {
                return "yellow";
            }
            else {
                return "lightgreen";
            }
        })
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide);

    // Exit
    DCcircle.exit().remove();

    // Data-join (circle now contains the update selection)
    var DEcircle = svg.selectAll(".DEcircle")
        .data(DEdata);

    // Enter (initialize the newly added elements)
    DEcircle.enter().append("circle")
        .attr("class", "tooltip-circle DEcircle")
        // Enter and Update (set the dynamic properties of the elements)
        .merge(DEcircle)
        .attr("r", 4)
        .attr("cx", function(d) { return x(d.Year); })
        .attr("cy", function(d) { return y(d[selectedOption]); })
        .style("fill", function(d) {
            if (formatDate(d.Year) === "2025") {
                return "yellow";
            }
            else {
                return "lightcoral";
            }
        })
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide);

    // Exit
    DEcircle.exit().remove();

    // Data-join (circle now contains the update selection)
    var MDcircle = svg.selectAll(".MDcircle")
        .data(MDdata);

    // Enter (initialize the newly added elements)
    MDcircle.enter().append("circle")
        .attr("class", "tooltip-circle MDcircle")
        // Enter and Update (set the dynamic properties of the elements)
        .merge(MDcircle)
        .attr("r", 4)
        .attr("cx", function(d) { return x(d.Year); })
        .attr("cy", function(d) { return y(d[selectedOption]); })
        .style("fill", function(d) {
            if (formatDate(d.Year) === "2025") {
                return "yellow";
            }
            else {
                return "darkblue";
            }
        })
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide);

    // Exit
    MDcircle.exit().remove();

    // Data-join (circle now contains the update selection)
    var NYcircle = svg.selectAll(".NYcircle")
        .data(NYdata);

    // Enter (initialize the newly added elements)
    NYcircle.enter().append("circle")
        .attr("class", "tooltip-circle NYcircle")
        // Enter and Update (set the dynamic properties of the elements)
        .merge(NYcircle)
        .attr("r", 4)
        .attr("cx", function(d) { return x(d.Year); })
        .attr("cy", function(d) { return y(d[selectedOption]); })
        .style("fill", function(d) {
            if (formatDate(d.Year) === "2025") {
                return "yellow";
            }
            else {
                return "magenta";
            }
        })
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide);

    // Exit
    NYcircle.exit().remove();

    // Data-join (circle now contains the update selection)
    var PAcircle = svg.selectAll(".PAcircle")
        .data(PAdata);

    // Enter (initialize the newly added elements)
    PAcircle.enter().append("circle")
        .attr("class", "tooltip-circle PAcircle")
        // Enter and Update (set the dynamic properties of the elements)
        .merge(PAcircle)
        .attr("r", 4)
        .attr("cx", function(d) { return x(d.Year); })
        .attr("cy", function(d) { return y(d[selectedOption]); })
        .style("fill", function(d) {
            if (formatDate(d.Year) === "2025") {
                return "yellow";
            }
            else {
                return "darkorange";
            }
        })
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide);

    // Exit
    PAcircle.exit().remove();

    // Data-join (circle now contains the update selection)
    var VAcircle = svg.selectAll(".VAcircle")
        .data(VAdata);

    // Enter (initialize the newly added elements)
    VAcircle.enter().append("circle")
        .attr("class", "tooltip-circle VAcircle")
        // Enter and Update (set the dynamic properties of the elements)
        .merge(VAcircle)
        .attr("r", 4)
        .attr("cx", function(d) { return x(d.Year); })
        .attr("cy", function(d) { return y(d[selectedOption]); })
        .style("fill", function(d) {
            if (formatDate(d.Year) === "2025") {
                return "yellow";
            }
            else {
                return "hotpink";
            }
        })
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide);

    // Exit
    VAcircle.exit().remove();

    // Data-join (circle now contains the update selection)
    var WVcircle = svg.selectAll(".WVcircle")
        .data(WVdata);

    // Enter (initialize the newly added elements)
    WVcircle.enter().append("circle")
        .attr("class", "tooltip-circle WVcircle")
        // Enter and Update (set the dynamic properties of the elements)
        .merge(WVcircle)
        .attr("r", 4)
        .attr("cx", function(d) { return x(d.Year); })
        .attr("cy", function(d) { return y(d[selectedOption]); })
        .style("fill", function(d) {
            if (formatDate(d.Year) === "2025") {
                return "yellow";
            }
            else {
                return "#5D77FF";
            }
        })
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide);

    // Exit
    WVcircle.exit().remove();
    
    
    

}
