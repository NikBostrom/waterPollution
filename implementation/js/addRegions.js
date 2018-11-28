var fs = require("fs");
d3.csv("data/stateToRegion.csv", function(data1) {
    // console.log(data1);
    // var found = data1.find(function(state) {
    //     return state.State == "Alabama"
    // });
    // console.log(found);
    d3.json("data/usStatesOutline-5m.json", function(data) {
        // console.log(data.features);
        data.features.forEach(function(d) {
            var found = data1.find(function(element) {
                // console.log(element.State);
                // console.log(d.properties.NAME);
                return element.State === d.properties.NAME
            });

            // if state not assigned to region, assign 00
            if (found) {
                d.properties.EPA_REGION = found.Region
            }
            else {
                d.properties.EPA_REGION = "00"
            }
        });
        console.log(data);
        fs.writeFile('data/regionsOutline.json', data, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
    });
});
