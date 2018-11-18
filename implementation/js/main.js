// Function to convert date objects to strings or reverse
var dateFormatter = d3.timeFormat("%Y-%m-%d");
var dateParser = d3.timeParse("%Y-%m-%d");

queue()
    .defer(d3.csv,"data/water_conditions.csv")
    .defer(d3.json, "data/world-110m.json")
    .defer(d3.json,"data/waterdata.json")
    .await(createVis);


function createVis(error, water_conditions, world, water_quality) {
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
           "Turbidity": s+d.TURB,
           "Dissolved_Org_Carbon": +d.DOC,
       }
    });

    console.log(water_data);
    var mapVis = new MapVis("map-vis", water_data, world);
}


    // // (3) Create event handler
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

