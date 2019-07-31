import {FefDebounceHelper} from '../classes/fef-debounce-helper';
import {FefTouchDetection} from '../classes/fef-touch-detection';

const HOOK_CLASS = 'js-swipeable-area',
    OUTER_CONTAINER_CLASS = 'js-swipeable-area-wrapper',
    INNER_CONTAINER_CLASS = 'js-collection-teaser-list',
    ITEM_CLASS = 'js-swipeable-area-item',
    BACK_BUTTON_CLASS = 'swipeable-area__button swipeable-area__button--back',
    FORWARD_BUTTON_CLASS = 'swipeable-area__button swipeable-area__button--forward',
    BUTTON_ACTIVE_CLASS = 'swipeable-area__button--active',
    DEFAULT_SCROLL_TIME = 400,
    DEBOUNCETIME = 75,
    HINT_AMOUNT = 20,
    DESKTOP_WIDTH = 1024;

export function init() {

    let startTime = 0,
        endTime = 0;

    startTime = performance.now() || new Date().getTime(); // with fallback

    $(`.${HOOK_CLASS}`).each((_, element) => {
        new FefSwipeableArea($(element));
    });

    endTime = performance.now() || new Date().getTime();

    let result = endTime - startTime,
        allEntries = [];

    if (localStorage.getItem('srf.swipeable.performance')) {
        allEntries = JSON.parse(localStorage.getItem('srf.swipeable.performance'));
    }

    allEntries.push(result);
    localStorage.setItem('srf.swipeable.performance', JSON.stringify(allEntries));

    // eslint-disable-next-line no-console
    console.log(`All Swipeables initialized in ${result}ms`);
    // eslint-disable-next-line no-console
    console.table(allEntries);
    // eslint-disable-next-line no-console
    console.log(`Average: ${allEntries.reduce((accumulator, entry) => accumulator + entry, 0) / allEntries.length}ms`);
}

/**
 * This component
 */
export class FefSwipeableArea {

    constructor($element) {
        // DOM references cached here for performance and readability reasons
        this.$element = $element;
        this.$scrollContainer = $(`.${OUTER_CONTAINER_CLASS}`, this.$element);  // scrollable parent of the <ul>
        this.$innerContainer = $(`.${INNER_CONTAINER_CLASS}`, this.$element);   // <ul>, the direct parent of the teasers
        this.$items = $(`.${ITEM_CLASS}`, this.$innerContainer);                // <li>, the wrappers around the teaser elements
        this.$buttonBack = null;
        this.$buttonForward = null;

        this.itemPositions = []; // save the items' positions so we don't have to collect them on every event we need them. Will be updated on resize and when the items change
        this.containerDimensions = {};

        this.isTouchSupported = FefTouchDetection.isTouchSupported();
        this.isMobile = this.checkIfIsMobile();

        this.useHinting = !!this.$element.data('swipeable-hinting'); // hinting can be enabled by using "data-swipeable-hinting" on the root component

        // let's go!
        this.initialSetup();
    }

    /**
     * Determine if this is a mobile breakpoint; "mobile" meaning a screenwidth
     * less than 1024px and without touch support.
     * 
     * @returns {boolean}
     */
    checkIfIsMobile() {
        return $(window).outerWidth() < DESKTOP_WIDTH && !this.isTouchSupported;
    }

    /**
     * What needs to happen the first time the component is initialized
     */
    initialSetup() {
        this.setItemIndices();
        this.updatePositions();
        this.registerGeneralListeners();

        if (!this.isMobile) {
            this.setUpDesktop();
        }
    }

    /**
     * When the styles are loaded, the JS might or might have not been loaded.
     */
    onStylesLoaded() {
        this.reinit();
    }

    /**
     * When content was added or removed, the items changed. This means that
     * the positions and indices of them are invalid and must be calculated
     * again.
     * We also scroll back to the beginning.
     */
    reinit() {
        this.$items = $(`.${ITEM_CLASS}`, this.$innerContainer);
        this.setItemIndices();
        this.updatePositions();

        this.scrollToPosition(0, 0);
    }

    /**
     * On resize, the items most likely also got resized --> we need to save
     * their widths & positions again.
     * If there was a change in breakpoint, quite some things change (e.g. the
     * buttons for paging appear on desktop+)
     */
    onResize() {
        let willBeMobile = this.checkIfIsMobile();

        // Positions always need to be updated
        this.updatePositions();

        // No further actions required if breakpoint stays the same
        if (this.isMobile === willBeMobile) {
            return;
        }

        this.isMobile = willBeMobile;

        if (willBeMobile) {
            // changing to mobile: unregister desktop-specific listeners
            this.unregisterDesktopListeners();
        } else {
            // changing to desktop
            this.setUpDesktop();
        }
    }

    setUpDesktop() {
        this.addButtons();
        this.updateButtonStatus();
        this.registerDesktopListeners();
    }

    setItemIndices() {
        this.$items.each( (index, element) => {
            $(element).attr('index', index);
        });
    }

    /**
     * To improve performance, the items' positions are saved in the beginning.
     * Later we need to check them often and can just read the values instead
     * of querying the DOM all the time.
     * 
     * What we save:
     * - left edge, center, right edge of each item (for calculations to figure out if the item is partiall/completely outside of the container)
     * - width of the scrollContainer (to know if an item is out of bounds)
     * - center of the scrollContainer (to know where the item's center should be aligned to when paginating)
     * - wether or not the whole thing is scrollable or not
     * 
     * Diagram time!
     *
     * left, center  +->
     * and right edge|--------->
     * of 1st item   +------------------->
     *
     * left, center  |---------------------->
     * and right edge|------------------------------>
     * of 2nd item   +---------------------------------------->
     *
     * etc - you get the idea
     *                               |                                                                                                                              |
     *                               |                +----------------------------------------------------------------------------------------+                    |
     *               +---------------------------------------------------------------------------------------------------------------------------------------------------+
     *               |               |                |                                                                                        |                    |    |
     *               | +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+ |
     *               | |             |   |  |         |       |  |                 |  |                 |  |                 |  |              |  |  |              |  | |
     *               | |             |   |  |         |       |  |                 |  |                 |  |                 |  |              |  |  |              |  | |
     *               | |             |   |  |         |       |  |                 |  |                 |  |                 |  |              |  |  |              |  | |
     *               | +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+ |
     *               | $items[0]     |      $items[1] |          etc                                                                           |                    |    |
     *               +---------------------------------------------------------------------------------------------------------------------------------------------------+
     *               $innerContainer |                +----------------------------------------------------------------------------------------+                    |
     *                               |                $scrollContainer                                                                                              |
     *                               |                                                                                                                              |
     *                               left edge of browser                                                                                       right edge of browser
     */
    updatePositions() {
        const innerContainerOffset = this.$innerContainer.offset().left;

        this.itemPositions = this.$items.toArray().map(element => {
            const $child = $(element).children().first();
            const left = $child.offset().left - innerContainerOffset;
            const width = $child.innerWidth();

            return {
                left: left,
                center: left + (width / 2),
                right: left + width
            };
        });

        // collect positioning data for the inner container:
        const containerWidth = this.$scrollContainer.outerWidth();

        this.containerDimensions = {
            center: containerWidth / 2,
            width: containerWidth,
            isScrollable: this.itemPositions[this.itemPositions.length - 1].right > containerWidth
        };
    }

    /**
     * Only needs to happen once at the beginning, since these events are not
     * connected to any specific elements or breakpoints.
     */
    registerGeneralListeners() {
        $(window).on('resize', FefDebounceHelper.debounce(() => this.onResize(), DEBOUNCETIME));
        $(window).on('srf.styles.loaded', () => this.onStylesLoaded());

        // Content can be added and removed dynamically from the swipeable
        this.$element.on('srf.swipeableArea.reinitialize srf.swipeable.content-changed', () => this.reinit());
    };

    registerDesktopListeners() {
        // prevent double binding by unbinding the events first in some edge cases
        this.unregisterDesktopListeners();

        this.$items.on('click.srf.swipeable-area-desktop', (event) => this.onTeaserClick(event));
        this.$scrollContainer.on('scroll.srf.swipeable-area-desktop', FefDebounceHelper.throttle(() => this.scrollHandlerDesktop(), DEBOUNCETIME));

        if (this.useHinting) {
            // When hovering over a partially shown item, the container content
            // will be "hinted at", i.e. moved into view a bit more.
            this.$items
                .on('mouseenter.srf.swipeable-area-desktop', (event) => this.onTeaserHover(event))
                .on('mouseleave.srf.swipeable-area-desktop', (_) => this.applyHint(0));
        }
    }

    unregisterDesktopListeners() {
        this.$items.off('click.srf.swipeable-area-desktop mouseenter.srf.swipeable-area-desktop mouseleave.srf.swipeable-area-desktop');
        this.$scrollContainer.off('scroll.srf.swipeable-area-desktop');
    }

    scrollHandlerDesktop() {
        this.updateButtonStatus();
    }

    addButtons() {
        // making sure to add the buttons only once
        if (!this.$buttonBack) {
            // create and save reference to the buttons
            this.$buttonBack = $(`<div class='${BACK_BUTTON_CLASS}'><span></span></div>`);
            this.$buttonForward = $(`<div class='${FORWARD_BUTTON_CLASS}'><span></span></div>`);

            this.$element.append(this.$buttonBack, this.$buttonForward);
        }
    }

    /**
     * Hovering over an item can trigger the hinting mechanism, if it's
     * partially visible.
     *
     * @param {jQery.event} event
     */
    onTeaserHover(event) {
        let itemIndex = Number.parseInt($(event.currentTarget).attr('index'));

        // Hint left or right, depending on where the item is
        if (this.isOutOfBoundsRight(itemIndex)) {
            this.applyHint(-HINT_AMOUNT);
        } else if (this.isOutOfBoundsLeft(itemIndex)) {
            this.applyHint(HINT_AMOUNT);
        }
    }

    /**
     * Clicking an item can trigger pagination if it's partially visible.
     *
     * @param {jQuery.event} event
     */
    onTeaserClick(event) {
        const itemIndex = Number.parseInt($(event.currentTarget).attr('index'));
        const isOutOfBoundsLeft = this.isOutOfBoundsLeft(itemIndex);

        // let the normal link do its work if the teaser is completely visible (= not out of bounds on either side)
        if (!isOutOfBoundsLeft && !this.isOutOfBoundsRight(itemIndex)) {
            return;
        }

        // remove focus from the element that was just clicked if it was a mouse click
        if (FefTouchDetection.eventIsMouseclick(event)) {
            $(':focus').blur();
        }

        // Don't go to the link of the teaser
        event.preventDefault();
        event.stopPropagation();

        // Paginate back for forwards, depending on which side the item is out of bounds
        if (isOutOfBoundsLeft) {
            this.pageBack();
        } else {
            this.pageForward();
        }
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
        if (this.containerDimensions.isScrollable) {
            // performance improvement: prevent second forced reflow by first accessing layout and then setting classes
            let isAtEnd = this.isAtScrollEnd();
            let isAtBegin = this.isAtScrollBeginning();

            this.$buttonForward.toggleClass(BUTTON_ACTIVE_CLASS, !isAtEnd);
            this.$buttonBack.toggleClass(BUTTON_ACTIVE_CLASS, !isAtBegin);
        } else {
            this.$buttonForward.removeClass(BUTTON_ACTIVE_CLASS);
            this.$buttonBack.removeClass(BUTTON_ACTIVE_CLASS);
        }
    }

    /**
     * If the scroll position *will* be so that it's not possible to scroll to
     * one direction anymore, remove the hinting. We could do this in the
     * callback of animate, but if it happens when starting the animation, it's
     * less janky.
     *
     * @param {Number} position 
     */
    updateButtonStatusForFuturePosition(position) {
        if (position <= 0) {
            if (this.$buttonBack) {
                this.$buttonBack.removeClass(BUTTON_ACTIVE_CLASS);
            }
        } else if (!this.isOutOfBoundsRight(this.itemPositions.length - 1, position)) {
            if (this.$buttonForward) {
                this.$buttonForward.removeClass(BUTTON_ACTIVE_CLASS);
            }
        } else {
            return; // Abort, neither side will be reached
        }

        this.applyHint(0);
    }

    /**
     * The list is scrolled all the way to the end if the last item is
     * completely visible.
     *
     * @returns {boolean}
     */
    isAtScrollEnd() {
        return !this.isOutOfBoundsRight(this.itemPositions.length - 1);
    }

    /**
     * The list is scrolled all the way to the beginning if the first item is
     * completely visible.
     *
     * @returns {boolean}
     */
    isAtScrollBeginning() {
        return !this.isOutOfBoundsLeft(0);
    }

    /**
     * Paging forward (-->):
     * Get the right-most item that's partially out of view (i.e. its right edge
     * is over the visible area's right edge).
     * Then get the one after that and try to center it. If there's no next one
     * we just take the last (the right-most) and use this.
     */
    pageForward() {
        let visibleAreaRightEdge = this.$scrollContainer.scrollLeft() + this.containerDimensions.width,
            nextItemIndex = this.itemPositions.findIndex(pos => pos.right > visibleAreaRightEdge);

        nextItemIndex = Math.min(nextItemIndex + 1, this.itemPositions.length - 1);

        let newPosition = this.itemPositions[nextItemIndex].center - this.containerDimensions.center;

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
        let visibleAreaLeftEdge = this.$scrollContainer.scrollLeft(),
            nextItemIndex = this.itemPositions.findIndex(pos => pos.right > visibleAreaLeftEdge);

        nextItemIndex = Math.max(nextItemIndex - 1, 0);

        let newPosition = this.itemPositions[nextItemIndex].center - this.containerDimensions.center;

        this.scrollToPosition(newPosition);
    }

    /**
     * Scrolls to a specified position in a specified (or default) time.
     *
     * @param {Number} position Where to scroll to
     * @param {Number} [time] How long it should take, optional
     */
    scrollToPosition(position, time = DEFAULT_SCROLL_TIME) {
        // update the buttons for the target position if not on mobile
        if (!this.isMobile) {
            this.updateButtonStatusForFuturePosition(position);
        }

        // performance improvement: if scroll should happen immediately, don't use $.animate
        if (time === 0) {
            this.$scrollContainer[0].scrollLeft = position;
        } else {
            this.$scrollContainer
                .stop(true, false) // stop any previously started and maybe still ongoing animations on the scrollContainer
                .animate( { scrollLeft: position }, time, 'easeInOutSine');
        }
    }

    /**
     * Checks if an item is partially or completely out of the visible area on
     * the left side.
     * Mathematically, this means if the scrolled amount (displacement to the
     * left) is greater than the distance from the beginning of the container
     * to the left edge of the item, then it's (at least partially) outside of
     * the visible area.
     *
     * Digram time!
     *
     *
     *  <--------------------------------+    scrolled amount ("position")
     *  +---------------------->     Distance from container edge to item1's left edge. It's less than the scrolled amount so it's out of bound on the left.
     *  +------------------------------------------->  Distance from container edge to item2's left edge. It's more than the scrolled amount, so not out of bounds on the left.
     *
     *                  |                                                                                                                              |
     *                  |                                                                                                                              |
     *                  |                +----------------------------------------------------------------------------------------+                    |
     *  +---------------------------------------------------------------------------------------------------------------------------------------------------+
     *  |               |                |                                                                                        |                    |    |
     *  | +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+ |
     *  | |             |   |  |         |       |  |                 |  |                 |  |                 |  |              |  |  |              |  | |
     *  | |             |   |  |         |       |  |                 |  |                 |  |                 |  |              |  |  |              |  | |
     *  | |             |   |  |         |       |  |                 |  |                 |  |                 |  |              |  |  |              |  | |
     *  | +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+ |
     *  | $items[0]     |      $items[1] |          etc                                                                           |                    |    |
     *  +---------------------------------------------------------------------------------------------------------------------------------------------------+
     *  $innerContainer |                +----------------------------------------------------------------------------------------+                    |
     *                  |                $scrollContainer                                                                                              |
     *                  |                                                                                                                              |
     *                  left edge of browser                                                                                       right edge of browser
     *
     * @param {Number} itemIndex 
     * @param {Number} position (default: current scroll position)
     */
    isOutOfBoundsLeft(itemIndex, position = this.$scrollContainer.scrollLeft()) {
        return position > this.itemPositions[itemIndex].left;
    }

    /**
     * Checks if an item is partially or completely out of the visible area on
     * the right side.
     * 
     * Diagram Time!
     * 
     *      scrolled amount ("position")                           $scrollContainer's width
     *  <--------------------------------+---------------------------------------------------------------------------------------->
     * 
     *  Distance from $innerContainer's edge to item4's right edge; shorter than the scrolled amount + $scrollContainer's width, thus not out of bounds on the right
     *  +------------------------------------------------------------------------------------------------------->
     * 
     *  Distance from $innerContainer's edge to item5's right edge; longer than the scrolled amount + $scrollContainer's width, thus out of bounds on the right
     *  +---------------------------------------------------------------------------------------------------------------------------->
     *
     *                  |                                                                                                                              |
     *                  |                                                                                                                              |
     *                  |                +----------------------------------------------------------------------------------------+                    |
     *  +---------------------------------------------------------------------------------------------------------------------------------------------------+
     *  |               |                |                                                                                        |                    |    |
     *  | +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+ |
     *  | |             |   |  |         |       |  |                 |  |                 |  |                 |  |              |  |  |              |  | |
     *  | |             |   |  |         |       |  |                 |  |                 |  |                 |  |              |  |  |              |  | |
     *  | |             |   |  |         |       |  |                 |  |                 |  |                 |  |              |  |  |              |  | |
     *  | +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+  +-----------------+ |
     *  | $items[0]     |      $items[1] |          etc                                                                           |                    |    |
     *  +---------------------------------------------------------------------------------------------------------------------------------------------------+
     *  $innerContainer |                +----------------------------------------------------------------------------------------+                    |
     *                  |                $scrollContainer                                                                                              |
     *                  |                                                                                                                              |
     *                  left edge of browser                                                                                       right edge of browser
     *
     * @param {Number} itemIndex 
     * @param {Number} position (default: current scroll position)
     */
    isOutOfBoundsRight(itemIndex, position = this.$scrollContainer.scrollLeft()) {
        // add the current scroll position to the original right edge of the container to compare it to the original right edge of the item
        return this.itemPositions[itemIndex].right > this.containerDimensions.width + position;
    }

    /**
     * Apply the specified amount of hinting to the container to reveal some
     * more of the next teasers.
     *
     * @param {Number} pixels 
     */
    applyHint(pixels) {
        this.$innerContainer.css('transform', `translateX(${pixels}px)`);
    }
}
