import {FefResponsiveHelper} from '../classes/fef-responsive-helper';
import {FefTouchDetection} from '../classes/fef-touch-detection';
import {FefResizeListener} from '../classes/fef-resize-listener';

const HOOK_CLASS = 'js-swipeable-area',
    INNER_CONTAINER_CLASS = 'js-swipeable-area-wrapper',
    ITEM_CLASS = 'js-swipeable-area-item',
    // buttons/masks needed for click handlers
    BUTTON_LEFT_HOOK_CLASS = 'js-swipeable-area-button-left',
    BUTTON_RIGHT_HOOK_CLASS = 'js-swipeable-area-button-right',
    MASK_LEFT_HOOK_CLASS = 'js-swipeable-area-mask-left',
    MASK_RIGHT_HOOK_CLASS = 'js-swipeable-area-mask-right',
    // if clicking is prohibited, a button is inactive
    BUTTON_INACTIVE_CLASS = 'swipeable-area__button--inactive',
    RIGHT_OFFSET = 24,
    DEFAULT_SCROLL_TIME = 400,
    SUPPORTS_SNAP_POINTS = !!((window.CSS && window.CSS.supports) || window.supportsCSS || false) && CSS.supports('scroll-snap-align: start');

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
        this.$buttonLeft = $(`.${BUTTON_LEFT_HOOK_CLASS}`, this.$element);
        this.$buttonRight = $(`.${BUTTON_RIGHT_HOOK_CLASS}`, this.$element);
        this.$maskLeft = $(`.${MASK_LEFT_HOOK_CLASS}`, this.$element);
        this.$maskRight = $(`.${MASK_RIGHT_HOOK_CLASS}`, this.$element);
        this.itemPositions = [];
        this.nrOfPotentialVisibleItems = 0;
        this.interactionMeasureString = interactionMeasureString;

        this.initOnce();

        // only set up the swipeable at this point if it's swipeable
        if (this.hasScrollableOverflow()) {
            this.initSwipeability();
        }
    }

    /**
     * Some listeners are necessary:
     * - browser resize, because some events are only needed on Desktop and up
     * - styles are done being loaded, because some calculations are depending on elements' dimensions
     * - content can change and the swipeable needs to be informed so it can re-bind and re-calculate things
     * - clicking on the buttons or masks should page forwards/backwards
     * - reaching the left or right edge should set the corresponding button to inactive
     */
    initOnce() {
        // todo: only width is needed...
        FefResizeListener.subscribeDebounced(() => this.initSwipeability());
        $(window).on('srf.styles.loaded', () => this.initSwipeability());
        this.$element.on('srf.swipeableArea.reinitialize srf.swipeable.content-changed', () => this.initSwipeability());

        this.$buttonLeft.add(this.$maskLeft).on('mousedown touchstart', () => this.pageBack());
        this.$buttonRight.add(this.$maskRight).on('mousedown touchstart', () => this.pageForward());

        const optionsRight = {
                root: this.$innerContainer[0],
                rootMargin: '0px',
                threshold: 1.0
            },
            // on the left edge we need to declare the 120px margin, otherwise identical to optionsRight
            optionsLeft = Object.assign({}, optionsRight, {
                rootMargin: '0px 0px 0px -120px'
            }),
            callbackRight = (entries, observer) => {
                // set button to page LEFT to inactive when the FIRST item is completely in view
                entries.forEach(entry => this.$buttonRight.toggleClass(BUTTON_INACTIVE_CLASS, entry.intersectionRatio === 1));
            },
            callbackLeft = (entries, observer) => {
                // set button to page RIGHT to inactive when the LAST item is completely in view
                entries.forEach(entry => this.$buttonLeft.toggleClass(BUTTON_INACTIVE_CLASS, entry.intersectionRatio === 1));
            };

        this.rightEdgeObserver = new IntersectionObserver(callbackRight, optionsRight);
        this.leftEdgeObserver = new IntersectionObserver(callbackLeft, optionsLeft);
    }

    initSwipeability() {
        this.$items = $(`.${ITEM_CLASS}`, this.$innerContainer);

        // scroll back to the beginning (necessary when swipeable was reinitialized)
        this.scrollToPosition(0, 0);

        if (FefResponsiveHelper.isDesktopUp() && !FefTouchDetection.isTouchSupported()) {
            this.registerDesktopListeners();
            this.updateFlyingFocus();
            this.initItemPositions();
        } else {
            this.deregisterDesktopListeners();
        }
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
        // Only set the potential visible items if there's at least one.
        // Otherwise it's impossible to know how wide an item is.
        if (this.itemPositions.length <= 0) {
            return;
        }

        let containerWidth = this.$innerContainer.innerWidth(),
            containerAndFirstGap = containerWidth + this.itemPositions[0].left;

        this.nrOfPotentialVisibleItems = this.itemPositions.filter((positionSet) => positionSet.right < containerAndFirstGap).length;
    }

    registerDesktopListeners() {
        // unsubscribe to the events first to prevent double-binding
        this.$items
            .off('click.srf.swipeable-area-desktop')
            .on('click.srf.swipeable-area-desktop', (event) => this.onTeaserClick(event));

        this.rightEdgeObserver.observe(this.$items.last().find('.js-teaser')[0]);
        this.leftEdgeObserver.observe(this.$items.first().find('.js-teaser')[0]);
    }

    deregisterDesktopListeners() {
        this.$items.off('click.srf.swipeable-area-desktop');
        this.$innerContainer.off('scroll.srf.swipeable-area-desktop');

        this.rightEdgeObserver.unobserve(this.$items.last()[0]);
        this.leftEdgeObserver.unobserve(this.$items.first()[0]);
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
        // Do not scroll into view for now - tbd by design
        /*
        let $item = $(event.currentTarget);

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
        */
    }

    hasScrollableOverflow() {
        return this.$innerContainer[0].scrollWidth > this.$innerContainer.innerWidth() + RIGHT_OFFSET;
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
     * If there's no next item or not enough items, we just take the last (the
     * right-most) item and use it as the "target" item to center.
     */
    pageForward() {
        this.track('click-right');

        if (SUPPORTS_SNAP_POINTS) {
            // simplified b/c scroll snap points:
            // attempt to scroll to a position that's one containerwidth to the right. Done.
            let containerWidth = this.$innerContainer.innerWidth();
            this.$innerContainer.scrollLeft(this.$innerContainer.scrollLeft() + containerWidth);
            return;
        }

        let containerWidth = this.$innerContainer.innerWidth(),
            visibleAreaRightEdge = this.$innerContainer.scrollLeft() + containerWidth,
            partiallyVisibleItemIndex = this.itemPositions.findIndex(pos => pos.right > visibleAreaRightEdge),
            targetItemIndex = this.getTargetItemIndex(partiallyVisibleItemIndex, 'forward');

        // Make sure index is not out of bounds
        targetItemIndex = Math.min(targetItemIndex, this.itemPositions.length - 1);

        let newPosition = this.getCenterTargetPosition(targetItemIndex, 'forward') - (containerWidth / 2);

        this.scrollToPosition(newPosition);
    }

    /**
     * Paging back (<--):
     * For a visual description, see pageForward()'s doc block above.
     */
    pageBack() {
        this.track('click-left');

        if (SUPPORTS_SNAP_POINTS) {
            // simplified b/c scroll snap points:
            // attempt to scroll to a position that's one containerwidth to the right. Done.
            let containerWidth = this.$innerContainer.innerWidth();
            this.$innerContainer.scrollLeft(this.$innerContainer.scrollLeft() - containerWidth);
            return;
        }

        let containerWidth = this.$innerContainer.innerWidth(),
            visibleAreaLeftEdge = this.$innerContainer.scrollLeft(),
            partiallyVisibleItemIndex = this.itemPositions.findIndex(pos => pos.right > visibleAreaLeftEdge),
            targetItemIndex = this.getTargetItemIndex(partiallyVisibleItemIndex, 'backward');

        // Make sure index is not out of bounds
        targetItemIndex = Math.max(targetItemIndex, 0);

        let newPosition = this.getCenterTargetPosition(targetItemIndex, 'backward') - (containerWidth / 2);

        this.scrollToPosition(newPosition);
    }

    /**
     * Scrolls to a specified position in a specified (or default) time.
     *
     * @param {Number} position Where to scroll to
     * @param {Number} [time] How long it should take, optional
     */
    scrollToPosition(position, time) {
        time = typeof time === 'undefined' ? DEFAULT_SCROLL_TIME : time;

        // don't use jQuery's animate() if scrolling should happen instantly or
        // if snap points are supported.
        if (time === 0 || SUPPORTS_SNAP_POINTS) {
            this.$innerContainer.scrollLeft(position);
        } else {
            this.$innerContainer
                .stop(true, false)
                .animate({ scrollLeft: position }, time, 'easeInOutSine');
        }

    }

    updateFlyingFocus() {
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

    track(eventValue) {
        $(window).trigger(this.interactionMeasureString, {
            event_source: this.$element.data('event-source'),
            event_name: this.$element.data('event-name'),
            event_value: eventValue
        });
    }
}
