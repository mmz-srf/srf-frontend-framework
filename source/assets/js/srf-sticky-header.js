import {FefDebounceHelper} from './classes/fef-debounce-helper';

export function init() {
    $('.js-masthead').each((i, elem) => {
        new SrfStickyHeader(elem);
    });
}

const MASTHEAD_PADDING_BOTTOM = 30;
const DEBOUNCE_TIME_SCROLLING = 10;
const DEBOUNCE_TIME_RESIZE = 100;

export class SrfStickyHeader {

    constructor(element, options) {
        this.$masthead = $(element);
        this.$mastheadNav = $('.masthead__nav');
        this.$stickyContainer = this.$masthead.closest('.sticky-container');
        this.$affixPlacehoder = $('.affix-placeholder');
        this.affixMarginTop = this.$masthead.height() - this.$mastheadNav.height();
        this.affixPlacehoderHeight = this.$masthead.height() + MASTHEAD_PADDING_BOTTOM;
        this.isAffixTop = false;
        this.lastScrollTop = 0;

        this.initializeAffix();
        this.registerListeners();
    }

    registerListeners() {
        $(window).on('scroll', FefDebounceHelper.debounce(() => this.afterScrolling(), DEBOUNCE_TIME_SCROLLING) );
        $(window).on('resize', FefDebounceHelper.debounce(() => this.afterResize(), DEBOUNCE_TIME_RESIZE) );
    }

    afterScrolling() {
        let that = this;
        let scrollTop = $(window).scrollTop();

        that.isAffixTop = !that.$stickyContainer.hasClass('affix');

        // scroll up > show full header
        if (scrollTop <= that.lastScrollTop) {

            that.$stickyContainer.css('margin-top', '0');

            if (that.isAffixTop) {
                $('.affix').css('position', 'fixed');
            }

            // scroll down > show small header
        } else {

            $('.affix').css('margin-top', '-' + that.affixMarginTop + 'px');

            if (that.isAffixTop) {
                that.$stickyContainer.css('position', 'absolute');
                that.$stickyContainer.css('margin-top', '');
                that.$stickyContainer.css('transition', 'none');
            } else {
                that.$stickyContainer.css('position', 'fixed');
                that.$stickyContainer.css('transition', 'margin-top 300ms linear');
            }

        }

        that.lastScrollTop = scrollTop;
    }

    afterResize() {
        let that = this;
        this.affixMarginTop = this.$masthead.height() - this.$mastheadNav.height();
        this.affixPlacehoderHeight = this.$masthead.height() + MASTHEAD_PADDING_BOTTOM;
        this.initializeAffix();

        $(window).scrollTop($(window).scrollTop()+1);
    }

    initializeAffix() {
        $('[data-smart-affix]').affix({offset:{top: this.affixMarginTop}});
        this.$affixPlacehoder.css('height', this.affixPlacehoderHeight + 'px');
    }

}
