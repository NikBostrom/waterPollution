#Water Woes in the Midwest 
###How Data Can Save Midwestern Aquatic Ecosystems
#####Final Project for Harvard’s CS 171: Data Visualization (Fall 2018)
#####Niklas Bostrom, Chandler Brown, Jackie Chea, Elgin Davis

The purpose of *Water Woes in the Midwest* is to demonstrate the detrimental effects of having limited data on water quality, specifically in the Midwest Region of the United States.  In the past, because there has not been a large emphasis and push for conservation of the environment, there is a very sparse collection of information for data on water bodies throughout the United States.  This lack of information can lead to elevated levels of pollutants and contaminants such as Nitrogen and Phosphorous due to increased anthropogenic input and work.  However, once a focus is placed on the quality and the health of the water body by the public or outside officials, one can see that humans have the power to effect great change and remediation efforts.
The website was primarily written in html and JavaScript.  There are several JavaScript libraries imported and used.  These include:
* D3
   * Create innovative and effective visualizations with extensive use of svgs
*	Jquery
*	Popper
*	Bootstrap
* Topojson
   * Create outline maps for the United States
* Queue
   * Load multiple data sources at once
* D3-tip
* Leaflet
   * Create street level maps for overlay
* D3-legend
* Navbar
   * Establish framework for navigation bar on side of screen
* Nouislider
  * Time slider


There are several JavaScript files written for the whole program.  These include:
* Map
   * Create a chloropleth map of different pollution levels in United States
* Linechart2
   * Create linecharts for pollution levels across years in Chesapeake Bay
* harborMap, harborDataWrangling, harborLinechart, harborTimeSlider
   * Create indicators for pollution levels on a map for New York Harbor
   * Create linechart for pollution levels for New York Harbor
* Regions
   * Create map showing the general health status assigned to water bodies
* Main
  * Load and clean data and call functions

Several data sources were used to implement the visualizations.  These include:
* Assess_region_#
   * General status of water bodies across EPA determined regions
* ChesapeakeBayLoads
   * Water pollution levels in the Chesapeake Bay
* Harbor-water-quality, harbor_sampling_ytd_2017
   * Water pollution levels in the New York Harbor
* regionsOutline
   * draw map of EPA Regions
* us_states
   * draw map of states in United States
* water_conditions
   * water pollution levels in various states throughout United States