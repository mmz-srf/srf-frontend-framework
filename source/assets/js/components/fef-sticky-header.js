import {FefDebounceHelper} from '../classes/fef-debounce-helper';
import {FefResponsiveHelper} from '../classes/fef-responsive-helper';

export function init() {
    $('.js-masthead').each((i, elem) => {
        new FeFStickyHeader(elem);
    });
}

const DEBOUNCE_TIME = 100;
const AFFIX_SELECTOR = '.js-affix';
const PLACEHOLDER_SELECTOR = '.js-affix-placeholder';

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
        } else {
            if (this.$masthead.hasClass('masthead--longportalnames')) { // rtr home - affix on smartphone and tablet
                shouldInitializeAffix = FefResponsiveHelper.isSmartphone() || FefResponsiveHelper.isTablet();
            } else { // srf home - affix on smartphone only
                shouldInitializeAffix = FefResponsiveHelper.isSmartphone();
            }
        }

        if (shouldInitializeAffix) {
            $(AFFIX_SELECTOR).affix({offset:{top: this.getAffixMarginTop()}});

            $(AFFIX_SELECTOR).on('affix.bs.affix', (e) => {
                // when the masthead will be affixed, the placeholder's height is set to the masthead's
                $(PLACEHOLDER_SELECTOR).css('height', this.$masthead.outerHeight(true));
                this.$masthead.addClass('masthead--affixed');
            }).on('affixed-top.bs.affix', (e) => {
                // when the masthead is no longer affixed, the placeholder's height is reset
                $(PLACEHOLDER_SELECTOR).css('height', '');
                this.$masthead.removeClass('masthead--affixed');
            });
        }
    }
    /* eslint-enable no-lonely-if */

    reInitializeAffix() {
        // make sure that the affix is not registered twice
        $(window).off('.affix');
        $(AFFIX_SELECTOR).removeClass('affix affix-top').removeData('bs.affix');
        $(AFFIX_SELECTOR).off('affixed-top.bs.affix affix.bs.affix');

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
