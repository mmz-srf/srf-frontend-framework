import { DOM_INIT_EVENT } from '../utils/fef-events';
import { FefDebounceHelper } from '../classes/fef-debounce-helper';

const JS_HOOK_ELEMENT = '.js-sticky-bar';
const JS_HOOK_CLOSE_BUTTON = '.js-close-sticky-bar';
const TIME_TO_SHOW = 3000;

$(window).on(DOM_INIT_EVENT, () => {
    $(JS_HOOK_ELEMENT).each((_, element) => {
        new FefStickyBar($(element));
    });
});

export class FefStickyBar {

    /**
     * @param $element jQuery element
     */
    constructor ($element) {
        this.$element = $element;
        this.bindEvents();
    }

    /**
     * Bind events to show/hide the sticky bar.
     * The bar should appear when the page was scrolled >= 50% of the page's
     * height. Thus we need to listen to the window's scroll event; if possible
     * passively for performance reasons and of course debounced.
     * If the page can't be scrolled, it should appear after a fixed
     * amount of time.
     * The close button should hide the bar.
     */
    bindEvents () {
        // enable dismissing the bar in any way
        this.$element.find(JS_HOOK_CLOSE_BUTTON).on('click', () => this.hideBar());

        // If page is not scrollable, show the bar after a predefined time
        if (document.body.offsetHeight <= window.innerHeight) {
            setTimeout(() => this.showBar(), TIME_TO_SHOW);
            // don't care about the scroll event at all
            return;
        }

        // need to have the same function reference to remove listener again
        this.debouncedCheck = FefDebounceHelper.debounce(() => this.checkPosition());

        // check if passive event listeners are supported
        this.supportsPassive = false;
        try {
            let opts = Object.defineProperty({}, 'passive', {
                get: () => this.supportsPassive = true
            });
            window.addEventListener('test', null, opts);
        } catch (e) {}

        window.addEventListener(
            'scroll',
            this.debouncedCheck,
            this.supportsPassive ? { passive: true } : false
        ); 
    }

    /**
     * Check if the scrollposition is >= 50% of the page height.
     * If so, show the bar and remove the scroll event listener.
     */
    checkPosition() {
        if (window.scrollY >= (window.outerHeight/2)) {
            this.showBar();

            window.removeEventListener(
                'scroll',
                this.debouncedCheck,
                this.supportsPassive ? { passive: true } : false
            );
        }
    }

    /**
     * Show the bottom bar and add some margin at the bottom of the body, so
     * that the very end of the page is not covered by the bar.
     */
    showBar() {
        this.$element.show();
        let barHeight = this.$element.outerHeight();

        this.$element.css({
            'bottom': `-${barHeight}px`,
            'transform': `translateY(-${barHeight}px)`
        });

        $('body').css('margin-bottom', barHeight);
    }

    /**
     * Hide the bar again and remove the previously added bottom-margin.
     */
    hideBar() {
        let barHeight = this.$element.outerHeight();

        this.$element.one('transitionend', () => this.$element.hide());

        this.$element.css({
            'transform': `translateY(${barHeight}px)`
        });

        $('body').css('margin-bottom', '');
    }
}
