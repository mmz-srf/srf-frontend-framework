/** INIT loading components **/
import {init as FefCarouselsInit} from './srf-carousels';
import {init as FefChartsInit} from './srf-charts';
import {init as FefCHMapInit} from './srf-chmap';
import {init as FefMediumHoverInit} from  './srf-medium-hover';
import {init as FefCommentsInit} from './srf-comments';
import {init as FefSearchInit} from './components/fef-search';
import {init as FefGlobalnavInit} from './components/fef-globalnav';
import {init as FefShameInit} from  './srf-shame';
import {init as FefSwipeableAreaInit} from './components/fef-swipeable-area';
import {init as FefSwipeModuleInit} from './srf-swipe-module';
import {init as FefFlyingFocusInit} from './components/fef-flying-focus';
import {init as FefExpandableBoxInit} from './components/fef-expandable-box';
import {init as FefStickyHeaderInit} from './components/fef-sticky-header';
import {init as FefSubnavInit} from './components/fef-subnav';
import {init as FefPopupInit} from './components/fef-popup';
import {init as FefSkiplinks} from './components/fef-skiplinks';
import {init as FefSelectableInit} from './components/fef-selectable';
import {init as FefListmoduleInit} from './srf-listmodule';
import {init as FefExpander} from './components/fef-expander';
import {init as FefPodcastDetails} from './components/fef-podcast-details';


/** SELF loading components without init **/
import {FefFormField} from './components/fef-form-field';
import {FefTooltip} from './components/fef-tooltip';
import {FefImageSlider} from './components/fef-image-slider';
import {Affix} from './components/affix';
import {FefModal} from './components/fef-modal';
import './components/fef-ripple';

import './utils/fef-easings';

document.addEventListener('DOMContentLoaded', function(event) {
    FefCarouselsInit();
    FefChartsInit();
    FefCHMapInit();
    FefMediumHoverInit();
    FefCommentsInit();
    FefSearchInit();
    FefGlobalnavInit();
    FefSwipeableAreaInit();
    FefSwipeModuleInit();
    FefFlyingFocusInit();
    FefExpandableBoxInit();
    FefStickyHeaderInit();
    FefSubnavInit();
    FefPopupInit();
    FefSkiplinks();
    FefSelectableInit();
    FefListmoduleInit();
    FefExpander();
    FefPodcastDetails();

    FefShameInit(); // this should probably be last, because it may contain code that depends on the previous scripts
});
