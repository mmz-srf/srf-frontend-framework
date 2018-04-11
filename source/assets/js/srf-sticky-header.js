import {FefDebounceHelper} from './classes/fef-debounce-helper';

export function init() {
    $('.js-masthead').each((i, elem) => {
        new SrfStickyHeader(elem);
    });
}

const MASTHEAD_PADDING_BOTTOM = 24;
const DEBOUNCE_TIME_SCROLLING = 10;
const DEBOUNCE_TIME_RESIZE = 100;

export class SrfStickyHeader {

    constructor(element, options) {
        this.$masthead = $(element);
        this.$mastheadNav = $('.masthead__nav');
        this.$stickyContainer = this.$masthead.closest('.sticky-container');
        this.$affixPlacehoder = $('.affix-placeholder');
        this.affixMarginTop = this.$masthead.outerHeight() - this.$mastheadNav.outerHeight();
        this.affixPlacehoderHeight = this.$masthead.outerHeight() + MASTHEAD_PADDING_BOTTOM;
        this.lastScrollTop = 0;

        this.initializeAffix();
        this.registerListeners();
    }

    registerListeners() {
        $(window).on('scroll', FefDebounceHelper.debounce(() => this.afterScrolling(), DEBOUNCE_TIME_SCROLLING) );
        $(window).on('resize', FefDebounceHelper.debounce(() => this.afterResize(), DEBOUNCE_TIME_RESIZE) );
    }

    afterScrolling() {
        let scrollTop = $(window).scrollTop();

        // scroll up > show full header
        if (scrollTop <= this.lastScrollTop) {
            this.$stickyContainer.css('margin-top', '0');

        // scroll down > show small header
        } else {
            $('.affix').css('margin-top', '-' + this.affixMarginTop + 'px');
        }

        this.lastScrollTop = scrollTop;
    }

    afterResize() {
        this.affixMarginTop = this.$masthead.outerHeight() - this.$mastheadNav.outerHeight();
        this.affixPlacehoderHeight = this.$masthead.outerHeight() + MASTHEAD_PADDING_BOTTOM;
        this.initializeAffix();
        this.afterScrolling;
    }

    initializeAffix() {
        $('[data-smart-affix]').affix({offset:{top: this.affixMarginTop}});
        this.$affixPlacehoder.css('height', this.affixPlacehoderHeight + 'px');
    }

}
