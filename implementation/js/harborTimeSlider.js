/******** Modified from code written by Lily Li ********/
// Ref: http://www.syria-visualized.com/

Timeslide = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.campdata = _data;
    this.initVis();
};

Timeslide.prototype.initVis = function() {
    var vis = this;

    // -------------------------------------------------------------------------
    // SVG Drawing area
    // -------------------------------------------------------------------------
    vis.margin = {top: 5, right: 35, bottom: 20, left: 20};
    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = 80 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
    // -------------------------------------------------------------------------
    // Scales and axes
    // -------------------------------------------------------------------------
    vis.x = d3.time.scale()
        .range([0, vis.width])
        .domain(d3.extent(vis.campdata, function (d) {
            return d.date;
        }));

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom")
        .tickFormat(d3.time.format("%b-%y"))
        .ticks(d3.time.month, 6);

    vis.svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + vis.height/2 + ")")
        .call(vis.xAxis)
        .selectAll("text")
        .attr("dy", "1.2em");

    // -------------------------------------------------------------------------
    // Define Brush
    // -------------------------------------------------------------------------
    vis.xContext = d3.time.scale()
        .range([0, vis.width])
        .domain(d3.extent(vis.campdata, function (d) {
            return d.date;
        }));

    var formatDate = d3.time.format("%b-%y");
    var mindate = d3.min(vis.campdata, function(d) {return d.date});

    vis.brush = d3.svg.brush()
        .x(vis.xContext)
        .extent([0, 0])
        .on("brush", brushed_refugeemap);

    vis.slider = vis.svg.append("g")
        .attr("class", "slider")
        .call(vis.brush);

    vis.slider.selectAll(".extent,.resize")
        .remove();

    vis.slider.select(".background")
        .attr("height", vis.height);

    vis.handle = vis.slider.append("g")
        .attr("class", "timeslidehandle");

    vis.handle.append("rect")
        .attr("width", 5)
        .attr("height", 20)
        .attr("y", vis.height/3 );

    vis.handle.append("text")
        .text(formatDate(mindate))
        .attr("fill","white")
        .attr("transform", "translate(" + -15 + " ," + 10 + ")");
};
