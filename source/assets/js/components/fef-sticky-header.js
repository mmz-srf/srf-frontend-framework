import {FefDebounceHelper} from '../classes/fef-debounce-helper';

export function init() {
    $('.js-masthead').each((i, elem) => {
        new FeFStickyHeader(elem);
    });
}

const MASTHEAD_PADDING_BOTTOM = 24;
const DEBOUNCE_TIME = 20;

export class FeFStickyHeader {

    constructor(element, options) {
        this.$masthead = $(element);
        this.$mastheadNav = $('.masthead__nav');
        this.$stickyContainer = this.$masthead.closest('.sticky-container');
        this.$affixPlacehoder = $('.affix-placeholder');
        this.affixMarginTop = this.$masthead.outerHeight() - this.$mastheadNav.outerHeight();
        this.affixPlacehoderHeight = this.$masthead.outerHeight() + MASTHEAD_PADDING_BOTTOM;
        this.lastScrollTop = 0;
        this.hasResized = false;

        this.initializeAffix();
        this.registerListeners();
    }

    registerListeners() {
        $(window).on('scroll', FefDebounceHelper.debounce(() => this.afterScrolling(), DEBOUNCE_TIME) );
        $(window).on('resize', FefDebounceHelper.debounce(() => this.afterResize(), DEBOUNCE_TIME) );
    }

    afterScrolling() {
        let scrollTop = $(window).scrollTop() >= 0 ? $(window).scrollTop() : 0;
        let that = this;
        let scrollDifference = Math.abs(this.lastScrollTop - scrollTop);


        console.log(scrollDifference);
        console.log('scrolltop '+scrollTop);
        console.log('last scroll top '+this.lastScrollTop);

        if (!this.hasResized && scrollDifference > 5 || scrollTop === 0 && this.lastScrollTop === 0) {
            // scroll up > show full header
            if (scrollTop <= this.lastScrollTop) {
                this.$stickyContainer.css('margin-top', '0');
                this.$stickyContainer.addClass('sticky-container--full');

            }
            // scroll down > show small header
            else {
                $('.affix').css('margin-top', '-' + this.affixMarginTop + 'px');
                this.$stickyContainer.removeClass('sticky-container--full');
            }
        }

        this.hasResized = false;
        this.lastScrollTop = scrollTop;

    }

    afterResize() {
        this.hasResized = true;
        this.affixMarginTop = this.$masthead.outerHeight() - this.$mastheadNav.outerHeight();
        this.affixPlacehoderHeight = this.$masthead.outerHeight() + MASTHEAD_PADDING_BOTTOM;
        this.initializeAffix();

        if (this.$stickyContainer.hasClass('sticky-container--full')) {
            $('.affix').css('margin-top', '0');
        } else {
            $('.affix').css('margin-top', '-' + this.affixMarginTop + 'px');
        }

    }

    initializeAffix() {
        $('[data-smart-affix]').affix({offset:{top: this.affixMarginTop}});
        this.$affixPlacehoder.css('height', this.affixPlacehoderHeight + 'px');
    }

}
