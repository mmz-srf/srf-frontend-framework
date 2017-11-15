import {init as FefCarouselsInit} from './srf-carousels';
import {init as FefChartsInit} from './srf-charts';
import {init as FefCHMapInit} from './srf-chmap';
import {init as FefImageSliderInit} from './srf-image-slider';
import {init as FefMediumHoverInit} from  './srf-medium-hover';
import {init as FefFormFieldInit} from './srf-form-fields';
import {init as FefCommentsInit} from './srf-comments';
import {init as FefHeaderInit} from './srf-header';
import {init as FefSearchInit} from './srf-search';
import {init as FefNavigationInit} from './srf-navigation';
import {init as FefShameInit} from  './srf-shame';
import {init as FefSwipeModuleInit} from './srf-swipe-module';

/** Self loading components, without init **/
import {FefTooltip} from './components/fef-tooltip';

document.addEventListener('DOMContentLoaded', function(event) {
    FefCarouselsInit();
    FefChartsInit();
    FefCHMapInit();
    FefImageSliderInit();
    FefMediumHoverInit();
    FefFormFieldInit();
    FefCommentsInit();
    FefHeaderInit();
    FefSearchInit();
    FefNavigationInit();
    FefSwipeModuleInit();
    FefShameInit(); // this should propably be last, because it may contain code that depends on the previous scripts
});
