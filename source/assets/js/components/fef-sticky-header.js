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
        let scrollTop = $(window).scrollTop();
        let that = this;
        let scrollDifference = Math.abs(this.lastScrollTop - scrollTop);


        /*
         * Sticky Header must stay as it is after resizing
         * Sticky Header may not change state after a minimal scrolling (5 pixel)
         * Sticky Header may not change state if scrollTop has a negative value (safari)
         */
        if (!this.hasResized && scrollDifference > 5 || scrollTop < 0) {
            // scroll up > show full header
            if (scrollTop <= this.lastScrollTop) {
                this.$stickyContainer.css('margin-top', '0');
                this.$stickyContainer.addClass('sticky-container--full');
                this.$masthead[0].className = this.$masthead[0].className.replace(/\-\-off\-theme\-/g, '--theme-');
            }
            // scroll down > show small header
            else {
                $('.affix').css('margin-top', '-' + this.affixMarginTop + 'px');
                this.$stickyContainer.removeClass('sticky-container--full');
                if(scrollTop >= this.affixMarginTop) {
                    this.$masthead.addClass('masthead--in-transition');
                    setTimeout(
                        function() {
                            that.$masthead.removeClass('masthead--in-transition');
                            that.$masthead[0].className = that.$masthead[0].className.replace(/\-\-theme\-/g, '--off-theme-');
                        },
                        225
                    );
                }
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
