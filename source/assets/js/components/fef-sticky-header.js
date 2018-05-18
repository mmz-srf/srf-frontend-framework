import {FefDebounceHelper} from '../classes/fef-debounce-helper';
import {FefResponsiveHelper} from '../classes/fef-responsive-helper';

export function init() {
    $('.js-masthead').each((i, elem) => {
        new FeFStickyHeader(elem);
    });
}

const DEBOUNCE_TIME = 20;

export class FeFStickyHeader {

    constructor(element, options) {
        this.$masthead = $(element);
        this.$mastheadWrapper = $('.masthead__wrapper', this.$masthead);
        this.$mastheadBackground = $('.masthead__background', this.$masthead);
        this.$mastheadNav = $('.masthead__nav', this.$masthead);

        // Do not initialize in case of home landingpage on a breakpoint larger then smartphone
        if(!(!FefResponsiveHelper.isSmartphone() && this.$masthead.hasClass('masthead--home'))) {
            this.initializeAffix();
            this.registerListeners();
        }
    }

    initializeAffix() {
        $('[data-smart-affix]').affix({offset:{top: this.getAffixMarginTop()}});
    }

    registerListeners() {
        $(window).on('resize', FefDebounceHelper.debounce(() => this.afterResize(), DEBOUNCE_TIME));

        // register branding transition animation only on branded headers
        if(this.$masthead[0].className.includes('masthead--theme')) {
            $(window).on('affix.bs.affix affix-top.bs.affix', () => this.doBrandingTransition());
        }
    }

    afterResize() {
        $('[data-smart-affix]').attr('bs.affix').options.offset = this.getAffixMarginTop();
    }

    getAffixMarginTop() {
        if (this.$mastheadNav.outerHeight() !== undefined) {
            return this.$masthead.outerHeight() - this.$mastheadNav.outerHeight();
        } else {
            return this.$masthead.outerHeight();
        }
    }

    doBrandingTransition() {
        this.$mastheadWrapper.animate ({ opacity: 0 }, 100);
        this.$mastheadBackground.animate ({ opacity: 0 }, 100, () => {
            this.$masthead.toggleClass('masthead--overridden');
            this.$mastheadWrapper.animate ({ opacity: 1 }, 100);
            this.$mastheadBackground.animate ({ opacity: 1 }, 100);
        });
    }
}
