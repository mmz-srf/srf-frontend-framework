import {FefDebounceHelper} from '../classes/fef-debounce-helper';
import {FefResponsiveHelper} from '../classes/fef-responsive-helper';


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

        // Do not initialize in case of home landingpage on a breakpoint larger then smartphone
        if(!(!FefResponsiveHelper.isSmartphone() && this.$masthead.hasClass('masthead--home'))) {
            this.initializeAffix();
            this.registerListeners();
        }
    }

    initializeAffix() {
        $("[data-smart-affix]").affix({offset:{top: this.getAffixMarginTop()}});
    }

    registerListeners() {
        $(window).on('resize', FefDebounceHelper.debounce(() => this.afterResize(), DEBOUNCE_TIME) );
    }

    getCorrectOffset() {
        return $("[data-smart-affix-placeholder]").offset().top + $(window).scrollTop();
    }

    afterResize() {
        $("[data-smart-affix]").data("bs.affix").options.offset = this.getAffixMarginTop();
    }

    getAffixMarginTop() {
        if (!FefResponsiveHelper.isSmartphone() && this.$masthead.hasClass('masthead--home')) {
            return 0;
        } else if (this.$mastheadNav.outerHeight() !== undefined) {

            console.log();

            return this.$masthead.outerHeight() - this.$mastheadNav.outerHeight();
        } else {
            return this.$masthead.outerHeight();
        }
    }

}
