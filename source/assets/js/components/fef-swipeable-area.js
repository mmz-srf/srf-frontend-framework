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
    DEFAULT_SCROLL_TIME = 400,
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
        this.itemLeftPositions = [];
        this.itemRightPositions = [];
        this.$buttonBack = null;
        this.$buttonForward = null;

        this.init();
        this.registerListeners();
    }

    init() {
        this.initContainerHeight();
        this.initItemCheck();
        if (FefResponsiveHelper.isDesktop() || FefResponsiveHelper.isDesktopWide()) {
            this.addButtons();
            this.updateButtonStatus();
            this.initItemPositions();
        }
    }

    // the size of the outer container must be explicitly set in order to hide the scrollbar
    // of the wrapper. To get the correct height, we set overflow to hidden to remove any
    // potential scrollbars, then get the height and set it to the element before re-
    // enabling the scrollbars on the inner wrapper. This also enables us to use the
    // same mechanism on mobiles (i.e. iOS) where there's no scrollbars.
    initContainerHeight() {
        this.$innerContainer.css('overflow', 'hidden');
        let height = this.$innerContainer.outerHeight();
        this.$element.css('height', height);
        this.$innerContainer.css('overflow', '');
    }

    initItemCheck() {
        const markVisibleClass = this.$element.data('mark-visible-items');
        const markHiddenClass = this.$element.data('mark-hidden-items');

        if (markVisibleClass || markHiddenClass) {
            this.$innerContainer.on('scroll', FefDebounceHelper.debounce(() => this.markItems(markVisibleClass, markHiddenClass), DEBOUNCETIME));
        }
    }

    initItemPositions() {
        this.$items.each( (index, element) => {
            this.itemLeftPositions.push($(element).position().left);
            this.itemRightPositions.push($(element).position().left + $(element).innerWidth());
        });
    }

    registerListeners() {
        $(window).on('resize', FefDebounceHelper.debounce(() => this.init(), DEBOUNCETIME));
        $(window).on('load', () => this.initContainerHeight());
    };

    addButtons() {
        if (this.$buttonBack === null) {
            //adding the buttons only once
            this.$buttonBack = $(`<div class='${BACK_BUTTON_CLASS}'><span></span></div>`);
            this.$buttonForward = $(`<div class='${FORWARD_BUTTON_CLASS}'><span></span></div>`);

            // Apply tracking parameters if provided
            if (this.$element.data('tracking-forward')) {
                this.$buttonForward.attr('data-event-track', this.$element.data('tracking-forward'));
            }
            if (this.$element.data('tracking-back')) {
                this.$buttonBack.attr('data-event-track', this.$element.data('tracking-back'));
            }

            this.$element.append(this.$buttonBack, this.$buttonForward);

            // register listeners for buttons
            this.$innerContainer.on('scroll', FefDebounceHelper.debounce(() => this.updateButtonStatus(), DEBOUNCETIME));
            this.$buttonBack.on('click', () => { this.pageBack(); });
            this.$buttonForward.on('click', () => { this.pageForward(); });

            // hinting = showing a little bit of the remaining elements on hovering over the buttons.
            // Can be supplied in pixels via data-attribute, e.g. data-swipeable-hinting="20"
            const hintAmount = parseInt(this.$element.data('swipeable-hinting'));

            if (hintAmount > 0) {
                this.$buttonBack.hover(this.hintOn(this.$buttonBack, hintAmount), this.hintOff(this.$buttonBack));
                this.$buttonForward.hover(this.hintOn(this.$buttonForward, -hintAmount), this.hintOff(this.$buttonForward));
            }
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

    /**
     * Scrolls to a specified position in a specified (or default) time.
     * Also resets the hinting, if applicable by removing the translation.
     *
     * @param {Number} position Where to scroll to
     * @param {Number} [time] How long it should take, optional
     */
    scrollToPosition(position, time) {
        time = typeof time === 'undefined' ? DEFAULT_SCROLL_TIME : time;

        this.$innerContainer.children().first().css('transform', 'translateX(0)');

        this.$innerContainer
            .stop(true, false)
            .animate( { scrollLeft: position }, time, 'easeInOutSine');
    }

    /**
     * When hovering over a button (forward or backward), the container content
     * will be "hinted at", i.e. moved into view a bit more. How much is defined by
     * the user via data attribute and provided here. At the same time, the button
     * is made wider and given some padding as to not move the caret (< or >).
     *
     * The amount can be positive or negative. To always increase the width, we take
     * the absolute of the provided amount.
     * To not have to differentiate between forward and backward button, we set both
     * left and right padding. One of them is negative and thus not valid and will
     * not be applied without any check from our side. Very smart. The best.
     *
     * @param {JQuery.element} $button Which button is being hovered over
     * @param {Number} amount Amount of pixels to "hint"
     * @returns {Function}
     */
    hintOn($button, amount) {
        return () => {
            this.$innerContainer.children().first().css({
                'transform': `translateX(${amount}px)`
            });
            $button.css({
                'width': $button.width() + Math.abs(amount),
                'padding-left': -amount,
                'padding-right': amount
            });
        };
    }

    hintOff ($button) {
        return () => {
            this.$innerContainer.children().first().css({
                'transform': 'translateX(0)'
            });
            $button.css({
                'width': '',
                'padding': ''
            });
        };
    }

    markItems(markVisibleClass, markHiddenClass) {
        this.$items.each( (_, element) => {
            const isInView = this.isItemCompletelyInView($(element));

            if (markVisibleClass) {
                $(element).toggleClass(markVisibleClass, isInView);
            }

            if (markHiddenClass) {
                $(element).toggleClass(markHiddenClass, !isInView);
            }
        });
    }

    isItemCompletelyInView($itemElem) {
        return !this.isOutOfBoundsLeft($itemElem) && !this.isOutOfBoundsRight($itemElem);
    }

    isOutOfBoundsLeft($itemElem) {
        return $itemElem.offset().left < this.$innerContainer.offset().left;
    }

    isOutOfBoundsRight($itemElem) {
        let rightEdgeItem = $itemElem.offset().left + $itemElem.outerWidth(),
            rightEdgeContainer = this.$innerContainer.offset().left + this.$innerContainer.outerWidth();

        return rightEdgeItem > rightEdgeContainer;
    }
}
