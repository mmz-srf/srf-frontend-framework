import {init as SrfCarouselsInit} from './srf-carousels';
import {init as SrfChartsInit} from './srf-charts';
import {init as SrfCHMapInit} from './srf-chmap';
import {init as SrfImageSliderInit} from './srf-image-slider';
import {init as SrfTooltipInit} from './srf-tooltip';
import {init as SrfFormFieldInit} from './srf-form-fields';
import {init as SrfCommentsInit} from './srf-comments';
import {init as SrfPolisInit} from './srf-polis';
import {init as SrfHeaderInit} from './srf-header';
import {init as SrfShameInit} from  './srf-shame';
import {SrfSwiper} from "./srf-swipe-module";

document.addEventListener("DOMContentLoaded", function(event) {
    SrfCarouselsInit();
    SrfChartsInit();
    SrfCHMapInit();
    SrfImageSliderInit();
    SrfTooltipInit();
    SrfFormFieldInit();
    SrfCommentsInit();
    SrfPolisInit();
    SrfHeaderInit();
    $(".swipemod").each((index, elem) => {
        new SrfSwiper(elem);
    });
    SrfShameInit(); // this should propably be last, because it may contain code that depends on the previous scripts
});