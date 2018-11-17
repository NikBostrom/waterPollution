// Modified from https://stackoverflow.com/questions/37641020/html5-slider-bar-how-to-use-the-nouislider
// Reference: https://refreshless.com/nouislider/s
var slider = document.getElementById('timeslider-vis');

noUiSlider.create(slider, {
    animate: true, // Animation for when the value of the slider is set using .set()
    animationDuration: 500,
    start: [20, 80], // Handle start position
    connect: true,
    // step: 10, // Slider moves in increments of '10'
    margin: 20, // Handles must be more than '20' apart
    direction: 'ltr', // Put '0' at the bottom of the slider
    orientation: 'horizontal', // Orient the slider vertically
    behaviour: 'hover-tap-drag', // Move handle on tap, bar is draggable
    range: { // Slider can select '0' to '100'
        'min': 0,
        'max': 100
    },
    pips: { // Show a scale with the slider
        mode: 'steps',
        density: 2
    }
});


var sliderHoverField = document.getElementById('timeslider-hover-val');
slider.noUiSlider.on('hover', function(val) {
    sliderHoverField.innerHTML = val;
});
//
// // When the slider value changes, update the input and span
// range.noUiSlider.on('update', function( values, handle ) {
//     if ( handle ) {
//         valueInput.value = values[handle];
//     } else {
//         valueSpan.innerHTML = values[handle];
//     }
// });
//
// // When the input changes, set the slider value
// valueInput.addEventListener('change', function(){
//     range.noUiSlider.set([null, this.value]);
// });