// Modified from https://stackoverflow.com/questions/37641020/html5-slider-bar-how-to-use-the-nouislider
// Reference: https://refreshless.com/nouislider/s
var slider = document.getElementById('harbor-time-slider');

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



// ------------------------------
// stuff that doesn't work - switched from using nouislider to modifying what was done on syrian project from hall of fame
// ------------------------------



// Slider
// var slider = document.getElementById("harbor-time-slider");
// // var slider = document.getElementById("temp");
//
// noUiSlider.create(slider, {
//     animate: true, // Animation for when the value of the slider is set using .set()
//     animationDuration: 500,
//     start: [20, 80], // Handle start position
//     connect: true,
//     // step: 10, // Slider moves in increments of '10'
//     margin: 20, // Handles must be more than '20' apart
//     direction: 'ltr', // Put '0' at the bottom of the slider
//     orientation: 'horizontal', // Orient the slider vertically
//     behaviour: 'hover-tap-drag', // Move handle on tap, bar is draggable
//     range: { // Slider can select '0' to '100'
//         'min': 0,
//         'max': 100
//     },
//     pips: { // Show a scale with the slider
//         mode: 'steps',
//         density: 2
//     }
// });

// noUiSlider.create(slider, {
//     animate: true, // Animation for when the value of the slider is set using .set()
//     animationDuration: 500,
//     start: [20, 80],
//     // direction: 'ltr', // Put '0' at the bottom of the slider
//     // connect: true,
//     // range: {
//     //     min: timestamp('2010'),
//     //     max: timestamp('2016')
//     // },
//     range: {
//         min: 0,
//         max: 100
//     },
//     orientation: 'horizontal', // Orient the slider vertically
//
//     //     // Steps of one week
//     //     step: 7 * 24 * 60 * 60 * 1000,
// });

// noUiSlider.create(slider, {
//     animate: true, // Animation for when the value of the slider is set using .set()
//     animationDuration: 500,
//     start: [20, 80], // Handle start position
//     connect: true,
//     // step: 10, // Slider moves in increments of '10'
//     margin: 20, // Handles must be more than '20' apart
//     direction: 'ltr', // Put '0' at the bottom of the slider
//     orientation: 'horizontal', // Orient the slider vertically
//     behaviour: 'hover-tap-drag', // Move handle on tap, bar is draggable
//     range: { // Slider can select '0' to '100'
//         'min': 0,
//         'max': 100
//     },
//     pips: { // Show a scale with the slider
//         mode: 'steps',
//         density: 2
//     }
// });

// noUiSlider.create(slider, {
//     start: [20, 80],
//     connect: true,
//     range: {
//         'min': 0,
//         'max': 100
//     }
// });

// noUiSlider.create(dateSlider, {
//     // Create two timestamps to define a range.
//     range: {
//         min: timestamp('2010'),
//         max: timestamp('2016')
//     },
//
//     // Steps of one week
//     step: 7 * 24 * 60 * 60 * 1000,
//
//     // Two more timestamps indicate the handle starting positions.
//     // start: [timestamp('2011'), timestamp('2015')],
//     start: [timestamp('2011')],
//
//     // No decimals
//     format: wNumb({
//         decimals: 0
//     })
// });
// });

// Create a new date from a string, return as a timestamp.
// function timestamp(str) {
//     return new Date(str).getTime();
// }


