harborLocations = [];
harborData = [];

function wrangleHarborData(_nyHarborDataMessy, nyHarborData) {
    // Create array for each measure
    var measures = $("#harbor-select-box option").map(function() {
        return $(this).val();
    });

    console.log(measures);

    // Get all sampling locations and add location data to that harbor data location
    var parseDate = d3.timeParse("%m/%d/%Y");
    for (let j = 0; j < nyHarborData.length; j++) {
        let tDateVal = parseDate(nyHarborData[j]["Date"]);
        nyHarborData[j]["Date"] = tDateVal;
    }
    for (let i = 0; i < nyHarborData.length; i++) {
        var locsThusFar = harborLocations.map(function (l) {
            return l["Site"];
        });
        if (locsThusFar.includes(nyHarborData[i]["Site"]) === false) {

            tLocation = {};
            tLocation["Site"] = nyHarborData[i]["Site"];
            for (let j = 0; j < _nyHarborDataMessy.length; j++) {
                if (tLocation["Site"] === _nyHarborDataMessy[j]["Sampling Location"]) {
                    tLocation["coords"] = [+_nyHarborDataMessy[j]["Lat"], +_nyHarborDataMessy[i]["Long"]];
                }
            }

            let locationVals = nyHarborData.filter(function(location) {
                return location["Site"] === tLocation["Site"];
            });

            for (let k = 0; k < measures.length; k++) {
                tLocation[measures[k]] = [];

                // Go through all time data and get all values for each measure
                for (let m = 0; m < locationVals.length; m++) {
                    let tDateWithVal = {};
                    tDateWithVal["Date"] = locationVals[m]["Date"];
                    tDateWithVal["Value"] = +locationVals[m][measures[k]];

                    tLocation[measures[k]].push(tDateWithVal)
                }
                tLocation[measures[k]].sort(function(a, b) {
                    return a["Date"] - b["Date"];
                });
            }

            harborLocations.push(tLocation);
        }
    }


    console.log(harborLocations);

    console.log(nyHarborData);
}
