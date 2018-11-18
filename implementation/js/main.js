
queue()
    .defer(d3.csv,"data/water_conditions.csv")
    .defer(d3.json,"data/waterdata.json")
    .await(createVis);


function createVis(error, water_conditions, water_quality) {
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
}