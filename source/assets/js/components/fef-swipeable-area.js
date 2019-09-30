import {FefDebounceHelper} from '../classes/fef-debounce-helper';
import {FefResponsiveHelper} from '../classes/fef-responsive-helper';
import {FefTouchDetection} from '../classes/fef-touch-detection';
import {FefResizeListener} from '../classes/fef-resize-listener';

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
        this.nrOfPotentialVisibleItems = 0;
        this.interactionMeasureString = interactionMeasureString;
        this.isScrollingToEdge = false; // flag which is set to true while the container is currently being scrolled to the beginning or end by the script (not by the user)

        this.visibleClass = null;
        this.hiddenClass = null;

        this.initOnce();

        // only set up the swipeable at this point if it's swipeable
        if (this.hasScrollableOverflow()) {
            this.init();
        }
    }

    initOnce() {
        this.initItemCheck();
        this.registerGeneralListeners();
    }

    init() {
        this.$items = $(`.${ITEM_CLASS}`, this.$innerContainer);

        // scroll back to the beginning (matters when swipeable was reinitialized)
        this.scrollToPosition(0, 0);

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

        let parentOffset = this.$innerContainer.children().first().offset().left;

        this.$items.each((_, item) => {
            let $item = $(item).children().first(),
                left = $item.offset().left - parentOffset,
                width = $item.innerWidth();

            this.itemPositions.push({
                left: left,
                center: left + (width / 2),
                right: left + width
            });
        });

        this.setNrOfPotentialVisibleItems();
    }

    /**
     * To find out how many items could be fit in the visible area, we
     * count all items where the right edge is in the range of the
     * container's width + one gap between the items (because in some cases
     * when the gap is large enough it can "push" one item out of this range).
     * 
     * Example:
     * If we just count the items where the right edge is less than the
     * container's width, this would give us 1. But when we scroll a bit
     * it's apparent that actually 2 items fit in it. That's why we add
     * the gap to the filter condition.
     * 
     *            +-----------------------+ <-- container
     *            |                       |
     *           +---------------------------------------
     *           ||                       |
     *           ||        +--+         +--+         +--+
     *           ||        |  |         | ||         |  |
     *           ||        +--+         +--+         +--+
     *           ||                       |
     *           +---------------------------------------
     *            |                       |
     *      +---------------------------------------
     *      |     |                       |
     *      |     |   +--+         +--+   |     +--+
     *      |     |   |  |         |  |   |     |  |
     *      |     |   +--+         +--+   |     +--+
     *      |     |                       |
     *      +---------------------------------------
     *            |                       |
     *            +-----------------------+
     */
    setNrOfPotentialVisibleItems() {
        let containerWidth = this.$innerContainer.innerWidth(),
            containerAndFirstGap = containerWidth + this.itemPositions[0].left;

        this.nrOfPotentialVisibleItems = this.itemPositions.filter((positionSet) => positionSet.right < containerAndFirstGap).length;
    }

    registerGeneralListeners() {
        FefResizeListener.subscribeDebounced(() => this.init());
        $(window).on('srf.styles.loaded', () => this.init());
        this.$element.on('srf.swipeableArea.reinitialize srf.swipeable.content-changed', () => this.init());
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
     * Don't do anything if the swipeable is currently scrolling to the end of
     * the container or the element is visible.
     *
     * @param {jQery.event} event
     */
    onTeaserHover(event) {
        let $item = $(event.currentTarget);

        if (this.isScrollingToEdge || !$item.hasClass(this.hiddenClass)) {
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
     * @param {Number} partiallyVisibleItemIndex
     * @param {String} direction 'forward'|'backward'
     */
    getTargetItemIndex(partiallyVisibleItemIndex, direction) {
        let isEven = this.nrOfPotentialVisibleItems % 2 === 0,
            targetIndex;
        
        if (direction === 'forward') {
            if (isEven) {
                // EVEN
                targetIndex = partiallyVisibleItemIndex + (this.nrOfPotentialVisibleItems / 2) - 1;
            } else {
                // ODD
                targetIndex = partiallyVisibleItemIndex + (this.nrOfPotentialVisibleItems - 1) / 2;
            }
        } else {
            // eslint-disable-next-line no-lonely-if
            if (isEven) {
                // EVEN
                targetIndex = partiallyVisibleItemIndex - (this.nrOfPotentialVisibleItems / 2) + 1;
            } else {
                // ODD
                targetIndex = partiallyVisibleItemIndex - (this.nrOfPotentialVisibleItems - 1) / 2;
            }
        }

        return targetIndex;
    }

    getCenterTargetPosition(targetItemIndex, direction) {
        let isEven = this.nrOfPotentialVisibleItems % 2 === 0,
            halfGap = (this.itemPositions[1].left - this.itemPositions[0].right) / 2,
            targetPosition;

        if (!isEven) {
            // ODD in any direction: target position is the item's center
            targetPosition = this.itemPositions[targetItemIndex].center;
        } else if (direction === 'forward') {
            // EVEN forward: target position is the center of the gap between
            // the item and the one to the right
            targetPosition = this.itemPositions[targetItemIndex].right + halfGap;
        } else {
            // EVEN backward: target position is the center of the gap between
            // the item and the one to the left
            targetPosition = this.itemPositions[targetItemIndex].left - halfGap;
        }

        return targetPosition;
    }

    /**
     * Paging forward (-->):
     * Get the right-most item that's partially out of view (i.e. its right edge
     * is over the visible area's right edge).
     * 
     * If there's an EVEN amount of potentially visible items (n), the rule is as
     * follows:
     * Get the item (n/2 - 1) items AFTER that and align the gap to the right of
     * it with the center of the container.
     * 
     * Example: 5 is the right-most partially visible item and there is space
     * for up to 4 items (n) so we have align the gap AFTER item 5 + n/2 - 1 = 6
     * with the center of the container.
     * 
     *    +-------------------------------------+
     *    |                                     |
     *    |  +---+   +---+   +---+   +---+   +--++   +---+   +---+   +---+
     *    |  |   |   |   |   |   |   |   |   |xxx|   |   |   |   |   |   |
     *    |  | 1 |   | 2 |   | 3 |   | 4 |   |x5x|   | 6 |   | 7 |   | 8 |
     *    |  |   |   |   |   |   |   |   |   |xxx|   |   |   |   |   |   |
     *    |  +---+   +---+   +---+   +---+   +--++   +---+   +---+   +---+
     *    |                                     |
     *    +-------------------------------------+
     *                       +
     *    +-------------------------------------+
     *    |                  +                  |
     * +---+   +---+   +---+   +---+   +---+   +---+
     * |  ||   |xxx|   |   |   |   |   |   |   ||  |
     * | 4||   |x5x|   | 6 |   | 7 |   | 8 |   ||9 |
     * |  ||   |xxx|   |   |   |   |   |   |   ||  |
     * +---+   +---+   +---+   +---+   +---+   +---+
     *    |                  +                  |
     *    +-------------------------------------+
     *                       + center line
     * 
     * If there's an ODD amount of potentially visible items (n), the rule is as
     * follows:
     * Get the item (n-1) / 2 items AFTER that and align its center with the
     * center of the container.
     * 
     * Example: 4 is the right-most partially visible item and there is space
     * for up to 3 items (n) so we have align the center of item 4 + (n-1)/2 = 5
     * with the center of the container.
     * 
     *    +-----------------------------+
     *    |                             |
     *    |  +---+   +---+   +---+   +--++   +---+
     *    |  |   |   |   |   |   |   |xxx|   |   |
     *    |  | 1 |   | 2 |   | 3 |   |x4x|   | 5 |
     *    |  |   |   |   |   |   |   |xxx|   |   |
     *    |  +---+   +---+   +---+   +--++   +---+
     *    |                             |
     *    +-----------------------------+
     * 
     *                   +
     *    +--------------+--------------+
     *    |                             |
     * +---+   +---+   +---+   +---+   +---+
     * |  ||   |xxx|   |   |   |   |   ||  |
     * | 3||   |x4x|   | 5 |   | 6 |   ||7 |
     * |  ||   |xxx|   |   |   |   |   ||  |
     * +---+   +---+   +---+   +---+   +---+
     *    |                             |
     *    +--------------+--------------+
     *                   + center line
     * 
     * If there's no next item or not enough we just take the last (the
     * right-most) item and use it as the "target" item to center.
     */
    pageForward() {
        let containerWidth = this.$innerContainer.innerWidth(),
            visibleAreaRightEdge = this.$innerContainer.scrollLeft() + containerWidth,
            partiallyVisibleItemIndex = this.itemPositions.findIndex(pos => pos.right > visibleAreaRightEdge),
            targetItemIndex = this.getTargetItemIndex(partiallyVisibleItemIndex, 'forward');

        // Make sure index is not out of bounds
        targetItemIndex = Math.min(targetItemIndex, this.itemPositions.length - 1);

        let newPosition = this.getCenterTargetPosition(targetItemIndex, 'forward') - (containerWidth / 2);

        this.scrollToPosition(newPosition);
        this.track('click-right');
    }

    /**
     * Paging back (<--):
     * For a visual description, see pageForward()'s doc block above.
     */
    pageBack() {
        let containerWidth = this.$innerContainer.innerWidth(),
            visibleAreaLeftEdge = this.$innerContainer.scrollLeft(),
            partiallyVisibleItemIndex = this.itemPositions.findIndex(pos => pos.right > visibleAreaLeftEdge),
            targetItemIndex = this.getTargetItemIndex(partiallyVisibleItemIndex, 'backward');

        // Make sure index is not out of bounds
        targetItemIndex = Math.max(targetItemIndex, 0);

        let newPosition = this.getCenterTargetPosition(targetItemIndex, 'backward') - (containerWidth / 2);

        this.scrollToPosition(newPosition);
        this.track('click-left');
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
            .animate({ scrollLeft: position }, time, 'easeInOutSine', () => this.isScrollingToEdge = false);
    }

    checkFuturePosition(position) {
        // If the scroll position *will* be so that it's not possible to
        // scroll to one direction anymore, remove the hinting. We could
        // do this in the callback of animate, but if it happens
        // when starting the animation, it's less janky.
        let willBeOutOfBoundsOnAnySide = false;

        if (position <= 0) {
            willBeOutOfBoundsOnAnySide = true;

            if (this.$buttonBack) {
                this.$buttonBack.removeClass(BUTTON_ACTIVE_CLASS);
            }
        }

        if (position + this.$innerContainer.innerWidth() >= this.$innerContainer[0].scrollWidth) {
            willBeOutOfBoundsOnAnySide = true;

            if (this.$buttonForward) {
                this.$buttonForward.removeClass(BUTTON_ACTIVE_CLASS);
            }
        }

        if (willBeOutOfBoundsOnAnySide) {
            this.isScrollingToEdge = true;
            this.applyHint(0);
        }
    }

    markItems() {
        let $visibleItems = this.$items.filter((_, element) => this.isItemCompletelyInView($(element))),
            $hiddenItems = this.$items.filter((_, element) => !this.isItemCompletelyInView($(element)));

        this.markItemsVisible($visibleItems);
        this.markItemsHidden($hiddenItems);

        // move the flying focus to the new position after scrolling
        $(document).trigger('flyingfocus:move');
    }

    markItemsVisible($items) {
        $items.each((_, element) => $(element).removeClass(this.hiddenClass).addClass(this.visibleClass));
    }

    markItemsHidden($items) {
        $items.each((_, element) => $(element).removeClass(this.visibleClass).addClass(this.hiddenClass));
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

    track(eventValue) {
        $(window).trigger(this.interactionMeasureString, {
            event_source: this.$element.data('event-source'),
            event_name: this.$element.data('event-name'),
            event_value: eventValue
        });
    }
}
