

// Function to convert date objects to strings or reverse
// var dateFormatter = d3.timeFormat("%Y-%m-%d");
// var dateParser = d3.timeParse("%Y-%m-%d");
//
// (1) Load data asynchronously
queue()
    // .defer(d3.json,"data/perDayData.json")
    // .defer(d3.json,"data/myWorldFields.json")
    .defer(d3.json, "data/world-110m.json")
    .defer(d3.csv, "data/nla2007_chemical_conditionestimates_20091123.csv")
    .await(createVis);


function createVis(error, world, data1){
    if(error) { console.log(error); }

    console.log(data1);

    // (2) Make our data look nicer and more useful
    data1 = data1.map(function (d) {
        d.ANC = +d.ANC;
        d.CHLA = +d.CHLA;
        d.COND = +d.COND;
        d.DOC = +d.DOC;
        d.ECO_LEV_3 = +d.ECO_LEV_3;
        d.HUC_2 = +d.HUC_2;
        d.HUC_8 = +d.HUC_8;
        d.LAT_DD = +d.LAT_DD;
        d.LON_DD = +d.LON_DD;
        d.MDCATY = +d.MDCATY;
        d.TURB = +d.TURB;
        d.Total_Nitrogen = +d.Total_Nitrogen;
        d.Total_Phosphorous = +d.Total_Phosphorous;
        d.VISIT_NO = +d.VISIT_NO;
        d.WGT = +d.WGT;
        d.WGT_NLA = +d.WGT_NLA;

    });


    // // (3) Create event handler
    // var MyEventHandler = {};

    // (4) Create visualization instances
    var mapVis = new MapVis("map-vis", data1, world);


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
}
