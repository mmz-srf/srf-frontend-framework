import {FefDebounceHelper} from '../classes/fef-debounce-helper';
import {FefResponsiveHelper} from '../classes/fef-responsive-helper';
import {FefTouchDetection} from '../classes/fef-touch-detection';

const HOOK_CLASS = 'js-swipeable-area',
    INNER_CONTAINER_CLASS = 'js-swipeable-area-wrapper',
    ITEM_CLASS = 'js-swipeable-area-item',
    DEFAULT_PARTIALLY_VISIBLE_ITEM_CLASS = 'swipeable-area__item--hidden',
    BACK_BUTTON_CLASS = 'swipeable-area__button swipeable-area__button--back',
    FORWARD_BUTTON_CLASS = 'swipeable-area__button swipeable-area__button--forward',
    BUTTON_ACTIVE_CLASS = 'swipeable-area__button--active',
    BUTTON_BACK_THRESHOLD = 2,
    RIGHT_OFFSET = 24,
    DEFAULT_SCROLL_TIME = 400,
    DEBOUNCETIME = 75,
    DEBOUNCETIME_SCROLL_TRACKING = 1000,
    HINT_AMOUNT = 20;

export function init(interactionMeasureString = '') {
    $(`.${HOOK_CLASS}`).each((_, element) => {
        new FefSwipeableArea($(element), interactionMeasureString);
    });
}

/**
 * This component
 */
export class FefSwipeableArea {

    constructor($element, interactionMeasureString = '') {
        this.$element = $element;
        this.$innerContainer = $(`.${INNER_CONTAINER_CLASS}`, this.$element);
        this.$items = [];
        this.itemPositions = [];
        this.$buttonBack = null;
        this.$buttonForward = null;
        this.interactionMeasureString = interactionMeasureString;

        this.visibleClass = null;
        this.hiddenClass = null;

        this.oldScrollLeft = this.$innerContainer.scrollLeft();
        this.isPageBackClick = false;
        this.isPageForwardClick = false;

        this.initOnce();
        this.init();
    }

    initOnce() {
        this.initItemCheck();
        this.registerGeneralListeners();
    }

    init() {
        this.$items = $(`.${ITEM_CLASS}`, this.$innerContainer);

        if (FefResponsiveHelper.isDesktopUp() && !FefTouchDetection.isTouchSupported()) {
            this.registerDesktopListeners();
            this.markItems();
            this.addButtons();
            this.updateButtonStatus();
            this.initItemPositions();
            this.setupHinting();
        } else {
            this.deregisterDesktopListeners();
            this.disableHinting();
        }
    }

    initItemCheck() {
        const markVisibleClass = this.$element.data('mark-visible-items');
        const markHiddenClass = this.$element.data('mark-hidden-items');

        this.visibleClass = markVisibleClass ? markVisibleClass : '';
        this.hiddenClass = markHiddenClass ? markHiddenClass : DEFAULT_PARTIALLY_VISIBLE_ITEM_CLASS;
    }

    initItemPositions() {
        this.itemPositions = [];

        this.$items.each( (index, element) => {
            const left = $(element).position().left;
            // take width of first child because element itself may have margin/padding which should not be counted
            const width = $(element).children().first().innerWidth();

            this.itemPositions.push({
                left: left,
                center: left + (width / 2),
                right: left + width
            });
        });
    }

    registerGeneralListeners() {
        $(window).on('resize', FefDebounceHelper.debounce(() => this.init(), DEBOUNCETIME));
        $(window).on('srf.styles.loaded', () => this.init());
        this.$innerContainer.on('scroll', FefDebounceHelper.throttle(() => this.track(), DEBOUNCETIME_SCROLL_TRACKING));
        this.$element.on('srf.swipeable.content-changed', () => this.init());
    };

    registerDesktopListeners() {
        this.$items
            .off('click.srf.swipeable-area-desktop')
            .on('click.srf.swipeable-area-desktop', (event) => this.onTeaserClick(event));

        this.$innerContainer
            .off('scroll.srf.swipeable-area-desktop')
            .on('scroll.srf.swipeable-area-desktop', FefDebounceHelper.throttle(() => this.scrollHandlerDesktop(), DEBOUNCETIME));
    }

    deregisterDesktopListeners() {
        this.$items.off('click.srf.swipeable-area-desktop');
        this.$innerContainer.off('scroll.srf.swipeable-area-desktop');
    }

    scrollHandlerDesktop() {
        this.markItems();
        this.updateButtonStatus();
    }

    addButtons() {
        // making sure to add the buttons only once
        if (this.$buttonBack === null) {
            this.$buttonBack = $(`<div class='${BACK_BUTTON_CLASS}'><span></span></div>`);
            this.$buttonForward = $(`<div class='${FORWARD_BUTTON_CLASS}'><span></span></div>`);

            this.$element.append(this.$buttonBack, this.$buttonForward);
        }
    }

    /**
     * When hovering over a partially shown item, the container content
     * will be "hinted at", i.e. moved into view a bit more.
     */
    setupHinting() {
        // hinting = showing a little bit of the remaining elements on hovering over the buttons.
        const useHinting = !!this.$element.data('swipeable-hinting');

        if (!useHinting) {
            return;
        }

        this.$items
            .off('mouseenter.srf.swipeable-area-desktop')
            .on('mouseenter.srf.swipeable-area-desktop', (event) => this.onTeaserHover(event))
            .off('mouseleave.srf.swipeable-area-desktop')
            .on('mouseleave.srf.swipeable-area-desktop', (_) => this.applyHint(0));
    }

    disableHinting() {
        this.$items.off('mouseenter.srf.swipeable-area-desktop');
        this.$items.off('mouseleave.srf.swipeable-area-desktop');
    }

    /**
     * Hovering over an item can trigger the hinting mechanism, if it's
     * partially visible.
     *
     *
     * @param {jQery.event} event
     */
    onTeaserHover(event) {
        let $item = $(event.currentTarget);

        if (!$item.hasClass(this.hiddenClass)) {
            return;
        }

        // Hint left or right, depending on where the item is
        this.applyHint(this.isOutOfBoundsLeft($item) ? HINT_AMOUNT : -HINT_AMOUNT);
    }

    /**
     * Clicking an item can trigger pagination if it's partially visible.
     * Instead of handing down the analytics methods or module to call upon
     * pagination, we trigger a click on the buttons which have the correct
     * data attribute already.
     *
     * @param {jQuery.event} event
     */
    onTeaserClick(event) {
        let $item = $(event.currentTarget);

        if (!$item.hasClass(this.hiddenClass)) {
            return;
        }

        // remove focus from the element that was just clicked if it was a mouse click
        if (FefTouchDetection.eventIsMouseclick(event)) {
            $(':focus').blur();
        }

        if (this.isOutOfBoundsLeft($item)) {
            this.pageBack();
        } else {
            this.pageForward();
        }

        // Don't go to the link of the teaser
        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    /**
     * Shows/hides the buttons via class if needed.
     * - Buttons only appear on Breakpoints Desktop and Desktop Wide
     * - If scrolled to the very end, don't show the forward button
     * - If scrolled to the very beginning, don't show the back button
     * 
     * If the buttons shouldn't be visible at all, they're hidden here.
     */
    updateButtonStatus() {
        // show forward/back buttons if needed
        if (this.hasScrollableOverflow()) {
            this.$buttonForward.toggleClass(BUTTON_ACTIVE_CLASS, !this.isAtScrollEnd());
            this.$buttonBack.toggleClass(BUTTON_ACTIVE_CLASS, !this.isAtScrollBeginning());
        } else {
            this.$buttonForward.removeClass(BUTTON_ACTIVE_CLASS);
            this.$buttonBack.removeClass(BUTTON_ACTIVE_CLASS);
        }
    }

    hasScrollableOverflow() {
        return this.$innerContainer[0].scrollWidth > this.$innerContainer.innerWidth() + RIGHT_OFFSET;
    }

    isAtScrollEnd() {
        return this.$innerContainer.scrollLeft() + this.$innerContainer.innerWidth() >= this.$innerContainer[0].scrollWidth;
    }

    isAtScrollBeginning() {
        return this.$innerContainer.scrollLeft() <= BUTTON_BACK_THRESHOLD;
    }

    /**
     * Paging forward (-->):
     * Get the right-most item that's partially out of view (i.e. its right edge
     * is over the visible area's right edge).
     * Then get the one after that and try to center it. If there's no next one
     * we just take the last (the right-most) and use this.
     */
    pageForward() {
        let visibleAreaRightEdge = this.$innerContainer.scrollLeft() + this.$innerContainer.innerWidth(),
            nextItemIndex = this.itemPositions.findIndex(pos => pos.right > visibleAreaRightEdge);

        nextItemIndex = Math.min(nextItemIndex + 1, this.itemPositions.length - 1);

        let newPosition = this.itemPositions[nextItemIndex].center - (this.$innerContainer.innerWidth() / 2);

        this.isPageForwardClick = true;
        this.scrollToPosition(newPosition);
    }

    /**
     * Paging back (<--):
     * Get the left-most item that's partially out of view (i.e. its right edge
     * is over the visible area's left edge).
     * Then get the one before that and try to center it. If there's no previous one
     * we just take the first (the left-most) and use this.
     */
    pageBack() {
        let visibleAreaLeftEdge = this.$innerContainer.scrollLeft(),
            nextItemIndex = this.itemPositions.findIndex(pos => pos.right > visibleAreaLeftEdge);

        nextItemIndex = Math.max(nextItemIndex - 1, 0);

        let newPosition = this.itemPositions[nextItemIndex].center - (this.$innerContainer.innerWidth() / 2);

        this.isPageBackClick = true;
        this.scrollToPosition(newPosition);
    }

    /**
     * Scrolls to a specified position in a specified (or default) time.
     * Also resets the hinting, if applicable, by removing the translation.
     *
     * @param {Number} position Where to scroll to
     * @param {Number} [time] How long it should take, optional
     */
    scrollToPosition(position, time) {
        time = typeof time === 'undefined' ? DEFAULT_SCROLL_TIME : time;

        this.checkFuturePosition(position);

        this.$innerContainer
            .stop(true, false)
            .animate( { scrollLeft: position }, time, 'easeInOutSine');
    }

    checkFuturePosition(position) {
        // If the scroll position *will* be so that it's not possible to
        // scroll to one direction anymore, remove the hinting. We could
        // do this in the callback of animate, but if it happens
        // when starting the animation, it's less janky.
        let willBeOutOfBoundsOnAnySide = false;

        if (position <= 0) {
            willBeOutOfBoundsOnAnySide = true;
            this.$buttonBack.removeClass(BUTTON_ACTIVE_CLASS);
        }

        if (position + this.$innerContainer.innerWidth() >= this.$innerContainer[0].scrollWidth) {
            willBeOutOfBoundsOnAnySide = true;
            this.$buttonForward.removeClass(BUTTON_ACTIVE_CLASS);
        }

        if (willBeOutOfBoundsOnAnySide) {
            this.applyHint(0);
        }
    }

    markItems() {
        this.$items.each( (_, element) => {
            let $element = $(element),
                isInView = this.isItemCompletelyInView($element);

            $element
                .toggleClass(this.visibleClass, isInView)
                .toggleClass(this.hiddenClass, !isInView);
        });

        // move the flying focus to the new position after scrolling
        $(document).trigger('flyingfocus:move');
    }

    isItemCompletelyInView($itemElem) {
        return !this.isOutOfBoundsLeft($itemElem) && !this.isOutOfBoundsRight($itemElem);
    }

    isOutOfBoundsLeft($itemElem) {
        return $itemElem.offset().left < this.$innerContainer.offset().left;
    }

    isOutOfBoundsRight($itemElem) {
        let rightEdgeItem =  Math.floor($itemElem.offset().left + $itemElem.outerWidth())-1,
            rightEdgeContainer = this.$innerContainer.offset().left + this.$innerContainer.outerWidth();

        return rightEdgeItem > rightEdgeContainer;
    }

    applyHint(pixels) {
        this.$innerContainer.children().first().css('transform', `translateX(${pixels}px)`);
    }

    track() {
        let eventValue = null;

        if (this.isPageBackClick || this.isPageForwardClick) {
            eventValue = this.isPageBackClick ? 'click-left' : 'click-right';
            this.isPageBackClick = false;
            this.isPageForwardClick = false;
        } else {
            eventValue = this.oldScrollLeft < this.$innerContainer.scrollLeft() ? 'swipe-right' : 'swipe-left';
        }

        this.oldScrollLeft = this.$innerContainer.scrollLeft();

        $(window).trigger(this.interactionMeasureString, {
            event_source: this.$element.data('event-source'),
            event_name: this.$element.data('event-name'),
            event_value: eventValue
        });
    }
}
