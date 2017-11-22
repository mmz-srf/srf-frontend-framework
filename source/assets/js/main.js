import {init as SrfCarouselsInit} from './srf-carousels';
import {init as SrfChartsInit} from './srf-charts';
import {init as SrfCHMapInit} from './srf-chmap';
import {init as SrfImageSliderInit} from './srf-image-slider';
import {init as SrfTooltipInit} from './srf-tooltip';
import {init as SrfMediumHoverInit} from  './srf-medium-hover';
import {init as SrfFormFieldInit} from './srf-form-fields';
import {init as SrfCommentsInit} from './srf-comments';
import {init as SrfHeaderInit} from './srf-header';
import {init as SrfSearchInit} from './srf-search';
import {init as SrfNavigationInit} from './srf-navigation';
import {init as SrfShameInit} from  './srf-shame';
import {init as SrfSwipeModuleInit} from './srf-swipe-module';

document.addEventListener("DOMContentLoaded", function(event) {
    SrfCarouselsInit();
    SrfChartsInit();
    SrfCHMapInit();
    SrfImageSliderInit();
    SrfTooltipInit();
    SrfMediumHoverInit();
    SrfFormFieldInit();
    SrfCommentsInit();
    SrfHeaderInit();
    SrfSearchInit();
    SrfNavigationInit();
    SrfSwipeModuleInit();
    SrfShameInit(); // this should propably be last, because it may contain code that depends on the previous scripts
});