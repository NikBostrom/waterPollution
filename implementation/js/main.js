colorPageRows();

// Function to convert date objects to strings or reverse
var dateFormatter = d3.timeFormat("%Y-%m-%d");
var dateParser = d3.timeParse("%Y-%m-%d");
var harborTimeSlider;
var harborLinechartVis;

queue()
    .defer(d3.csv,"data/water_conditions.csv")
    .defer(d3.json, "data/usStatesOutline-5m.json")
    .defer(d3.json, "data/world-110m.json")
    .defer(d3.json,"data/waterdata.json")
    .defer(d3.csv,"data/assess_nation.csv") // assess_nation.csv
    .defer(d3.json,"data/us_states.json")
    // .defer(d3.csv,"data/chesapeakeBayLoads.csv")
    .defer(d3.json, "data/us-state-centroids.json")

    .defer(d3.json, "data/regionsOutline.json")
    .defer(d3.json, "data/usStatesOutlineWithRegion.json")


    .await(createVis);

/*

region_data = {
    "Region_1": {
        "Total_Nitrogen": [],
        "Total_Phosphorus": [],
        "Turbidity": [],
    },
    "Region_2": ...,
    "Region_3": ...,
}

state_data = {
    "FL": {
        "Total_Nitrogen": [],
        "Total_Phosphorus": [],
        "Turbidity": [],
    },
    "GA": ...,
    "MT": ...,
}
*/

region_data = {};
state_data = {};
nyHarborData = [];


function createVis(error, water_conditions, usOutline, world, water_quality, waterAssess, states, stateCentroids, mergedStates, statesWithRegion) {

    if(error) throw error;

    // clean water-conditions data
    water_data = water_conditions.map(function(d,i) {
       return {
           "Region": d.EPA_REG,
           "Lat": +d.LAT_DD,
           "Long": +d.LON_DD,
           "State": d.ST,
           "Total_Phosphorus": +d.Total_Phosphorous,
           "Total_Nitrogen": +d.Total_Nitrogen,
           "Turbidity": +d.TURB,
           "Dissolved_Org_Carbon": +d.DOC,
       }
    });


    createDataSet(water_data, state_data, "State");
    createDataSet(water_data, region_data, "Region");

    getAverage(state_data);
    getAverage(region_data);

    // Clean assessment data
    waterAssess.map(function(d) {
        d.Cycle = +d.Cycle;
        d.Region = +d.Region;
        d['Water Size'] = +d['Water Size'];
    });


  // TODO: what is this.......
    // Nest data by state
//     var waterAssessByState = d3.nest()
//         // .key(function(d) { return d.Region })
//         .key(function(d) { return d.State })
//         .key(function(d) { return d['Water Status']})
//         // .rollup(function(leaves) { console.log(leaves); return {"state": leaves[0].State, "count": leaves.length}; })
//         .rollup(function(leaves) { return leaves.length })
//         .entries(waterAssess); // for array
//         // .object(water_assess); // for object
//     //COMMD OUT
//     // console.log(waterAssessByState);


    // NY Harbor Data - Takes a long time to load - process asynchronously
    d3.csv("data/harbor-water-quality.csv", function(error, _nyHarborDataMessy) {
        if(error) throw error;
        // console.log(_nyHarborDataMessy);
        d3.csv("data/harbor_sampling_ytd_2017.csv", function(error, _nyH2017) {
            if(error) throw error;
            nyHarborData = _nyH2017;
            // console.log(_nyH2017);
            createHarborVis(_nyHarborDataMessy, nyHarborData);
        });
    });


    // console.log(chesapeake);
    // chesapeakeData = chesapeake.map(function(d) {
    //     return {
    //         "Region": d.Region,
    //         "Year": d3.timeParse("%Y")(d.Year),
    //         "Nitrogen": +d.Nitrogen,
    //         "Phosphorous": +d.Phosphorous,
    //         "TSS": +d.TSS
    //     }
    // });
    // console.log(chesapeakeData);

    // var chesapeakeVis = new LineChart("chesapeakeBay", chesapeakeData)

    // Create JSON with states as keys and abbreviations for values
    function swap(json) {
        var ret = {};
        for (var key in json) {
            ret[json[key]] = key;
        }
        return ret;
    }
    var abbToState = swap(states);


    // var regionsVis = new RegionsVis("regions-vis", waterAssess, usOutline, stateCentroids, states, abbToState, mergedStates, statesWithRegion, "assess-legend");
    // var mapVis = new MapVis("map-vis", water_data, usOutline, state_data, states);

    d3.selectAll("text").style("fill", "white");
    d3.selectAll(".axis").attr("stroke", "white");
    d3.selectAll(".domain").attr("stroke", "white");


}

function createDataSet(water_data, new_data, key) {
    water_data.map(function(d, i) {

        if (new_data[d[key]]) {
            new_data[d[key]].Total_Nitrogen.push(d.Total_Nitrogen);
            new_data[d[key]].Total_Phosphorus.push(d.Total_Phosphorus);
            new_data[d[key]].Turbidity.push(d.Turbidity);
        } else {
            new_data[d[key]] = {
                "Total_Nitrogen": [d.Total_Nitrogen],
                "Total_Phosphorus": [d.Total_Phosphorus],
                "Turbidity": [d.Turbidity],
            }
        }
        return(new_data);
    });


}

function getAverage(data) {

    Object.keys(data).forEach(function(d, i) {
        data[d].avg_Total_Nitrogen = average(data[d].Total_Nitrogen);
        data[d].avg_Total_Phosphorus = average(data[d].Total_Phosphorus);
        data[d].avg_Turbidity = average(data[d].Turbidity);

    });
    return data;
}

function average(list) {
    return (list.reduce(getSum) / list.length);
}

function getSum(total, num) {
    return total + num;
}



function createHarborVis(_nyHarborDataMessy, nyHarborData) {
    wrangleHarborData(_nyHarborDataMessy, nyHarborData);

    // console.log(locations);
    // console.log(nyHarborData);

    var harborEventHandler = {};

    // var harborMapVis = new HarborMapVis("harbor-map", harborLocations, harborEventHandler);
    // console.log(nyHarborData);
    harborLinechartVis = new HarborLinechartVis("harbor-linechart", harborLocations);
    harborTimeSlider = new HarborTimeSlider("harbor-time-slider", harborLocations);


    var selectionBox = d3.select("#harbor-select-box");
    // console.log(d3.select("#harbor-select-box").property("value"));
    // console.log(d3.select("#ranking-type").property("value"));

    selectionBox.on("change", function() {
        $(harborEventHandler).trigger("harbor-filter-selection-changed")
    });

    $(harborEventHandler).bind("harbor-filter-selection-changed", function(_event) {
        // console.log("Oh hey you changed the selection to:", selectionBox.property("value"));
        // harborMapVis.updateVis(selectionBox.property("value"));
        harborLinechartVis.updateVis(selectionBox.property("value"), null);
    });
    $(harborEventHandler).bind("sample-location-clicked-on-map", function(_event, markerProperties) {
        console.log(_event);
        console.log(markerProperties);
        console.log(markerProperties.Site);
        harborLinechartVis.updateVis(selectionBox.property("value"), markerProperties.Site);
    });


}

function colorPageRows() {
    let baseColorHue = 182;
    let baseColorSaturation = 76;

    // Change these values to determine the color range for the rows
    let baseColorLightness = 15;
    let endColorLightness = 45;

    let numRows = $(".color-bar").length;
    let lightnessIncrease = (endColorLightness - baseColorLightness) / numRows;

    // console.log("There are " + numRows + " rows");
    // console.log("The lightness should increase by " + lightnessIncrease + "%.");

    d3.selectAll(".color-bar")
        .style('background-color', function(_, i) {
            let newColor = "hsla(" + baseColorHue + "," + baseColorSaturation + "%," + (baseColorLightness + (i * lightnessIncrease)) + "%)";
            // console.log(newColor);
            return newColor;
        });
}

function brushedHarborTimeSlider() {
    console.log("Hey");

    var duration = 1;
    // maxstep = d3.max(refugeemap.campdata, function(d){return d.date;}),
    // minstep = d3.min(refugeemap.campdata, function(d){return d.date;});

    var minstep = d3.min(harborTimeSlider.filteredData, function(d) {return d["Date"]});
    var maxstep = d3.max(harborTimeSlider.filteredData, function(d) {return d["Date"]});

    // This is what happens when the play button is clicked
    // if (refugeemap.clickevent == true) {
    //
    //     if (refugeemap.running == true) {
    //         $("#playcamp").html("<i class='fa fa-play fa-lg'></i>");
    //         refugeemap.running = false;
    //         clearInterval(timer);
    //         refugeemap.clickevent = false;
    //         harborTimeSlider.clickevent = false;
    //     }
    //
    //     else
    //     if (refugeemap.running == false) {
    //         refugeemap.clickevent = false;
    //         harborTimeSlider.clickevent = false;
    //         $("#playcamp").html("<i class='fa fa-pause fa-lg'></i>");
    //
    //         timer = setInterval(function () {
    //             if (refugeemap.currentTime < maxstep) {
    //                 refugeemap.currentTime = d3.time.day.offset(refugeemap.currentTime, 5);
    //                 harborTimeSlider.currentTime = refugeemap.currentTime;
    //                 refugeemap.wrangleData();
    //                 harborTimeSlider.handle.select("rect").attr("x", harborTimeSlider.xContext(refugeemap.currentTime));
    //                 harborTimeSlider.handle.select("text").text(formatDate(refugeemap.currentTime));
    //                 harborTimeSlider.handle.select("text").attr("x", harborTimeSlider.xContext(refugeemap.currentTime));
    //                 refugeestacked.handle.attr("x1",refugeestacked.x(d3.time.format.iso.parse(refugeemap.currentTime.toDateString())))
    //                     .attr("x2",refugeestacked.x(d3.time.format.iso.parse(refugeemap.currentTime.toDateString())));
    //             }
    //             else {
    //                 refugeemap.currentTime = refugeemap.startvalue;
    //                 $("#playcamp").html("<i class='fa fa-play fa-lg'></i>");
    //
    //                 refugeemap.running = false;
    //                 clearInterval(timer);
    //             }
    //         }, duration);
    //         refugeemap.running = true;
    //     }
    // }
    //
    // // This is what happens when the slider is being used
    // else {

    // clearInterval(timer);

    // if (d3.event.sourceEvent) { // not a programmatic event
        console.log("yo");

        // Where the user clicks / drags
        value = harborTimeSlider.xContext.invert(d3.mouse(this)[0]);
        harborTimeSlider.brush.extent([value, value]);
        console.log(value, harborTimeSlider.brush.extent([value, value])[0]);
        console.log(minstep, maxstep);

        if (value < minstep) {
            harborTimeSlider.currentTime = minstep;
            value = minstep;
        }
        else if (value > maxstep) {
            harborTimeSlider.currentTime = maxstep;
            value = maxstep;
        }
        else {
            harborTimeSlider.currentTime = value;
        }
        // refugeemap.currentTime = harborTimeSlider.currentTime;
        // $("#playcamp").html("<i class='fa fa-play fa-lg'></i>");

        // refugeemap.running = false;
        // refugeemap.wrangleData();
        var formatDate = d3.timeFormat("%b, %Y");

        // TODO: bring back the handle
        // harborTimeSlider.handle.select("rect").attr("x", harborTimeSlider.xContext(harborTimeSlider.currentTime));
        // harborTimeSlider.handle.select("text").text(formatDate(harborTimeSlider.currentTime));
        // harborTimeSlider.handle.select("text").attr("x", harborTimeSlider.xContext(harborTimeSlider.currentTime));

    console.log(harborTimeSlider.currentTime);

    harborLinechartVis.handle.attr("x1",harborLinechartVis.xScale(d3.isoParse(harborTimeSlider.currentTime)))
            .attr("x2",harborLinechartVis.xScale(d3.isoParse(harborTimeSlider.currentTime)));
    // }
    // }

};