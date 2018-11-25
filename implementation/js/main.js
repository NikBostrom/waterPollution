
// Function to convert date objects to strings or reverse
var dateFormatter = d3.timeFormat("%Y-%m-%d");
var dateParser = d3.timeParse("%Y-%m-%d");

queue()
    .defer(d3.csv,"data/water_conditions.csv")
    .defer(d3.json, "data/usStatesOutline-5m.json")
    .defer(d3.json, "data/world-110m.json")
    .defer(d3.json,"data/waterdata.json")
    .defer(d3.csv,"data/assess_region1.csv") // assess_nation.csv
    .defer(d3.json,"data/us_states.json")
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
function createVis(error, water_conditions, us, world, water_quality, water_assess, states) {
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

    //COMMD OUT
    // console.log(water_data);

    getAverage(state_data);
    getAverage(region_data);

    //COMMD OUT
    // console.log(state_data);
    // console.log(region_data);

    // Clean assessment data
    water_assess.map(function(d) {
        d.Cycle = +d.Cycle;
        d.Region = +d.Region;
        d['Water Size'] = +d['Water Size'];
    });

    // Nest data by state
    var waterAssessByState = d3.nest()
        // .key(function(d) { return d.Region })
        .key(function(d) { return d.State })
        .key(function(d) { return d['Water Status']})
        // .rollup(function(leaves) { console.log(leaves); return {"state": leaves[0].State, "count": leaves.length}; })
        .rollup(function(leaves) { return leaves.length })
        .entries(water_assess); // for array
        // .object(water_assess); // for object
    //COMMD OUT
    // console.log(waterAssessByState);

    // NY Harbor Data - Takes a long time to load - process asynchronously
    d3.csv("data/harbor-water-quality.csv", function(error, _nyHarborDataMessy) {
        if(error) throw error;
        d3.csv("data/harbor_sampling_ytd_2017.csv", function(error, _nyH2017) {
            if(error) throw error;
            nyHarborData = _nyH2017;
            createHarborVis(_nyHarborDataMessy, nyHarborData);
        });
    });

    // Instantiation of Visualizations
    var glyphVis = new GlyphVis("glyph-vis", waterAssessByState);

    var mapVis = new MapVis("map-vis", water_data, us, state_data, states);
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
        data[d].avg_Total_Nitrogen = average(data[d].Total_Nitrogen)
        data[d].avg_Total_Phosphorus = average(data[d].Total_Phosphorus)
        data[d].avg_Turbidity = average(data[d].Turbidity)

    });
    return data;
}

function average(list) {
    return (list.reduce(getSum) / list.length);
}

function getSum(total, num) {
    return total + num;
}



    // (3) Create event handler
    // var MyEventHandler = {};

    // (4) Create visualization instances


    // var countVis = new CountVis("countvis", allData, MyEventHandler);
//     // *** TO-DO ***
//     //  pass event handler to CountVis, at constructor of CountVis above
//
//     // *** TO-DO ***
//     var ageVis = new AgeVis("agevis", allData);
//     var prioVis = new PrioVis("priovis", allData, metaData);
//
//
//     // (5) Bind event handler
//
//     // *** TO-DO ***
//     $(MyEventHandler).bind("selectionChanged", function(event, rangeStart, rangeEnd){
//         ageVis.onSelectionChange(rangeStart, rangeEnd);
//         prioVis.onSelectionChange(rangeStart, rangeEnd);
//         countVis.onSelectionChange(rangeStart, rangeEnd);
//     });
//
locations = [];

function createHarborVis(_nyHarborDataMessy, nyHarborData) {
    // Get all sampling lcoations
    for (var i = 0; i < 1000; i++) {
        // _nyHarborDataMessy.map(function (location) {

        var locsThusFar = locations.map(function (l) {
            return l["loc_name"];
        });
        // console.log(locsThusFar);
        if (locsThusFar.includes(_nyHarborDataMessy[i]["Sampling Location"]) === false) {
            tLocation = {};
            tLocation["loc_name"] = _nyHarborDataMessy[i]["Sampling Location"];
            tLocation["coords"] = [+_nyHarborDataMessy[i]["Lat"], +_nyHarborDataMessy[i]["Long"]];
            locations.push(tLocation);
        }

        let tVal = +nyHarborData[i]["Fecal Coliform (#/100 mL) - Top"];
        if (!isNaN(tVal)) {
            // console.log("a number!", tVal);
            nyHarborData[i]["Fecal Coliform (#/100 mL) - Top"] = tVal;
        }
    }

    // Add location data to the harbor data
    for (var i = 0; i < 1000; i++) {
        let tVal = +nyHarborData[i]["Fecal Coliform (#/100 mL) - Top"];
        if (!isNaN(tVal)) {
            // console.log("a number!", tVal);
            nyHarborData[i]["Fecal Coliform (#/100 mL) - Top"] = tVal;
        }
        for (var j = 0; j < locations.length; j++) {
            if (locations[j]["loc_name"] === nyHarborData[i]["Site"]) {
                nyHarborData[i].coords = locations[j]["coords"];
            }
        }
    }


    console.log(locations);
    console.log(nyHarborData);



    var harborVis = new HarborMapVis("harbor-map", locations, nyHarborData);
}
