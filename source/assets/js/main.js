/** SELF loading components without init **/
import {FefFormField} from './components/fef-form-field';
import {FefImageSlider} from './components/fef-image-slider';
import {FefTooltip} from './components/fef-tooltip';

/** INIT loafin components **/
import {init as FefCarouselsInit} from './srf-carousels';
import {init as FefChartsInit} from './srf-charts';
import {init as FefCHMapInit} from './srf-chmap';
import {init as FefMediumHoverInit} from  './srf-medium-hover';
import {init as FefCommentsInit} from './srf-comments';
import {init as FefHeaderInit} from './srf-header';
import {init as FefSearchInit} from './srf-search';
import {init as FefNavigationInit} from './srf-navigation';
import {init as FefShameInit} from  './srf-shame';
import {init as FefSwipeModuleInit} from './srf-swipe-module';
import {init as FefFlyingFocusInit} from './srf-flying-focus';

document.addEventListener('DOMContentLoaded', function(event) {
    FefCarouselsInit();
    FefChartsInit();
    FefCHMapInit();
    FefMediumHoverInit();
    FefCommentsInit();
    FefHeaderInit();
    FefSearchInit();
    FefNavigationInit();
    FefSwipeModuleInit();
    FefFlyingFocusInit();
    FefShameInit(); // this should probably be last, because it may contain code that depends on the previous scripts
});
