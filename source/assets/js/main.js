import {init as SrfCarouselsInit} from './srf-carousels';
import {init as SrfChartsInit} from './srf-charts';
import {init as SrfImageSliderInit} from './srf-image-slider';


document.addEventListener("DOMContentLoaded", function(event) {
    SrfCarouselsInit();
    SrfChartsInit();
    SrfImageSliderInit();
});
