import {init as SrfCarouselsInit} from './srf-carousels';
import {init as SrfChartsInit} from './srf-charts';
import {init as SrfCHMapInit} from './srf-chmap';

document.addEventListener("DOMContentLoaded", function(event) {
    SrfCarouselsInit();
    SrfChartsInit();
    SrfCHMapInit();
});