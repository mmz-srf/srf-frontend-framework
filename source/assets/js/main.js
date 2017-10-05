import {init as SrfCarouselsInit} from './srf-carousels';
import {init as SrfChartsInit} from './srf-charts';
import {init as SrfCHMapInit} from './srf-chmap';
import {init as SrfImageSliderInit} from './srf-image-slider';
import {init as SrfTooltipInit} from './srf-tooltip';
import {init as SrfMediaStillInit} from  './srf-media-still';
import {init as SrfFormFieldInit} from './srf-form-fields';
import {init as SrfCommentsInit} from './srf-comments';
import {init as SrfHeaderInit} from './srf-header';
import {init as SrfShameInit} from  './srf-shame';

document.addEventListener("DOMContentLoaded", function(event) {
    SrfCarouselsInit();
    SrfChartsInit();
    SrfCHMapInit();
    SrfImageSliderInit();
    SrfTooltipInit();
    SrfMediaStillInit();
    SrfFormFieldInit();
    SrfCommentsInit();
    SrfHeaderInit();
    SrfShameInit(); // this should propably be last, because it may contain code that depends on the previous scripts
});