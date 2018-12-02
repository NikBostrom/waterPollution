/******** Adapted from code written by Lily Li ********/
// Ref: http://www.syria-visualized.com/

HarborTimeSlider = function(_parentElement, _harborData){
    this.parentElement = _parentElement;
    this.harborData = _harborData;
    this.filteredData = this.harborData;
    this.initVis();
};

HarborTimeSlider.prototype.initVis = function() {
    var vis = this;

    // -------------------------------------------------------------------------
    // SVG Drawing area
    // -------------------------------------------------------------------------
    vis.margin = {top: 5, right: 35, bottom: 20, left: 20};
    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = 80 - vis.margin.top - vis.margin.bottom;

    console.log(vis.width, vis.height);

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
    // -------------------------------------------------------------------------
    // Scales and axes
    // -------------------------------------------------------------------------
    vis.x = d3.scaleTime()
        .range([0, vis.width]);
        // .domain(d3.extent(vis.harborData, function (d) {
        //     return d.date;
        // }));

    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .tickFormat(d3.timeFormat("%b, %Y"));
    // .ticks(d3.time.month, 6);

    vis.harborTimeAxisGroup = vis.svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + vis.height / 2 + ")");


    // Brush - to be used as a slider
    vis.brush = d3.brushX()
    // .scale(vis.xContext)
        .extent([[0, 0], [vis.width, vis.height]])
        .on("brush", brushedHarborTimeSlider);

    vis.slider = vis.svg.append("g")
        .attr("class", "slider brush");

    vis.updateVis($("#harbor-select-box :selected").val(), "CIC2");
}

HarborTimeSlider.prototype.updateVis = function(measureSelection, locationSelection) {
    var vis = this;

    if (locationSelection !== null) {
        vis.filteredData = vis.harborData.filter(function(loc) {
            return loc["Site"] === locationSelection;
        })[0][measureSelection].filter(function(loc) {
            return (!isNaN(loc["Value"]));
        });
    }

    console.log(vis.filteredData);

    vis.x.domain(d3.extent(vis.filteredData, function (d) {
        // console.log(d);
        // console.log(d["Date"]);
        return d["Date"];
    }));

    vis.harborTimeAxisGroup.call(vis.xAxis)
        .selectAll("text")
        .attr("dy", "1.2em");

    vis.xContext = d3.scaleTime()
        .range([0, vis.width])
        .domain(d3.extent(vis.filteredData, function (d) {
            return d["Date"];
        }));

    var formatDate = d3.timeFormat("%b, %Y");
    var minDate = d3.min(vis.filteredData, function(d) {return d["Date"]});

    // console.log(vis.harborData);


    // Updating the brush slider
    vis.slider.call(vis.brush);

    // vis.slider.selectAll(".extent,.resize")
    //     .remove();

    // vis.slider.select(".background")
    //     .attr("height", vis.height);


    // TODO: Bring back the handle here too
    // vis.handle = vis.slider.append("g")
    //     .attr("class", "timeslidehandle");
    //
    // vis.handle.append("rect")
    //     .attr("width", 5)
    //     .attr("height", 20)
    //     .attr("y", vis.height/3 );
    //
    // vis.handle.append("text")
    //     .text(formatDate(minDate))
    //     .attr("fill","white")
    //     .attr("transform", "translate(" + -15 + " ," + 10 + ")");
};

