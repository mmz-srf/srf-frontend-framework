import {FefResponsiveHelper} from '../classes/fef-responsive-helper';
import {FefResizeListener} from '../classes/fef-resize-listener';

export function init() {
    $('.js-masthead').each((i, elem) => {
        new FeFStickyHeader(elem);
    });
}

const DEBOUNCE_TIME = 100;
const AFFIX_SELECTOR = '.js-affix';
const PLACEHOLDER_SELECTOR = '.js-affix-placeholder';
const AFFIX_EVENT_START = 'affix.bs.affix';
const AFFIX_EVENT_STOP = 'affixed-top.bs.affix';

export class FeFStickyHeader {

    constructor(element) {
        this.$masthead = $(element);
        this.$mastheadNav = $('.masthead__nav', this.$masthead);

        this.initializeAffix();

        FefResizeListener.subscribeDebounced(this.reInitializeAffix);
    }

    /* eslint-disable no-lonely-if */
    initializeAffix() {
        let offsetTop = this.getAffixOffsetTop();

        // home: offset is 0 on tablet+
        // home + longportalnames: offset is 0 on desktop+
        if (this.$masthead.hasClass('masthead--home')) {
            const isRTRHomeAndDesktopUp = this.$masthead.hasClass('masthead--longportalnames') && FefResponsiveHelper.isDesktopUp();
            const isSRFHomeAndTabletUp = !this.$masthead.hasClass('masthead--longportalnames') && FefResponsiveHelper.isTabletUp();

            if (isRTRHomeAndDesktopUp || isSRFHomeAndTabletUp) {
                offsetTop = 0;
            }
        }

        $(PLACEHOLDER_SELECTOR).css('height', this.getMastheadHeight());

        $(AFFIX_SELECTOR)
            .affix({offset:{top: offsetTop}})
            .on(AFFIX_EVENT_START, (_) => this.onMastheadAffix())
            .on(AFFIX_EVENT_STOP, (_) => this.onMastheadUnaffix());
    }
    /* eslint-enable no-lonely-if */

    onMastheadAffix() {
        // when the masthead will be affixed, the placeholder's height is set to the masthead's
        $(PLACEHOLDER_SELECTOR).css('height', this.getMastheadHeight());
        this.$masthead.addClass('masthead--affixed');
    }

    onMastheadUnaffix() {
        this.$masthead.removeClass('masthead--affixed');
    }

    reInitializeAffix() {
        // make sure that the affix is not registered twice
        $(window).off('.affix');
        $(AFFIX_SELECTOR).removeClass('affix affix-top').removeData('bs.affix');
        $(AFFIX_SELECTOR).off(`${AFFIX_EVENT_START} ${AFFIX_EVENT_STOP}`);

        this.initializeAffix();
    }

    getAffixOffsetTop() {
        let offsetTop = this.getMastheadHeight();

        // subtract navigation's height if it exists
        if (this.$mastheadNav.outerHeight() !== undefined) {
            offsetTop -= this.$mastheadNav.outerHeight();
        }

        return offsetTop;
    }

    /**
     * When resizing, it's possible that elements in the masthead are hidden
     * that have an influence on the offset. That's why we check if the
     * masthead is currently affixed and thus might have hidden elements.
     * If so, we quickly show them before measuring the height and then hide
     * them again immediately.
     */
    getMastheadHeight() {
        const isAffixed = this.$masthead.hasClass('masthead--affixed');
        let height = 0;

        if (isAffixed) {
            this.$masthead.removeClass('masthead--affixed');
        }

        height = this.$masthead.outerHeight(true);

        if (isAffixed) {
            this.$masthead.addClass('masthead--affixed');
        }

        return height;
    }
}
