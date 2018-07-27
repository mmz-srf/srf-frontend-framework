import {FefDebounceHelper} from '../classes/fef-debounce-helper';
import {FefResponsiveHelper} from '../classes/fef-responsive-helper';

const HOOK_CLASS = 'js-swipeable-area',
    INNER_CONTAINER_CLASS = 'js-swipeable-area-wrapper',
    ITEM_CLASS = 'js-swipeable-area-item',
    BACK_BUTTON_CLASS = 'swipeable-area__button',
    FORWARD_BUTTON_CLASS = 'swipeable-area__button swipeable-area__button--forward',
    BUTTON_ACTIVE_CLASS = 'swipeable-area__button--active',
    BUTTON_BACK_THRESHOLD = 2,
    RIGHT_OFFSET = 24,
    INNER_CONTAINER_SCROLL_PADDING = 50,
    DEFAULT_SCROLL_TIME = 200,
    DEBOUNCETIME = 10;

export function init() {
    $(`.${HOOK_CLASS}`).each((index, element) => {
        new FefSwipeableArea($(element));
    });
}

/**
 * This component
 */
export class FefSwipeableArea {

    constructor($element) {
        this.$element = $element;
        this.$innerContainer = $(`.${INNER_CONTAINER_CLASS}`, this.$element);
        this.$items = $(`.${ITEM_CLASS}`, this.$innerContainer);
        this.itemLeftPositions = new Array();
        this.itemRightPositions = new Array();
        this.$buttonBack = null;
        this.$buttonForward = null;

        this.init();
        this.registerListeners();
    }

    init() {
        this.initContainerHeight();
        if (FefResponsiveHelper.isDesktop() || FefResponsiveHelper.isDesktopWide()) {
            this.addButtons();
            this.updateButtonStatus();
            this.initItemPositions();
        }
    }

    // the size of the outer container must be set in order to hide the scrollbar
    // of the wrapper. this method determines the highest child and uses its
    // height as the container's height.
    initContainerHeight() {
        let itemHeights = this.$items.map( (i, item) => $(item).height() ).get();
        let maxHeight = Math.max.apply(null, itemHeights) + 8;
        this.$element.css('height', maxHeight);
    }

    initItemPositions() {
        this.$items.each( (index, element) => {
            this.itemLeftPositions.push($(element).position().left);
            this.itemRightPositions.push($(element).position().left + $(element).innerWidth());
        });
    }

    registerListeners() {
        $(window).on('resize', FefDebounceHelper.debounce(() => this.init(), DEBOUNCETIME));
    };

    addButtons() {
        if (this.$buttonBack === null) {
            //adding the buttons only once
            this.$buttonBack = $(`<div class='${BACK_BUTTON_CLASS}'></div>`);
            this.$buttonForward = $(`<div class='${FORWARD_BUTTON_CLASS}'></div>`);
            this.$element.append(this.$buttonBack, this.$buttonForward);

            // register listeners for buttons
            this.$innerContainer.on('scroll', FefDebounceHelper.debounce(() => this.updateButtonStatus(), DEBOUNCETIME));
            this.$buttonBack.on('click', () => { this.pageBack(); });
            this.$buttonForward.on('click', () => { this.pageForward(); });
        }
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

    hasScrollableOverflow() {
        return this.$innerContainer[0].scrollWidth > this.$innerContainer.innerWidth() + RIGHT_OFFSET;
    }

    isAtScrollEnd() {
        return this.$innerContainer.scrollLeft() + this.$innerContainer.innerWidth() >= this.$innerContainer[0].scrollWidth;
    }

    pageForward() {
        let visibleAreaRightEdge = this.$innerContainer.scrollLeft() + this.$innerContainer.innerWidth(),
            nextItem = this.itemRightPositions.findIndex(rightEdge => rightEdge > visibleAreaRightEdge),
            newPosition = this.itemLeftPositions[nextItem] - INNER_CONTAINER_SCROLL_PADDING;
        this.scrollToPosition(newPosition);
    }

    pageBack() {
        let visibleAreaLeftEdge = this.$innerContainer.scrollLeft() + INNER_CONTAINER_SCROLL_PADDING,
            nextItem = this.itemRightPositions.findIndex(rightEdge => rightEdge > visibleAreaLeftEdge),
            newPosition = this.itemLeftPositions[nextItem] - this.$innerContainer.innerWidth() + INNER_CONTAINER_SCROLL_PADDING;

        this.scrollToPosition(newPosition);
    }

    scrollToPosition(position, time) {
        time = typeof time === 'undefined' ? DEFAULT_SCROLL_TIME : time;

        this.$innerContainer
            .stop(true, false)
            .animate( { scrollLeft: position }, time);
    }
}
