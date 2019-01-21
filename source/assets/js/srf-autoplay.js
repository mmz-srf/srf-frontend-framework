import {FefDebounceHelper} from './classes/fef-debounce-helper';

const VIDEO_TEASER_SELECTOR = '.js-video-teaser';
const PLAYING_CLASS = 'teaser--theme-dark teaser--video-playing';
const SCROLL_THROTTLE_LIMIT = 100;

export function init() {
    // init the autoplay orchestrator if autoplay is supported (i.e. app context)
    new SrfAutoplay();
}

export class SrfAutoplay {
    constructor() {
        this.playableElements = $(VIDEO_TEASER_SELECTOR).toArray();
        this.$playingElement = null;

        if (this.playableElements.length > 0) {
            this.registerListeners();
        }
    }

    registerListeners() {
        $(window).on('scroll', FefDebounceHelper.throttle(() => this.onScroll(), SCROLL_THROTTLE_LIMIT));
    }

    onScroll() {
        let elementsInViewport = this.playableElements.filter((elem) => this.isElementInViewport(elem));

        if (elementsInViewport.length > 0) {
            let $firstElementInViewport = $(elementsInViewport[0]);

            // Ok, so we have a playable element in the viewport. Nice. One of 3 cases will apply:
            // * nothing is playing. That's the easiest. Just play the first one in the viewport.
            if (!this.$playingElement) {
                this.autoplayElement($firstElementInViewport);
                return;
            }

            // * something is playing. ok. If it's already the element that we were going to play - no problem, because then we don't have to do anything.
            if ($firstElementInViewport === this.$playingElement) {
                return;
            }

            // * something is playing and it's not the same as the one we want to play anyway? That's easy, too: stop the playing element and start the new one.
            this.stopElement(this.$playingElement);
            this.autoplayElement($firstElementInViewport);

        } else if (this.$playingElement) {
            this.stopElement(this.$playingElement);
        }
    }

    stopElement($element) {
        $element.removeClass(PLAYING_CLASS);
    }

    autoplayElement($element) {
        this.$playingElement = $element;
        this.$playingElement.addClass(PLAYING_CLASS);
    }

    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}
