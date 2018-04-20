import {FefDebounceHelper} from '../classes/fef-debounce-helper';
import {FefResponsiveHelper} from '../classes/fef-responsive-helper';

const SCROLL_PAGER_CLASS = 'js-scroll-pager-container',
    INNER_CONTAINER_CLASS = 'js-scroll-pager-content',
    BUTTON_BACK_CLASS = 'js-scroll-pager-button-back',
    BUTTON_FORWARD_CLASS = 'js-scroll-pager-button-forward',
    BUTTON_ACTIVE_CLASS = 'subnav__pager--visible',
    MASK_LEFT_CLASS = 'js-subnav-mask-left',
    MASK_RIGHT_CLASS = 'js-subnav-mask-right',
    MASK_VISIBLE_CLASS = 'subnav__mask--visible',
    ITEM_ACTIVE_CLASS = 'js-active-subnav-item',
    DEBOUNCETIME = 10,
    RIGHT_OFFSET = 24,
    BUTTON_BACK_THRESHOLD = 2,
    INNER_CONTAINER_SCROLL_PADDING = 84,
    DEFAULT_SCROLL_TIME = 200;

export function init() {
    $('.'+SCROLL_PAGER_CLASS).each((index, element) => {
        new FefScrollPager($(element));
    });
}

/**
 * This component handles the paging buttons and paging functionality of a horizontally scrollable items list as well
 * as the masks for overflowing navigation items
 */
export class FefScrollPager {

    /**
     * @param $element jQuery element
     */
    constructor($element) {
        this.itemLeftPositions = new Array();
        this.itemRightPositions = new Array();
        this.$element = $element;
        this.$innerContainer = $(`.${INNER_CONTAINER_CLASS}`, this.$element);
        this.$buttonBack = $(`.${BUTTON_BACK_CLASS}`, this.$element);
        this.$buttonForward = $(`.${BUTTON_FORWARD_CLASS}`, this.$element);
        this.$maskLeft = $(`.${MASK_LEFT_CLASS}`, this.$element);
        this.$maskRight = $(`.${MASK_RIGHT_CLASS}`, this.$element);

        this.init();
        this.initItemPositions();
        this.registerListeners();

        setTimeout(() => {
            this.centerActiveItem();
        }, 0);
    }

    init() {
        this.updateButtonStatus();
        this.updateMaskStatus();
    }

    initItemPositions() {
        this.$innerContainer.children().each( (index, element) => {
            this.itemLeftPositions.push($(element).position().left);
            this.itemRightPositions.push($(element).position().left + $(element).innerWidth());
        });
    }

    registerListeners() {
        $(window).on('resize', FefDebounceHelper.debounce(() => this.init(), DEBOUNCETIME));
        this.$innerContainer.on('scroll', FefDebounceHelper.debounce(() => this.init(), DEBOUNCETIME));
        this.$buttonBack.on('click', () => { this.pageBack(); });
        this.$buttonForward.on('click', () => { this.pageForward(); });
    }

    updateButtonStatus() {
        if (FefResponsiveHelper.isDesktop() || FefResponsiveHelper.isDesktopWide()) {
            // show forward button if needed
            if (this.isAtScrollEnd()) {
                this.$buttonForward.removeClass(BUTTON_ACTIVE_CLASS);
            } else if (this.hasScrollableOverflow()) {
                this.$buttonForward.addClass(BUTTON_ACTIVE_CLASS);
            } else {
                this.$buttonForward.removeClass(BUTTON_ACTIVE_CLASS);
            }

            // show back button if needed
            if (this.hasScrollableOverflow() && this.$innerContainer.scrollLeft() > BUTTON_BACK_THRESHOLD) {
                this.$buttonBack.addClass(BUTTON_ACTIVE_CLASS);
            } else {
                this.$buttonBack.removeClass(BUTTON_ACTIVE_CLASS);
            }
        }
    }

    updateMaskStatus() {
        if (FefResponsiveHelper.isSmartphone() || FefResponsiveHelper.isTablet()) {
            // show right mask if needed
            if (this.isAtScrollEnd()) {
                this.$maskRight.removeClass(MASK_VISIBLE_CLASS);
            } else if (this.hasScrollableOverflow()) {
                this.$maskRight.addClass(MASK_VISIBLE_CLASS);
            } else {
                this.$maskRight.removeClass(MASK_VISIBLE_CLASS);
            }

            // show left mask if needed
            if (this.hasScrollableOverflow() && this.$innerContainer.scrollLeft() > BUTTON_BACK_THRESHOLD) {
                this.$maskLeft.addClass(MASK_VISIBLE_CLASS);
            } else {
                this.$maskLeft.removeClass(MASK_VISIBLE_CLASS);
            }
        }
    }

    pageForward() {
        let nextItem = 0;

        for (let i = 0; i < this.itemRightPositions.length; i++) {
            if (this.itemRightPositions[i] > this.$innerContainer.scrollLeft() + this.$innerContainer.innerWidth()) {
                nextItem = i;
                break;
            }
        }

        let newPosition = this.itemLeftPositions[nextItem] - INNER_CONTAINER_SCROLL_PADDING;
        this.scrollToPosition(newPosition);
    }

    pageBack() {
        let nextItem = 0;

        for (let i = 0; i < this.itemRightPositions.length; i++) {
            if (this.itemRightPositions[i] > this.$innerContainer.scrollLeft() + INNER_CONTAINER_SCROLL_PADDING) {
                nextItem = i;
                break;
            }
        }

        let newPosition = this.itemRightPositions[nextItem] - this.$innerContainer.innerWidth() + INNER_CONTAINER_SCROLL_PADDING;
        this.scrollToPosition(newPosition);
    }

    centerActiveItem() {
        let $active = $(`.${ITEM_ACTIVE_CLASS}`, this.$element);

        let lContainer = this.$innerContainer.offset().left;
        let mContainer = lContainer + .5 * this.$innerContainer.outerWidth();
        let lActive = $active.offset().left;
        let mActive = lActive + .5 * $active.outerWidth();
      
        let diff = mActive - mContainer;
        let currentScroll = this.$innerContainer.scrollLeft();

        let newScrollPos = currentScroll + diff;

        this.$innerContainer.scrollLeft(newScrollPos);
    }

    scrollToPosition(position, time) {
        time = typeof time === 'undefined' ? DEFAULT_SCROLL_TIME : time;

        this.$innerContainer
            .stop(true, false)
            .animate( { scrollLeft: position }, time);
    }

    hasScrollableOverflow() {
        return this.$innerContainer[0].scrollWidth > this.$innerContainer.innerWidth() + RIGHT_OFFSET;
    }

    isAtScrollEnd() {
        return this.$innerContainer.scrollLeft() + this.$innerContainer.innerWidth() >= this.$innerContainer[0].scrollWidth;
    }
}
