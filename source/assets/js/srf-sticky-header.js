export function init() {
    $('.js-masthead').each((i, elem) => {
        new SrfStickyHeader(elem);
    });
}

export class SrfStickyHeader {

    constructor(element, options) {
        this.$masthead = $(element);
        this.$mastheadNav = $('.masthead__nav');
        this.affixMarginTop = this.$masthead.height() - this.$mastheadNav.height();
        this.$affixPlacehoder = $('.affix-placeholder');
        this.affixPlacehoderHeight = this.$masthead.height() + 30;

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
                let st = $(this).scrollTop();
                if (st < lastScrollTop) {
                    $('.affix').css('margin-top', '0');
                } else {
                    $('.affix').css('margin-top', '-' + that.affixMarginTop + 'px');
                }
                lastScrollTop = st;
            }, 10);
        });
    }

    initializeAffix() {
        $('[data-smart-affix]').affix({offset:{top: this.getCorrectOffset()}});
        this.$affixPlacehoder.css('height', this.affixPlacehoderHeight + 'px');
    }

    getCorrectOffset() {
        return $('[data-smart-affix-placeholder]').offset().top + $(window).scrollTop();
    }

}
