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

    /* eslint-disable no-lonely-if */
    initializeAffix() {
        let shouldInitializeAffix = false;

        // not home
        if (!this.$masthead.hasClass('masthead--home')) {
            shouldInitializeAffix = true;
        }
        else {

            // rtr home - affix on smartphone and tablet
            if (this.$masthead.hasClass('masthead--longportalnames')) {
                if (FefResponsiveHelper.isSmartphone() || FefResponsiveHelper.isTablet()) {
                    shouldInitializeAffix = true;
                }
                else {
                    shouldInitializeAffix = false;
                }
            }

            // srf home - affix on smartphone only
            else {
                if (FefResponsiveHelper.isSmartphone()) {
                    shouldInitializeAffix = true;
                }
                else {
                    shouldInitializeAffix = false;
                }
            }
        }

        if(shouldInitializeAffix) {
            $(AFFIX_SELECTOR).affix({offset:{top: this.getAffixMarginTop()}});
        }
    }
    /* eslint-disable */

    reInitializeAffix() {
        // make sure that the affix is not registered twice
        $(window).off('.affix');
        $(AFFIX_SELECTOR).removeClass('affix affix-top').removeData('bs.affix');

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
