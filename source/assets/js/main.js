import {init as SrfCarouselsInit} from './srf-carousels';
import {init as SrfChartsInit} from './srf-charts';
import {init as SrfCHMapInit} from './srf-chmap';
import {init as SrfImageSliderInit} from './srf-image-slider';
import {init as SrfPollInit} from './srf-poll';
import {init as SrfRatingsInit} from './srf-ratings';
import {init as SrfTooltipInit} from './srf-tooltip';
import {init as SrfFormFieldInit} from './srf-form-fields';


document.addEventListener("DOMContentLoaded", function(event) {
    SrfCarouselsInit();
    SrfChartsInit();
    SrfCHMapInit();
    SrfImageSliderInit();
    SrfPollInit();
    SrfRatingsInit();
    SrfTooltipInit();
    SrfFormFieldInit();
});