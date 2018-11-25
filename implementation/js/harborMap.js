/*
 * HarborVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _locationData				-- the list of locations where measurements in the NU Harbor were taken
 */

HarborMapVis = function(_parentElement, _locationData, _harborData2017){
    this.parentElement = _parentElement;
    this.locations = _locationData;
    this.harborData = _harborData2017;
    this.mapPosition = [40.696284, -73.933518];

    this.initVis();
};

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

// Set ranges of color for different map types
let harborColorRanges = {
    green: ["#455611", "#E1F69E"],
    pink: ["#7E195B", "#E5AED1"],
    purple: ["#471C6E", "#C2A9D9"],
    blue: ["#12246E", "#70B0D9"]
};

HarborMapVis.prototype.initVis = function() {
    var vis = this;

    vis.map = L.map(vis.parentElement).setView(vis.mapPosition, 10);

    // var Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
    //     attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    //     subdomains: 'abcd',
    //     minZoom: 1,
    //     maxZoom: 16,
    //     ext: 'jpg'
    // });
    var openStreetMap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    });

    openStreetMap.addTo(vis.map);
    // Stamen_Watercolor.addTo(vis.map);

    L.Icon.Default.imagePath = 'imgs/';

    // Add empty layer group for the markers
    vis.locMarkers = L.layerGroup();

    var svgLayer = L.svg();
    svgLayer.addTo(vis.map);

    vis.svg = d3.select("#harbor-map").select("svg");


    // var t = d3
    vis.updateVis($("#harbor-select-box :selected").val());
};

HarborMapVis.prototype.updateVis = function(selection) {
    var vis = this;
    console.log(selection);
    vis.addLocationMarkers(selection);
}

HarborMapVis.prototype.addLocationMarkers = function(selection) {
    var vis = this;

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

    let colorScale = d3.scaleLinear()
        .domain(d3.extent(vis.harborData, function(d) {
            // console.log(d);
            return +d["Fecal Coliform (#/100 mL) - Top"];
        }))
        .range(colorSet);

    // console.log(colorScale(location["Fecal Coliform (#/100 mL) - Top"]));

    colorScale(location["Fecal Coliform (#/100 mL) - Top"]);

    vis.map.removeLayer(vis.locMarkers);

    // TODO: Go through all data instead of just the first 1000 values and store that data into a separate file instead of having to parse it every time the page loads
    // vis.harborData.forEach(function(location) {

    for (var i = 0; i < 1000; i++) {
        // console.log(vis.harborData[i]);
        if (vis.harborData[i]["coords"]) {
            let tColor;
            let selectionVal = vis.harborData[i]["Fecal Coliform (#/100 mL) - Top"];
            if (isNaN(selectionVal)) {
                tColor = "#bfbfbf";
            } else {
                tColor = colorScale(selectionVal);
            }
            // console.log(tColor, vis.harborData[i]["Fecal Coliform (#/100 mL) - Top"]);

            var popupContent =  "<strong>Sample Site: </strong>" + vis.harborData[i]["Site"] + "<br/>";
            popupContent += "<strong>Fecal Coliform (#/100 mL) - Top: </strong>" + vis.harborData[i]["Fecal Coliform (#/100 mL) - Top"] + "<br/>";

            var loc = L.circle(vis.harborData[i]["coords"], 375, {
                fillColor: tColor,
                // stroke attributes
                color: "black",
                weight: 0.5
            }).bindPopup(popupContent);
            vis.locMarkers.addLayer(loc);
        }
    }

        vis.locMarkers.addTo(vis.map);
    // });

};

