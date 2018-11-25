
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
    // .defer(d3.csv,"data/chesapeakeBayLoads.csv")
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

    console.log(water_data);

    getAverage(state_data);
    getAverage(region_data);

    console.log(state_data);
    console.log(region_data);

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
    console.log(waterAssessByState);


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
    
    
    

    var glyphVis = new GlyphVis("glyph-vis", waterAssessByState);

    var mapVis = new MapVis("map-vis", water_data, us, state_data, states);

    // var chesapeakeVis = new LineChart("chesapeakeBay", chesapeakeData)
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

