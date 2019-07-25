import {FefDebounceHelper} from '../classes/fef-debounce-helper';
import {FefResponsiveHelper} from '../classes/fef-responsive-helper';
import {FefTouchDetection} from '../classes/fef-touch-detection';

const HOOK_CLASS = 'js-swipeable-area',
    INNER_CONTAINER_CLASS = 'js-swipeable-area-wrapper',
    ITEM_CLASS = 'js-swipeable-area-item',
    BACK_BUTTON_CLASS = 'swipeable-area__button swipeable-area__button--back',
    FORWARD_BUTTON_CLASS = 'swipeable-area__button swipeable-area__button--forward',
    BUTTON_ACTIVE_CLASS = 'swipeable-area__button--active',
    BUTTON_BACK_THRESHOLD = 2,
    RIGHT_OFFSET = 24,
    DEFAULT_SCROLL_TIME = 400,
    DEBOUNCETIME = 75,
    DEBOUNCETIME_SCROLL_TRACKING = 1000,
    DESKTOP_WIDTH = 1024;

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
        this.itemPositions = []; // save the items' positions so we don't have to collect them on every event we need them. Will be updated on resize and when the items change
        this.innerContainerDimensions = {};
        this.$buttonBack = null;
        this.$buttonForward = null;

        this.isTouchSupported = FefTouchDetection.isTouchSupported();
        this.isMobile = this.checkIfIsMobile();
        
        this.visibleClass = null;
        this.hiddenClass = null;
        
        // tracking stuff
        this.interactionMeasureString = interactionMeasureString;
        this.oldScrollLeft = this.$innerContainer.scrollLeft();
        this.isPageBackClick = false;
        this.isPageForwardClick = false;

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
        return $(window).width() < DESKTOP_WIDTH && !this.isTouchSupported;
    }

    /**
     * What needs to happen the first time the component is initialized:
     * - gather all items
     * - save their positions and indices
     * - register the general listeners ()
     */
    initialSetup() {
        this.$items = $(`.${ITEM_CLASS}`, this.$innerContainer);
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

        // always have to update positions
        this.updatePositions();

        // no further actions required if breakpoint stays the same
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
     */
    updatePositions() {
        this.itemPositions = [];

        this.$items.each( (_, element) => {
            const left = $(element).position().left;
            // take width of first child because element itself may have margin/padding which should not be counted
            const width = $(element).children().first().innerWidth();

            this.itemPositions.push({
                left: left,
                center: left + (width / 2),
                right: left + width
            });
        });

        // do the same for the inner container:
        const left = this.$innerContainer.offset().left;
        const width = this.$innerContainer.outerWidth();

        this.innerContainerDimensions = {
            left: left,
            center: left + (width / 2),
            innerWidth: this.$innerContainer.innerWidth(),
            right: left + width
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
        
        this.$innerContainer.on('scroll', FefDebounceHelper.throttle(() => this.track(), DEBOUNCETIME_SCROLL_TRACKING));
    };

    registerDesktopListeners() {
        // prevent double binding by unbinding the events first in some edge cases
        this.unregisterDesktopListeners();
        this.$items.on('click.srf.swipeable-area-desktop', (event) => this.onTeaserClick(event));
        this.$innerContainer.on('scroll.srf.swipeable-area-desktop', FefDebounceHelper.throttle(() => this.scrollHandlerDesktop(), DEBOUNCETIME));
    }

    unregisterDesktopListeners() {
        this.$items.off('click.srf.swipeable-area-desktop');
        this.$innerContainer.off('scroll.srf.swipeable-area-desktop');
    }

    scrollHandlerDesktop() {
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
     * Clicking an item can trigger pagination if it's partially visible.
     * Instead of handing down the analytics methods or module to call upon
     * pagination, we trigger a click on the buttons which have the correct
     * data attribute already.
     *
     * @param {jQuery.event} event
     */
    onTeaserClick(event) {
        let itemIndex = Number.parseInt($(event.currentTarget).attr('index'));

        // let the normal link do its work if the teaser is completely visible
        if (this.isItemCompletelyInView(itemIndex)) {
            return;
        }

        // remove focus from the element that was just clicked if it was a mouse click
        if (FefTouchDetection.eventIsMouseclick(event)) {
            $(':focus').blur();
        }

        if (this.isOutOfBoundsLeft(itemIndex)) {
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
        if (this.hasScrollableOverflow()) {
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

    updateButtonStatusForFuturePosition(position) {
        if (position <= 0) {
            if (this.$buttonBack) {
                this.$buttonBack.removeClass(BUTTON_ACTIVE_CLASS);
            }
        }

        if (position + this.innerContainerDimensions.innerWidth >= this.$innerContainer[0].scrollWidth) {
            if (this.$buttonForward) {
                this.$buttonForward.removeClass(BUTTON_ACTIVE_CLASS);
            }
        }
    }

    hasScrollableOverflow() {
        return this.$innerContainer[0].scrollWidth > this.innerContainerDimensions.innerWidth + RIGHT_OFFSET;
    }

    isAtScrollEnd() {
        return this.$innerContainer.scrollLeft() + this.innerContainerDimensions.innerWidth >= this.$innerContainer[0].scrollWidth;
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
        let visibleAreaRightEdge = this.$innerContainer.scrollLeft() + this.innerContainerDimensions.innerWidth,
            nextItemIndex = this.itemPositions.findIndex(pos => pos.right > visibleAreaRightEdge);

        nextItemIndex = Math.min(nextItemIndex + 1, this.itemPositions.length - 1);

        let newPosition = this.itemPositions[nextItemIndex].center - this.innerContainerDimensions.center;

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

        let newPosition = this.itemPositions[nextItemIndex].center - this.innerContainerDimensions.center;

        this.isPageBackClick = true;
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

        // update the buttons for the target position if not on mobile
        if (!this.isMobile) {
            this.updateButtonStatusForFuturePosition(position);
        }

        // performance improvement: if scroll should happen immediately, don't use $.animate
        if (time === 0) {
            this.$innerContainer[0].scrollLeft = position;
        } else {
            this.$innerContainer
                .stop(true, false)
                .animate( { scrollLeft: position }, time, 'easeInOutSine');
        }
    }

    /**
     * An item is completely in view if the left and right edge are inside of the scroll container.
     *
     * @param {Number} itemIndex Index of the item in the list of items
     */
    isItemCompletelyInView(itemIndex) {
        return !this.isOutOfBoundsLeft(itemIndex) && !this.isOutOfBoundsRight(itemIndex);
    }

    isOutOfBoundsLeft(itemIndex) {
        // subtract the current scroll position from the "cached" offset to get the current one
        const currentOffset = this.itemPositions[itemIndex].left - this.$innerContainer.scrollLeft();
        return currentOffset < this.innerContainerDimensions.left;
    }

    isOutOfBoundsRight(itemIndex) {
        // subtract the current scroll position from the "cached" offset to get the current one
        const currentOffset = this.itemPositions[itemIndex].right - this.$innerContainer.scrollLeft();
        return currentOffset > this.innerContainerDimensions.right;
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
