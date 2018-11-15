var width = 1000,
    height = 600;

var svg = d3.select("#viz-area").append("svg")
    .attr("width", width)
    .attr("height", height);

queue()
    .defer(d3.json, "data/world-110m.json")
    .await(createVisualization);

function createVisualization(error, _worldData) {
    if (error) throw error;

    var projection = d3.geoMercator()
        .translate([width / 2, height / 2])
        .center([0, 20])
        .scale(150);

    // var projection = d3.geoOrthographic();

    var path = d3.geoPath()
        .projection(projection);

    // Convert TopoJSON to GeoJSON (target object = 'countries')
    var world = topojson.feature(_worldData, _worldData.objects.countries).features;
    // var airports = _airportData.nodes;

    // Render the U.S. by using the path generator
    svg.selectAll("path")
        .data(world)
        .enter().append("path")
        .attr("d", path);

    // Add country boundaries
    svg.append("path")
        .datum(topojson.mesh(_worldData, _worldData.objects.countries, function(a, b) { return a !== b; }))
        .attr("d", path)
        .attr("class", "subunit-boundary");

    // svg.selectAll("circle")
    //     .data(airports)
    //     .enter()
    //     .append("circle")
    //     .attr("r", 3.25)
    //     .attr("transform", function(d) {
    //         return "translate(" + projection([d.longitude, d.latitude]) + ")";
    //     })
    //     .attr("class", "airport")
    //     .append("title")
    //     .text(function(d) { return d.name; });


    // var edges = _airportData.links;

    // Add lines to connect the airports
    // svg.selectAll("line")
    //     .data(edges)
    //     .enter()
    //     .append("line")
    //     .attr("class", "airport-line")
    //     .attr("x1", function(d) { return projection([airports[d.source].longitude, airports[d.source].latitude])[0]; })
    //     .attr("y1", function(d) { return projection([airports[d.source].longitude, airports[d.source].latitude])[1]; })
    //     .attr("x2", function(d) { return projection([airports[d.target].longitude, airports[d.target].latitude])[0]; })
    //     .attr("y2", function(d) { return projection([airports[d.target].longitude, airports[d.target].latitude])[1]; });
}


