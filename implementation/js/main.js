
// Function to convert date objects to strings or reverse
var dateFormatter = d3.timeFormat("%Y-%m-%d");
var dateParser = d3.timeParse("%Y-%m-%d");

queue()
    .defer(d3.csv,"data/water_conditions.csv")
    .defer(d3.json, "data/world-110m.json")
    .defer(d3.json,"data/waterdata.json")
    .defer(d3.json, "data/us-10m.json")
    .await(createVis);

region_data = {}
state_data = {}

function createVis(error, water_conditions, world, water_quality, world2) {
    if(error) throw error;

    // console.log(water_conditions);
    // console.log(water_quality);

    water_data = water_conditions.map(function(d,i) {
       // console.log(d);
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
    console.log(water_data);
    water_data.map(function(d, i) {
        // populate state_data
        if (state_data[d.State]) {
            state_data[d.State].Total_Nitrogen.push(d.Total_Nitrogen);
            state_data[d.State].Total_Phosphorus.push(d.Total_Phosphorus);
            state_data[d.State].Turbidity.push(d.Turbidity);
        } else {
            //first entry for state_data[d.State]
            state_data[d.State] = {
                "Total_Nitrogen": [d.Total_Nitrogen],
                "Total_Phosphorus": [d.Total_Phosphorus],
                "Turbidity": [d.Turbidity],
            }
        }


        // populate region_data
        if (region_data[d.Region]) {
            region_data[d.Region].Total_Nitrogen.push(d.Total_Nitrogen);
            region_data[d.Region].Total_Phosphorus.push(d.Total_Phosphorus);
            region_data[d.Region].Turbidity.push(d.Turbidity);
        } else {
            //first entry for state_data[d.State]
            region_data[d.Region] = {
                "Total_Nitrogen": [d.Total_Nitrogen],
                "Total_Phosphorus": [d.Total_Phosphorus],
                "Turbidity": [d.Turbidity],
            }
        }



    });

    // region_data[d.Region].avg_Total_Nitrogen = average(region_data[d.Region].Total_Nitrogen)
    // region_data[d.Region].avg_Total_Phosphorus = average(region_data[d.Region].Total_Phosphorus)
    // region_data[d.Region].avg_Turbidity = average(region_data[d.Region].Turbidity)
    //
    // state_data[d.State].avg_Total_Nitrogen = average(state_data[d.State].Total_Nitrogen)
    // state_data[d.State].avg_Total_Phosphorus = average(state_data[d.State].Total_Phosphorus)
    // state_data[d.State].avg_Turbidity = average(state_data[d.State].Turbidity)

    getAverage(state_data);
    getAverage(region_data);

    // console.log(state_data);
    // console.log(region_data);

    var mapVis = new MapVis("map-vis", water_data, world2);
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

