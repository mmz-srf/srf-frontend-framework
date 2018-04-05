export function init() {
    $('.js-masthead').each((i, elem) => {
        new SrfStickyHeader(elem);
    });
}

export const MASTHEAD_PADDING_BOTTOM = 30;

export class SrfStickyHeader {

    constructor(element, options) {
        this.$masthead = $(element);
        this.$mastheadNav = $('.masthead__nav');
        this.$stickyContainer = this.$masthead.closest('.sticky-container');
        this.affixMarginTop = this.$masthead.height() - this.$mastheadNav.height();
        this.$affixPlacehoder = $('.affix-placeholder');
        this.affixPlacehoderHeight = this.$masthead.height() + MASTHEAD_PADDING_BOTTOM;
        this.isAffixTop = false;

        this.initializeAffix();
        this.registerListeners();
    }

    registerListeners() {
        let that = this;
        let debounceTimer;
        let lastScrollTop = 0;

        $(window).scroll(function() {

            if(debounceTimer) {
                window.clearTimeout(debounceTimer);
            }
            debounceTimer = window.setTimeout(function() {

                let scrollTop = $(this).scrollTop();

                if (that.$stickyContainer.hasClass('affix')) {
                    that.isAffixTop = false;
                    that.$stickyContainer.css('transition', 'margin-top 300ms linear');
                } else {
                    that.isAffixTop = true;
                    that.$stickyContainer.css('margin-top', '');
                    that.$stickyContainer.css('transition', 'none');
                }

                if (scrollTop <= lastScrollTop) {
                    // scroll up

                    if (that.isAffixTop) {
                        that.$stickyContainer.css('position', 'fixed');
                    }

                    $('.affix').css('margin-top', '0');
                } else {
                    // scroll down

                    if (that.isAffixTop) {
                        that.$stickyContainer.css('position', 'absolute');
                    } else {
                        that.$stickyContainer.css('position', 'fixed');
                    }

                    $('.affix').css('margin-top', '-' + that.affixMarginTop + 'px');
                }
                lastScrollTop = scrollTop;
            }, 10);
        });
    }

    initializeAffix() {
        $("[data-smart-affix]").affix({offset:{top: this.affixMarginTop}});
        this.$affixPlacehoder.css('height', this.affixPlacehoderHeight + 'px');
    }

}
