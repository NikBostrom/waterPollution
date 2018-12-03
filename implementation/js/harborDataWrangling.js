harborLocations = [];
harborData = [];
harborAverageLocationsData = [];
harborAverageLocationsData2 = [];
var measures;

function wrangleHarborData(_nyHarborDataMessy, nyHarborData) {
    // Create array for each measure
    measures = $("#harbor-select-box option").map(function() {
        return $(this).val();
    });

    // console.log(measures);

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

    // console.log(harborLocations);
    // console.log(nyHarborData);

    generateAverageData();
}

function generateAverageData() {
    // console.log(harborLocations);
    // console.log(measures);
    let minDate = d3.min(measures, measure => d3.min(harborLocations, location => d3.min(location[measure], dateVal => dateVal["Date"])));
    let maxDate = d3.max(measures, measure => d3.max(harborLocations, location => d3.max(location[measure], dateVal => dateVal["Date"])));

    // console.log(minDate, d3.timeDay.offset(minDate, 1), maxDate);
    var tDate = minDate;
    for (var i = minDate; i < maxDate; i = d3.timeDay.offset(tDate, 1)) {
        // console.log(tDate);
        tDate = i;

        var tempDate = {
            Date: i
        };
        for (var m = 0; m < measures.length; m++) {
            tempDate[measures[m]] = [];
        }
        for (var j = 0; j < harborLocations.length; j++) {
            for (var m = 0; m < measures.length; m++) {
                for (var k = 0; k < harborLocations[j][measures[m]].length; k++) {
                    // console.log(i, j, k);
                    // console.log(measures[m]);
                    // console.log(harborLocations[j]);
                    // console.log(harborLocations[j][measures[m]]);
                    // console.log(harborLocations[j][measures[m]][k]);
                    // console.log(harborLocations[j][measures[m]][k]["Value"]);
                    // console.log(harborLocations[j][measures[m]][k]["Date"], i);
                    if (+d3.timeDay.floor(i) === +d3.timeDay.floor(harborLocations[j][measures[m]][k]["Date"])) {
                        if (!isNaN(harborLocations[j][measures[m]][k]["Value"])) {
                            tempDate[measures[m]].push(harborLocations[j][measures[m]][k]["Value"]);
                        }
                    }
                }
            }
        }
        // console.log(tempDate);
        for (var m = 0; m < measures.length; m++) {
            if (tempDate[measures[m]].length > 0) {
                tempDate[measures[m]].Value = (tempDate[measures[m]].reduce((a, b) => a + b, 0)) / tempDate[measures[m]].length;
            } else {
                tempDate[measures[m]].Value = 0;
            }
        }

        harborAverageLocationsData2.push(tempDate);
    }

    console.log(harborAverageLocationsData2);

    for (var m = 0; m < measures.length; m++) {
        harborAverageLocationsData[measures[m]] = [];
    }
    for (var m = 0; m < measures.length; m++) {
        for (var j = 0; j < harborAverageLocationsData2.length; j++) {
            var o = {
                Date: harborAverageLocationsData2[j].Date,
                Value: harborAverageLocationsData2[j][measures[m]].Value
            };
            harborAverageLocationsData[measures[m]].push(o);
        }
    }
    console.log(harborAverageLocationsData);
}