
/*
 * HarborLinechartVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _locationData				-- the list of locations where measurements in the NU Harbor were taken
 */

HarborLinechartVis = function(_parentElement, _locationData, _harborData2017){
    this.parentElement = _parentElement;
    this.locations = _locationData;
    this.harborData = _harborData2017;

    this.initVis();
};

HarborLinechartVis.prototype.initVis = function() {
    var vis = this;

    vis.updateVis();
}

HarborLinechartVis.prototype.updateVis = function() {

}