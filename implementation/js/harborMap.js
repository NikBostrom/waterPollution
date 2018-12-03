/*
 * HarborVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _locationData				-- the list of locations where measurements in the NU Harbor were taken
 */

HarborMapVis = function(_parentElement, _harborData, _harborEventHandler){
    this.parentElement = _parentElement;
    // this.locations = _locationData;
    this.harborData = _harborData;
    this.mapPosition = [40.696284, -73.933518];

    // this.mapPosition = [40.58167, -73.935832];
    this.eventHandler = _harborEventHandler;

    this.initVis();
};

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

// Set ranges of color for different map types
let harborColorRanges = {
    green: ["#E1F69E", "#455611"],
    pink: ["#E5AED1", "#7E195B"],
    purple: ["#C2A9D9", "#471C6E"],

    blue: ["#70B0D9", "#12246E"],
    colors: ['#9f7884',
        '#275a5e',
        '#bb9c99',
        '#123d4d',
        '#0f264c',
        '#332b56',
        '#346464',
        '#5a6f72']

};

HarborMapVis.prototype.initVis = function() {
    var vis = this;


    vis.map = L.map(vis.parentElement).setView(vis.mapPosition, 11);

    // var Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
    //     attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    //     subdomains: 'abcd',
    //     minZoom: 1,
    //     maxZoom: 16,
    //     ext: 'jpg'
    // });


    // var openStreetMap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    //     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    // });

    var CartoDB_VoyagerLabelsUnder = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    });

    // Stamen_Watercolor.addTo(vis.map);
    // openStreetMap.addTo(vis.map);
    CartoDB_VoyagerLabelsUnder.addTo(vis.map);




    L.Icon.Default.imagePath = 'imgs/';

    // Add empty layer group for the markers
    vis.locMarkers = L.layerGroup();

    var svgLayer = L.svg();
    svgLayer.addTo(vis.map);

    vis.svg = d3.select("#harbor-map").select("svg");

    vis.formatPopUpDate = d3.timeFormat("%b %d, %Y");
    
    // var t = d3
    // console.log(vis.harborData);
    let selection = $("#harbor-select-box :selected").val();
    vis.updateVis(selection, vis.harborData[0][selection][0]["Date"]);
};

HarborMapVis.prototype.updateVis = function(selection, sliderDate) {
    var vis = this;
    // console.log(selection);
    vis.updateColorScale(selection);
    vis.addLocationMarkers(selection, sliderDate);
};

HarborMapVis.prototype.updateColorScale = function(selection) {
    let vis = this;
    let colorSet;

    switch (selection) {
        case "DO (mg/L) - Top":
            colorSet = harborColorRanges.green;
            break;
        case "DO (mg/L) - Bot":
            colorSet = harborColorRanges.pink;
            break;
        case "Fecal Coliform (#/100 mL) - Top":
            colorSet = harborColorRanges.purple;
            break;
        case "Fecal Coliform (#/100 mL) - Bot":
            colorSet = harborColorRanges.blue;
            break;
    }
    // console.log(colorSet);

    let extentOfAllLocations = [
        d3.min(vis.harborData, location => d3.min(location[selection], dateVal => dateVal["Value"])),
        d3.max(vis.harborData, location => d3.max(location[selection], dateVal => dateVal["Value"]))
    ];
    // for (var i = 0; i < vis.harborData.length, i++) {
    //     function(d) {
    //         console.log(d);
    //         // console.log(selection);
    //         // TODO - Change to be the select-box selected value
    //
    //         if (!isNaN(+d[selection][0]["Value"])) {
    //             return +d[selection][0]["Value"];
    //         }
    //     }
    // }

    // console.log(extentOfAllLocations);
    vis.colorScale = d3.scaleLinear()
        .domain(extentOfAllLocations)
        .range(colorSet);

    // vis.colorScale = d3.scaleLinear()
    //     .domain(d3.extent(vis.harborData, function(d) {
    //         console.log(d);
    //         // console.log(selection);
    //         // TODO - Change to be the select-box selected value
    //
    //         if (!isNaN(+d[selection][0]["Value"])) {
    //             return +d[selection][0]["Value"];
    //         }
    //     }))
    //     .range(colorSet);
}

HarborMapVis.prototype.addLocationMarkers = function(selection, sliderDate) {
    var vis = this;



    // console.log(colorSet);


    // colorScale(location["Fecal Coliform (#/100 mL) - Top"]);

    vis.locMarkers.eachLayer(function(layer) {
        vis.map.removeLayer(layer);
    });
    // new Promise(resolve => setTimeout(resolve, 2000));


    // TODO: Go through all data instead of just the first 1000 values and store that data into a separate file instead of having to parse it every time the page loads
    // vis.harborData.forEach(function(location) {

    // i is the index for each location
    for (var i = 0; i < vis.harborData.length; i++) {
        // console.log(vis.harborData[i]);
        if (vis.harborData[i]["coords"]) {
            let tColor;
            let tOpacity;
            // TODO: Change the 0 below to the date if time allows for animated time movement / a slider
            // Get the closest date with a reading for the current sample site
            let closestDateIndex = vis.getClosestDateIndex(sliderDate, i, selection);

            let selectionVal = vis.harborData[i][selection][closestDateIndex]["Value"];
            // console.log(vis.harborData[i][selection][closestDateIndex]["Date"], sliderDate, selectionVal);
            // if (vis.harborData[i]["Site"] === "E2") {
                // console.log(selectionVal);
                // console.log(vis.harborData[i][selection]);

            // }

            // console.log(selectionVal);

            // console.log("Coord data:", vis.harborData[i][selection][0]["Value"]);


            if (isNaN(selectionVal)) {
                // tColor = "#bfbfbf";
                tColor = "black";
                tOpacity = 0.1;
            } else {
                tColor = vis.colorScale(selectionVal);
                tOpacity = 0.75;
                // console.log(tColor);
            }

            // if (vis.harborData[i]["Site"] === "E2") {
            //     console.log(tColor);
            // }


            // console.log(vis.harborData[i]["Site"], selectionVal, tColor, tOpacity);
            // console.log(tColor, vis.harborData[i]["Fecal Coliform (#/100 mL) - Top"]);

            var popupContent =  "<strong>Sample Site: </strong>" + vis.harborData[i]["Site"] + "<br/>";
            // popupContent += "<strong>Closest Date: </strong>" + vis.harborData[i][selection][closestDateIndex]["Date"] + "<br/>";
            popupContent += "<strong>Closest Date: </strong>" + vis.formatPopUpDate(vis.harborData[i][selection][closestDateIndex]["Date"]) + "<br/>";
            popupContent += "<strong>" + selection + ": </strong>" + vis.harborData[i][selection][closestDateIndex]["Value"] + "<br/>";


            var loc = L.circle(vis.harborData[i]["coords"], 400, {
                fillColor: tColor,

                fillOpacity: tOpacity,
                // stroke attributes
                color: "black",
                weight: 0.5
            }).on("click", function(e) {
                    // console.log(e.target.properties);
                    $(vis.eventHandler).trigger("sample-location-clicked-on-map", e.target.properties);
                })
                .bindPopup(popupContent);

            // Add custom properties to Leaflet markers to be passed on click
            loc.properties = {};
            loc.properties.Site = vis.harborData[i]["Site"];
            // console.log(loc.)

            vis.locMarkers.addLayer(loc);
            // console.log(vis.locMarkers);
        }
    }

        vis.locMarkers.addTo(vis.map);
    // });



};

HarborMapVis.prototype.getClosestDateIndex = function(sliderDate, sampleSiteIndex, selection) {
    var vis = this;
    // console.log(sampleSiteIndex);
    // console.log(vis.harborData[sampleSiteIndex]);
    // console.log(sliderDate);
    // console.log(selection);
    // console.log(vis.harborData[sampleSiteIndex][selection][0]["Date"]);
    // console.log(vis.harborData[sampleSiteIndex][selection][3]["Date"]);
    // console.log(vis.harborData[sampleSiteIndex][selection][2]["Date"]);

    // console.log(Math.abs(vis.harborData[sampleSiteIndex][selection][0]["Date"] - vis.harborData[sampleSiteIndex][selection][3]["Date"]));
    // console.log(Math.abs(vis.harborData[sampleSiteIndex][selection][0]["Date"] - vis.harborData[sampleSiteIndex][selection][2]["Date"]));

    let selectionArrayLength = vis.harborData[sampleSiteIndex][selection].length;
    // console.log(selectionArrayLength);
    // console.log(vis.harborData[sampleSiteIndex][selection][selectionArrayLength - 1]["Date"]);

    let bestDateDiff = Math.abs(sliderDate - vis.harborData[sampleSiteIndex][selection][0]["Date"]);
    let closestDateIndex = 0;
    // console.log(bestDateDiff, closestDateIndex);
    vis.harborData[sampleSiteIndex][selection].filter(function(d, i) {
        // console.log(d);
        // console.log(i);

        let currDateDiff = Math.abs(sliderDate - vis.harborData[sampleSiteIndex][selection][i]["Date"]);
        if (currDateDiff < bestDateDiff && !isNaN(vis.harborData[sampleSiteIndex][selection][i]["Value"])) {
            bestDateDiff = currDateDiff;
            closestDateIndex = i;
        }
        // console.log(sliderDate, vis.harborData[sampleSiteIndex][selection][closestDateIndex]["Date"]);
    });

    // if (vis.harborData[sampleSiteIndex]["Site"] === "E2") {
    //     console.log(sliderDate, vis.harborData[sampleSiteIndex][selection][closestDateIndex]["Date"], vis.harborData[sampleSiteIndex][selection][closestDateIndex]["Value"]);
    // }

    return closestDateIndex;
}