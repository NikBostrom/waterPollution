/*
 * HarvorVis - Object constructor function
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
    green: ["#E1F69E", "#455611"],
    // pink: ["#E5AED1", "#7E195B"],
    // purple: ["#C2A9D9", "#471C6E"]
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

    // vis.svg = L.svg();


    vis.addLocationMarkers();
};


HarborMapVis.prototype.addLocationMarkers = function() {
    var vis = this;

    let colorSet;

    colorSet = harborColorRanges.green;

    let colorScale = d3.scaleLinear()
        .domain(d3.extent(vis.harborData, function(d) {
            // console.log(d);
            return +d["Fecal Coliform (#/100 mL) - Top"];
        }))
        .range(colorSet);

    // console.log(colorScale(location["Fecal Coliform (#/100 mL) - Top"]));

    colorScale(location["Fecal Coliform (#/100 mL) - Top"]);

    vis.map.removeLayer(vis.locMarkers);

    // vis.harborData.forEach(function(location) {

        for (var i = 0; i < 1000; i++) {
            // console.log(vis.harborData[i]);
            if (vis.harborData[i]["coords"]) {
                let tColor = colorScale(vis.harborData[i]["Fecal Coliform (#/100 mL) - Top"]);
                // console.log(tColor, vis.harborData[i]["Fecal Coliform (#/100 mL) - Top"]);
                var loc = L.circle(vis.harborData[i]["coords"], 300, {
                    fillColor: tColor,
                    // stroke attributes
                    color: "black",
                    weight: 0.5
                }).bindPopup(vis.harborData[i]["loc_name"]);
                vis.locMarkers.addLayer(loc);
            }
        }


        vis.locMarkers.addTo(vis.map);
    // });





    // var sampleLocations = vis.svg.selectAll("circle")
    //     .data(vis.harborData.filter(function(d, i) {
    //         console.log(d);
    //         return i < 1000;
    //     }))
    //     .enter()
    //     .append("circle")
    //     .style("stroke", "black")
    //     // .style("opacity", .6)
    //     .style("fill", "blue")
    //     .attr("r", 5);
    //
    // vis.map.on("viewreset", update);
    // update();
    // function update() {
    //     sampleLocations.attr("transform",
    //         function(d) {
    //             return "translate("+
    //                 vis.map.latLngToLayerPoint(d["coords"]).x + "," + vis.map.latLngToLayerPoint(d["coords"]).y +")";
    //         }
    //     );
    // }
};


