import {FefResponsiveHelper} from '../classes/fef-responsive-helper';
import {FefTouchDetection} from '../classes/fef-touch-detection';
import {FefResizeListener} from '../classes/fef-resize-listener';

const HOOK_CLASS = 'js-swipeable-area',
    INNER_CONTAINER_CLASS = 'js-swipeable-area-wrapper',
    ITEM_CLASS = 'js-swipeable-area-item',
    // buttons/masks needed for click handlers
    BUTTON_CONTAINER_CLASS = 'js-swipeable-button-container',
    BUTTON_LEFT_HOOK_CLASS = 'js-swipeable-area-button-left',
    BUTTON_RIGHT_HOOK_CLASS = 'js-swipeable-area-button-right',
    MASK_LEFT_HOOK_CLASS = 'js-swipeable-area-mask-left',
    MASK_RIGHT_HOOK_CLASS = 'js-swipeable-area-mask-right',
    // if clicking is prohibited, a button is inactive
    BUTTON_INACTIVE_CLASS = 'swipeable-area__button--inactive',
    // if the swipeable is currently not actually swipeable (because it doesn't have enough items)
    BUTTON_UNNECESSARY_CLASS = 'swipeable-area__button-container--hidden',
    MASK_UNNECESSARY_CLASS = 'swipeable-area__mask--hidden',
    DEFAULT_SCROLL_TIME = 600,
    MINIMAL_SCROLL_TIME = 200,
    // check if the browser understands scroll-snap-align and scroll-behavior (the latter has to be additionally checked for Safari, which supports the former, but doesn't animate scrolling)
    SUPPORTS_SNAP_POINTS = !!((window.CSS && window.CSS.supports) || window.supportsCSS || false) && CSS.supports('scroll-snap-align: start') && CSS.supports('scroll-behavior: smooth'),
    SUPPORTS_INTERSECTION_OBSERVER = 'IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype;

export function init(interactionMeasureString = '') {
    $(`.${HOOK_CLASS}`)
        .filter((_, element) => !$(element).data('swipeabiliy-initialized'))
        .each((_, element) => {
            // initialize swipeability
            new FefSwipeableArea($(element), interactionMeasureString);

            // mark element, so that it won't be initialized again by this module
            $(element).data('swipeabiliy-initialized', true);
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
        this.$buttonContainer = $(`.${BUTTON_CONTAINER_CLASS}`, this.$element);
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
        } else {
            this.$buttonContainer.addClass(BUTTON_UNNECESSARY_CLASS);
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
        // re-init swipeability if breakpoint changed
        this.currentBreakpoint = FefResponsiveHelper.getBreakpoint();
        FefResizeListener.subscribeDebounced(() => {
            let newBreakpoint = FefResponsiveHelper.getBreakpoint();
            if (newBreakpoint != this.currentBreakpoint) {
                this.currentBreakpoint = newBreakpoint;
                this.initSwipeability();
            }
        });

        $(window).on('srf.styles.loaded', () => this.initSwipeability());
        this.$element.on('srf.swipeableArea.reinitialize srf.swipeable.content-changed', () => this.initSwipeability());

        this.$buttonLeft.add(this.$maskLeft).on('mousedown touchstart', () => this.pageBack());
        this.$buttonRight.add(this.$maskRight).on('mousedown touchstart', () => this.pageForward());

        if (SUPPORTS_INTERSECTION_OBSERVER) {
            // Taking 100% (1.0) as threshold is a bit optimistic. It can happen
            // that the observer reports 99.99something% even if it's 100%.
            const options = {
                    root: this.$innerContainer[0],
                    rootMargin: '0px',
                    threshold: [.9]
                },
                callbackRight = (entries, observer) => {
                    // set button to page LEFT to inactive when the FIRST item is completely in view
                    entries.forEach(entry => this.$buttonRight.toggleClass(BUTTON_INACTIVE_CLASS, entry.intersectionRatio >= 0.9));
                },
                callbackLeft = (entries, observer) => {
                    // set button to page RIGHT to inactive when the LAST item is completely in view
                    entries.forEach(entry => this.$buttonLeft.toggleClass(BUTTON_INACTIVE_CLASS, entry.intersectionRatio >= 0.9));
                };

            this.rightEdgeObserver = new IntersectionObserver(callbackRight, options);
            this.leftEdgeObserver = new IntersectionObserver(callbackLeft, options);
        }
    }

    initSwipeability() {
        this.$items = $(`.${ITEM_CLASS}`, this.$innerContainer);
        this.$items
            .off('click.srf.swipeable-area-desktop')
            .on('click.srf.swipeable-area-desktop', (event) => this.onTeaserClick(event));

        // scroll back to the beginning (necessary when swipeable was reinitialized)
        this.scrollToPosition(0, 0);

        // buttons & masks are necessary/unnecessary (depending on the breakpoint,
        // but that's handled in CSS)
        let canBeScrolled = this.hasScrollableOverflow();
        this.$buttonContainer.toggleClass(BUTTON_UNNECESSARY_CLASS, !canBeScrolled);
        this.$maskLeft.add(this.$maskRight).toggleClass(MASK_UNNECESSARY_CLASS, !canBeScrolled);

        // on desktop and up the buttons are used to page back and forth.
        if (FefResponsiveHelper.isDesktopUp()) {
            this.registerDesktopListeners();
            this.updateFlyingFocus();
            
            // If scroll-snap-points are not (fully) supported, we use the
            // traditional way of calculating where to scroll to:
            // calculating it from the items' positions
            if (!SUPPORTS_SNAP_POINTS) {
                this.initItemPositions();
            }
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
     * The amount of visible teasers varies depending on the breakpoint and the
     * type of collection. We read the amount from the ::before pseudo element
     * provided by the CSS rules in collection-swipeable.scss.
     */
    setNrOfPotentialVisibleItems() {
        let nrFromCSSBridge = Number.parseInt(window.getComputedStyle(this.$innerContainer[0], '::before').getPropertyValue('content').replace(/\"/g, ''), 10);
        if (Number.isInteger(nrFromCSSBridge)) {
            this.nrOfPotentialVisibleItems = nrFromCSSBridge;
        } else {
            // Fallback of the fallback: 1 teaser on mobile, 3 on all other BPs
            this.nrOfPotentialVisibleItems = FefResponsiveHelper.isSmartphone() ? 1 : 3;
        }
    }

    registerDesktopListeners() {
        if (SUPPORTS_INTERSECTION_OBSERVER) {
            this.rightEdgeObserver.observe(this.$items.last().find('.js-teaser')[0]);
            this.leftEdgeObserver.observe(this.$items.first().find('.js-teaser')[0]);
        }
    }

    deregisterDesktopListeners() {
        if (SUPPORTS_INTERSECTION_OBSERVER) {
            this.rightEdgeObserver.unobserve(this.$items.last()[0]);
            this.leftEdgeObserver.unobserve(this.$items.first()[0]);
        }
    }

    /**
     * Clicking an item can trigger pagination if the item is only partially
     * visible.
     *
     * @param {jQuery.event} event
     */
    onTeaserClick(event) {
        let $item = $(event.currentTarget);

        // remove focus from the element that was just clicked if it was a mouse click
        if (FefTouchDetection.eventIsMouseclick(event)) {
            $(':focus').blur();
        }

        let preventAction = true;
        if (this.isOutOfBoundsLeft($item)) {
            this.pageBack();
        } else if (this.isOutOfBoundsRight($item)) {
            this.pageForward();
        } else {
            preventAction = false;
        }

        if (preventAction) {
            // Don't go to the link of the teaser
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }

    hasScrollableOverflow() {
        return this.$innerContainer[0].scrollWidth > this.$innerContainer.innerWidth();
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
                targetIndex = partiallyVisibleItemIndex - (this.nrOfPotentialVisibleItems + 1) / 2;
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
            let containerWidth = this.$innerContainer.width();
            this.$innerContainer.scrollLeft(this.$innerContainer.scrollLeft() + containerWidth);
            return;
        } else {
            let containerWidth = this.$innerContainer.width(),
                visibleAreaRightEdge = this.$innerContainer.scrollLeft() + containerWidth,
                partiallyVisibleItemIndex = this.itemPositions.findIndex(pos => pos.right > visibleAreaRightEdge),
                targetItemIndex = this.getTargetItemIndex(partiallyVisibleItemIndex, 'forward'),
                targetIsOutOfBounds = targetItemIndex >= this.itemPositions.length;

            this.$buttonRight.toggleClass(BUTTON_INACTIVE_CLASS, targetIsOutOfBounds);
            this.$buttonLeft.removeClass(BUTTON_INACTIVE_CLASS);

            // Make sure index is not out of bounds
            if (targetIsOutOfBounds) {
                targetItemIndex = this.itemPositions.length - 1;
            }

            let newPosition = this.getCenterTargetPosition(targetItemIndex, 'forward') - (containerWidth / 2);

            this.scrollToPosition(newPosition);
        }
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
            let containerWidth = this.$innerContainer.width();

            // attempting to scroll to a position < 0 can lead to a confusing
            // bounce. Solution: Make sure we never try to scroll below 0px.
            let newPosition = Math.min(0, this.$innerContainer.scrollLeft() - containerWidth);
            this.$innerContainer.scrollLeft(newPosition);
            return;
        } else {
            let containerWidth = this.$innerContainer.width(),
                visibleAreaLeftEdge = this.$innerContainer.scrollLeft(),
                partiallyVisibleItemIndex = this.itemPositions.findIndex(pos => pos.right > visibleAreaLeftEdge),
                targetItemIndex = this.getTargetItemIndex(partiallyVisibleItemIndex, 'backward'),
                targetIsOutOfBounds = targetItemIndex < 0;
    
            this.$buttonLeft.toggleClass(BUTTON_INACTIVE_CLASS, targetIsOutOfBounds);
            this.$buttonRight.removeClass(BUTTON_INACTIVE_CLASS);
    
            // Make sure index is not out of bounds
            if (targetIsOutOfBounds) {
                targetItemIndex = 0;
            }
    
            let newPosition = this.getCenterTargetPosition(targetItemIndex, 'backward') - (containerWidth / 2);
    
            this.scrollToPosition(newPosition);
        }
    }

    /**
     * Scrolls to a specified position in a specified (or default) time.
     *
     * @param {Number} position Where to scroll to
     * @param {Number} [time] How long it should take to travel 1200px, optional
     */
    scrollToPosition(position, time) {
        time = typeof time === 'undefined' ? DEFAULT_SCROLL_TIME : time;

        // don't use jQuery's animate() if scrolling should happen instantly or
        // if snap points are supported.
        if (time === 0 || SUPPORTS_SNAP_POINTS) {
            this.$innerContainer.scrollLeft(position);
        } else {
            // Make the time needed depend on the covered distance. This makes
            // sure that longer distances take longer to scroll over than short
            // distances. But it should take at least 200ms
            time = time/1200 * (Math.abs(this.$innerContainer.scrollLeft() - position)); 
            time = Math.max(time, MINIMAL_SCROLL_TIME);

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
