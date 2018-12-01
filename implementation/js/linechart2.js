
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


var formatDate = d3.timeFormat("%Y");
var parseDate = d3.timeParse("%Y");

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
var selectedRegion = d3.select("#region-type").property("value");
var formatDate = d3.timeFormat("%Y");
var parseDate = d3.timeParse("%Y");

// Initialize data
loadData();

// Chesapeake Bay Data
var chesapeakeData = [];
var targetData = [];

function loadData() {
    d3.csv("data/chesapeakeBayLoads.csv", function(chesapeake) {
        // COMMD OUT - Nik
        // console.log(chesapeake);
        chesapeake.sort(function(a, b) { return a.Region - b.Region; });
        var regionBefore;
        var regionAfter;
        chesapeake.forEach(function(d) {
            // console.log(d.year);
            if (+d.Year === 2018) {
                regionBefore = d;
            }
            else if (+d.Year === 2025) {
                regionAfter = d;
            }
            if (+d.Year === 2025) {
                console.log(+d.year, "here");
                targetData.push(
                    {
                        "Region": regionBefore.Region,
                        "YearBefore": parseDate(regionBefore.Year),
                        "YearAfter": parseDate(regionAfter.Year),
                        "NitrogenBefore": +regionBefore.Nitrogen,
                        "NitrogenAfter": +regionAfter.Nitrogen,
                        "PhosphorousBefore": +regionBefore.Phosphorous,
                        "PhosphorousAfter": +regionAfter.Phosphorous,
                        "TSSBefore": +regionBefore.TSS,
                        "TSS": +regionAfter.TSS
                    }
                )
            }
            else if (+d.Year >= 2009) {
                chesapeakeData.push(
                    {
                    "Region": d.Region,
                    "Year": parseDate(d.Year),
                    "Nitrogen": +d.Nitrogen,
                    "Phosphorous": +d.Phosphorous,
                    "TSS": +d.TSS
                    }
                )
            }
            initializePredictions();
        //     chesapeakeData = chesapeake.map(function(d) {
        //         return {
        //             "Region": d.Region,
        //             "Year": parseDate(d.Year),
        //             "Nitrogen": +d.Nitrogen,
        //             "Phosphorous": +d.Phosphorous,
        //             "TSS": +d.TSS
        //         }
        //     });
        });
        // COMMD OUT - Nik
        // console.log(chesapeakeData);
    });

    setTimeout(updateChesapeake, 200);
}

var dottedLines = [];
function initializePredictions() {
    targetData.forEach(function(target) {
        console.log(target[selectedOption+"Before"]);
        var prediction = svg.append("line")
        //     .attr("x1", x(target.YearBefore))  //<<== change your code here
        //     .attr("y1", y(target[selectedOption+"Before"]))
        //     .attr("x2", x(target.YearAfter))  //<<== and here
        //     .attr("y2", y(target[selectedOption+"After"]))
            .attr("class", target.Region+"dottedLine " + target.Region+"line")
            .style("stroke-dasharray", ("3, 3"))
            .style("fill", "none");
        // .style("display", "none");
        dottedLines.push({
            "Region": target.Region,
            "Prediction": prediction
        });
    });
}

// Render visualization
function updateChesapeake() {



    // sort the data, define axes
    selectedOption = d3.select("#ranking-type").property("value");
    selectedRegion = d3.select("#region-type").property("value");
    var max_y;

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
    max_y = d3.max(chesapeakeData, function(d) {
        if (selectedRegion !== "All") {
            if (d.Region === "All" || d.Region !== selectedRegion) {
                return 0;
            }
            else {
                return d[selectedOption];
            }
        }
        else {
            if (d.Region === "All") {
                return 0;
            }
            else {
                return d[selectedOption];
            }
        }
    });
    x.domain([
        d3.min(chesapeakeData, function(d) {
            if (d.Region === selectedRegion) {
                console.log(d.Year);
                return d.Year;
            }
        }),
        d3.max(targetData, function(d) {
            if (d.Region === selectedRegion) {
                console.log(d.YearAfter);
                return d.YearAfter;
            }
        })
    ]);
    // x.domain(d3.extent(chesapeakeData, function(d) {
    //     if (d.Region === selectedRegion) {
    //         return d.Year;
    //     }
    // }));

    y.domain([0, max_y]);

    // console.log(targetData);
    // console.log(chesapeakeData);
    // console.log(WVdata);
    svg.append("line")
        .attr("x1", x(parseDate("2025")))  //<<== change your code here
        .attr("y1", y(0))
        .attr("x2", x(parseDate("2025")))  //<<== and here
        .attr("y2", y(max_y))
        .attr("class", "targetline")
        .style("stroke-dasharray", ("3, 3"))
        .style("stroke-width", 2)
        .style("stroke", "red")
        .style("fill", "none");

    // targetData.forEach(function(target) {
    //     console.log(target[selectedOption+"Before"]);
    //     svg.append("line")
    //     // svg.selectAll(".dottedline").append("line")
    //         .attr("x1", x(target.YearBefore))  //<<== change your code here
    //         .attr("y1", y(target[selectedOption+"Before"]))
    //         .attr("x2", x(target.YearAfter))  //<<== and here
    //         .attr("y2", y(target[selectedOption+"After"]))
    //         .attr("class", target.Region+"dottedLine " + target.Region+"line")
    //         .style("stroke-dasharray", ("3, 3"))
    //         .style("fill", "none");
    //         // .style("display", "none");
    // });

    //Update X axis
    svg.select(".x-axis")
        .call(xAxis);

    //Update Y axis
    svg.select(".y-axis")
        .call(yAxis);

    svg.select(".x-label").text("Year");
    svg.select(".y-label").text(selectedOption + " (lbs/year)");

    var DCcircle = svg.selectAll(".DCcircle")
        .data(DCdata);
    var DEcircle = svg.selectAll(".DEcircle")
        .data(DEdata);
    var MDcircle = svg.selectAll(".MDcircle")
        .data(MDdata);
    var NYcircle = svg.selectAll(".NYcircle")
        .data(NYdata);
    var PAcircle = svg.selectAll(".PAcircle")
        .data(PAdata);
    var VAcircle = svg.selectAll(".VAcircle")
        .data(VAdata);
    var WVcircle = svg.selectAll(".WVcircle")
        .data(WVdata);

    // draw lines for chart
    DCnewLine.datum(DCdata)
        .attr("class", "DCline")
        .attr("d", DCline);
    DEnewLine.datum(DEdata)
        .attr("class", "DEline")
        .attr("d", DEline);
    MDnewLine.datum(MDdata)
        .attr("class", "MDline")
        .attr("d", MDline);
    NYnewLine.datum(NYdata)
        .attr("class", "NYline")
        .attr("d", NYline);
    PAnewLine.datum(PAdata)
        .attr("class", "PAline")
        .attr("d", PAline);
    VAnewLine.datum(VAdata)
        .attr("class", "VAline")
        .attr("d", VAline);
    WVnewLine.datum(WVdata)
        .attr("class", "WVline")
        .attr("d", WVline);

    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) { return "Region: " + d.Region + ", Year: " + formatDate(d.Year) + "<br>" + selectedOption + ": " + d[selectedOption] + " lbs/year"; });
    svg.call(tool_tip);



    if (selectedRegion === "All") {




        // create line functions for line chart
        DCline = d3.line()
            .x(function(d) { return x(d.Year); })
            .y(function(d) { return y(d[selectedOption]); });
        DEline = d3.line()
            .x(function(d) { return x(d.Year); })
            .y(function(d) { return y(d[selectedOption]); });
        MDline = d3.line()
            .x(function(d) { return x(d.Year); })
            .y(function(d) { return y(d[selectedOption]); });
        NYline = d3.line()
            .x(function(d) { return x(d.Year); })
            .y(function(d) { return y(d[selectedOption]); });
        PAline = d3.line()
            .x(function(d) { return x(d.Year); })
            .y(function(d) { return y(d[selectedOption]); });
        VAline = d3.line()
            .x(function(d) { return x(d.Year); })
            .y(function(d) { return y(d[selectedOption]); });
        WVline = d3.line()
            .x(function(d) { return x(d.Year); })
            .y(function(d) { return y(d[selectedOption]); });

        // dottedLines.forEach(function(line) {
        // for
        //     line.prediction
        //         .attr("x1", x(line.Region.YearBefore))  //<<== change your code here
        //         .attr("y1", y(target[selectedOption+"Before"]))
        //         .attr("x2", x(target.YearAfter))  //<<== and here
        //         .attr("y2", y(target[selectedOption+"After"]))
        // })

        targetData.forEach(function(target) {
            console.log(target[selectedOption+"Before"]);
            svg.append("line")
            // svg.selectAll(".dottedline").append("line")
                .attr("x1", x(target.YearBefore))  //<<== change your code here
                .attr("y1", y(target[selectedOption+"Before"]))
                .attr("x2", x(target.YearAfter))  //<<== and here
                .attr("y2", y(target[selectedOption+"After"]))
                .attr("class", target.Region+"dottedLine " + target.Region+"line")
                .style("stroke-dasharray", ("3, 3"))
                .style("fill", "none");
            // .style("display", "none");
        });

        // create circles for chart
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
    else if (selectedRegion === "DC") {

        DCnewLine.datum(DCdata)
            .attr("class", "DCline")
            .attr("d", DCline);

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

        var DCdotted = svg.select(".DCdottedLine")
            .attr("y1", y(targetData[0][selectedOption+"Before"]))
            .attr("y2", y(targetData[0][selectedOption+"After"]));

        DEnewLine.remove();
        DEcircle.remove();
        DEnewLine = svg.append("path");

        MDnewLine.remove();
        MDcircle.remove();
        MDnewLine = svg.append("path");

        NYnewLine.remove();
        NYcircle.remove();
        NYnewLine = svg.append("path");

        PAnewLine.remove();
        PAcircle.remove();
        PAnewLine = svg.append("path");

        VAnewLine.remove();
        VAcircle.remove();
        VAnewLine = svg.append("path");

        WVnewLine.remove();
        WVcircle.remove();
        WVnewLine = svg.append("path");

    }
    else if (selectedRegion === "DE") {

        DEnewLine.datum(DEdata)
            .attr("class", "DEline")
            .attr("d", DEline);

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


        DCnewLine.remove();
        DCcircle.remove();
        DCnewLine = svg.append("path");

        MDnewLine.remove();
        MDcircle.remove();
        MDnewLine = svg.append("path");

        NYnewLine.remove();
        NYcircle.remove();
        NYnewLine = svg.append("path");

        PAnewLine.remove();
        PAcircle.remove();
        PAnewLine = svg.append("path");

        VAnewLine.remove();
        VAcircle.remove();
        VAnewLine = svg.append("path");

        WVnewLine.remove();
        WVcircle.remove();
        WVnewLine = svg.append("path");

    }
    else if (selectedRegion === "MD") {

        MDnewLine.datum(MDdata)
            .attr("class", "MDline")
            .attr("d", MDline);

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

        DCnewLine.remove();
        DCcircle.remove();
        DCnewLine = svg.append("path");

        DEnewLine.remove();
        DEcircle.remove();
        DEnewLine = svg.append("path");

        NYnewLine.remove();
        NYcircle.remove();
        NYnewLine = svg.append("path");

        PAnewLine.remove();
        PAcircle.remove();
        PAnewLine = svg.append("path");

        VAnewLine.remove();
        VAcircle.remove();
        VAnewLine = svg.append("path");

        WVnewLine.remove();
        WVcircle.remove();
        WVnewLine = svg.append("path");

    }
    else if (selectedRegion === "NY") {

        NYnewLine.datum(NYdata)
            .attr("class", "NYline")
            .attr("d", NYline);

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


        DCnewLine.remove();
        DCcircle.remove();
        DCnewLine = svg.append("path");

        DEnewLine.remove();
        DEcircle.remove();
        DEnewLine = svg.append("path");

        MDnewLine.remove();
        MDcircle.remove();
        MDnewLine = svg.append("path");

        PAnewLine.remove();
        PAcircle.remove();
        PAnewLine = svg.append("path");

        VAnewLine.remove();
        VAcircle.remove();
        VAnewLine = svg.append("path");

        WVnewLine.remove();
        WVcircle.remove();
        WVnewLine = svg.append("path");

    }
    else if (selectedRegion === "PA") {

        PAnewLine.datum(PAdata)
            .attr("class", "PAline")
            .attr("d", PAline);

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


        DCnewLine.remove();
        DCcircle.remove();
        DCnewLine = svg.append("path");

        DEnewLine.remove();
        DEcircle.remove();
        DEnewLine = svg.append("path");

        MDnewLine.remove();
        MDcircle.remove();
        MDnewLine = svg.append("path");

        NYnewLine.remove();
        NYcircle.remove();
        NYnewLine = svg.append("path");

        VAnewLine.remove();
        VAcircle.remove();
        VAnewLine = svg.append("path");

        WVnewLine.remove();
        WVcircle.remove();
        WVnewLine = svg.append("path");

    }
    else if (selectedRegion === "VA") {

        VAnewLine.datum(VAdata)
            .attr("class", "VAline")
            .attr("d", VAline);

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


        DCnewLine.remove();
        DCcircle.remove();
        DCnewLine = svg.append("path");

        DEnewLine.remove();
        DEcircle.remove();
        DEnewLine = svg.append("path");

        MDnewLine.remove();
        MDcircle.remove();
        MDnewLine = svg.append("path");

        NYnewLine.remove();
        NYcircle.remove();
        NYnewLine = svg.append("path");

        PAnewLine.remove();
        PAcircle.remove();
        PAnewLine = svg.append("path");

        WVnewLine.remove();
        WVcircle.remove();
        WVnewLine = svg.append("path");

    }
    else if (selectedRegion === "WV") {

        WVnewLine.datum(WVdata)
            .attr("class", "WVline")
            .attr("d", WVline);

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


        DCnewLine.remove();
        DCcircle.remove();
        DCnewLine = svg.append("path");

        DEnewLine.remove();
        DEcircle.remove();
        DEnewLine = svg.append("path");

        MDnewLine.remove();
        MDcircle.remove();
        MDnewLine = svg.append("path");

        NYnewLine.remove();
        NYcircle.remove();
        NYnewLine = svg.append("path");

        PAnewLine.remove();
        PAcircle.remove();
        PAnewLine = svg.append("path");

        VAnewLine.remove();
        VAcircle.remove();
        VAnewLine = svg.append("path");

    }




}
