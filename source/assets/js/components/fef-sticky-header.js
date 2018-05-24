import {FefDebounceHelper} from '../classes/fef-debounce-helper';
import {FefResponsiveHelper} from '../classes/fef-responsive-helper';

export function init() {
    $('.js-masthead').each((i, elem) => {
        new FeFStickyHeader(elem);
    });
}

const DEBOUNCE_TIME = 100;
const AFFIX_SELECTOR = '.js-affix';

export class FeFStickyHeader {

    constructor(element) {
        this.$masthead = $(element);
        this.$mastheadNav = $('.masthead__nav', this.$masthead);

        this.initializeAffix();

        $(window).on('resize.sticky-header', FefDebounceHelper.debounce(() => this.reInitializeAffix(), DEBOUNCE_TIME));
    }

    initializeAffix() {
        // Do not initialize in case of home landingpage on a breakpoint larger then smartphone
        if(!(!FefResponsiveHelper.isSmartphone() && this.$masthead.hasClass('masthead--home'))) {
            $(AFFIX_SELECTOR).affix({offset:{top: this.getAffixMarginTop()}});
        }
    }

    reInitializeAffix() {
        // make sure that the affix is not registered twice
        $(window).off('.affix');
        $(AFFIX_SELECTOR).removeClass('affix affix-top').removeData('bs.affix');

        // initialize the affix
        this.initializeAffix();
    }

    getAffixMarginTop() {
        if (this.$mastheadNav.outerHeight() !== undefined) {
            return this.$masthead.outerHeight() - this.$mastheadNav.outerHeight() ;
        } else {
            return this.$masthead.outerHeight();
        }
    }
}
