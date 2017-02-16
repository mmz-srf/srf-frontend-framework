import {init as SrfCarouselsInit} from './srf-carousels';
import {init as SrfChartsInit} from './srf-charts';
import {init as SrfCHMapInit} from './srf-chmap';
import {init as SrfImageSliderInit} from './srf-image-slider';


document.addEventListener("DOMContentLoaded", function(event) {
    SrfCarouselsInit();
    SrfChartsInit();
    SrfCHMapInit();
    SrfImageSliderInit();
});
