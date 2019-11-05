import { DOM_INIT_EVENT } from '../utils/fef-events';

const JS_HOOK_ELEMENT = '.js-sticky-sidebar';
const JS_HOOK_SHARING_BAR_LINE = '.js-sharing-bar-line';
const JS_HOOK_POSITIONER = '.js-sticky-sidebar-positioner';
const JS_HOOK_TITLE = '.js-sticky-sidebar-title';
const JS_HOOK_MASTHEAD = '.js-masthead';

$(window).on(DOM_INIT_EVENT, () => {
    $(JS_HOOK_ELEMENT).each((_, element) => {
        new FefStickySidebar($(element));
    });
});

export class FefStickySidebar {

    /**
     * Attempt to position the sticky sidebar (so that the first separator is
     * at the same height as the horizontal line in the sharing bar) and set
     * the correct offset, where it should turn sticky (height of the
     * masthead).
     * 
     * If some elements are missing or JS was disabled, sensible default values
     * in the CSS are chosen.
     * 
     * @param $element jQuery element
     */
    constructor ($element) {
        let $masthead = $(JS_HOOK_MASTHEAD),
            $sharingBarLine = $(JS_HOOK_SHARING_BAR_LINE),
            $parent = $element.parent(JS_HOOK_POSITIONER),
            $title = $element.find(JS_HOOK_TITLE);

        // set sidebar's sticky offset if the required element was found
        if ($masthead.length) {
            let mastheadHeight = $masthead.outerHeight();

            $element.css({'top': `${mastheadHeight}px`});
        }

        // position sidebar (via parent) if the required elements were found
        if ($sharingBarLine.length && $title.length && $parent.length) {
            let parentOffset = $sharingBarLine.position().top,
                titleHeight = $title.outerHeight(true);
    
            $parent.css({'top': `${parentOffset - titleHeight}px`});
        }
    }
}
