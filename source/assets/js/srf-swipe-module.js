import {FefDebounceHelper} from './classes/fef-debounce-helper';
import {FefResizeListener} from './classes/fef-resize-listener';

export function init() {
    $('.swipemod').each((index, elem) => {
        new SrfSwiper(elem);
    });
}

$.extend(jQuery.easing,{
    easeOutCubic: function (x, t, b, c, d) { return c*((t=t/d-1)*t*t + 1) + b; },
});

const ANIMATIONSPEED = 500;
const DEBOUNCETIME = 100;
const DIRECTION = {LEFT: 'left', RIGHT: 'right'};
const isSize2        = () => { return window.innerWidth >= 768 && window.innerWidth < 1024; };
const isSize2Plus    = () => { return window.innerWidth >= 768; };
const isSize3Plus    = () => { return window.innerWidth >= 1024; };
const isSize4        = () => { return window.innerWidth >= 1280; };
const potentialSlots = () => { return isSize3Plus() ? 3 : isSize2() ? 2 : 1; };
const PARTIALLY_HIDDEN_CLASS = 'swipemod-item--partially-hidden';

export class SrfSwiper {

    constructor(element, options = { maxitems: 6 }) {
        this.$element = $(element);
        this.$swipeContainer = this.$element.find('.swipemod-swipecontainer');
        this.$container = this.$element.find('.swipemod-container');
        this.isAutoScrolling = false;
        this.maxitems = options.maxitems || 6;

        this.$items = this.$element.find('.swipemod-item');
        if (this.$items.length > this.maxitems) {
            let nrOfItemsToRemove = this.$items.length - this.maxitems;

            this.$items.slice(-nrOfItemsToRemove).remove();
            this.$items = this.$element.find('.swipemod-item');
        } else if (this.$items.length === 0) {
            // don't do anything if swipemodule contains no elements
            return;
        }

        this.$prevBtn = this.$element.find('.swipemod-button[data-direction="left"]');
        this.$nextBtn = this.$element.find('.swipemod-button[data-direction="right"]');

        this.registerListeners();

        this.showHidePrevNextButtons();
        this.changeVisibilityClasses();
    }

    registerListeners() {
        this.$element.on('click', '.swipemod-button', event => this.onButtonClick(event) );

        this.$element.on('click', '.swipemod-item', event => this.onItemInteraction(event) );

        this.$element.on('focusin', '.swipemod-item', event => this.onItemInteraction(event) );

        this.$swipeContainer.on('scroll', FefDebounceHelper.throttle(() => this.afterUserScrolled(), DEBOUNCETIME) );

        FefResizeListener.subscribeDebounced(() => this.afterResize());

        this.$prevBtn.hover(
            (_) => this.applyHint(20),
            (_) => this.applyHint(0)
        );

        this.$nextBtn.hover(
            (_) => this.applyHint(-20),
            (_) => this.applyHint(0)
        );
    }

    afterUserScrolled() {
        if (!this.isAutoScrolling) {
            this.showHidePrevNextButtons();
        }
        this.changeVisibilityClasses();
    }

    afterResize() {
        this.showHidePrevNextButtons();
        this.changeVisibilityClasses();
    }

    onButtonClick(event) {
        let $btn = $(event.currentTarget),
            direction = $btn.data('direction'),
            nrOfElements = potentialSlots() - 1;

        if (direction === DIRECTION.LEFT) {
            this.scrollLeft(nrOfElements);
        } else if (direction === DIRECTION.RIGHT) {
            this.scrollRight(nrOfElements);
        }
    }

    changeVisibilityClasses() {
        if (isSize3Plus()) {
            this.$items.each((_, item) => {
                let $item = $(item);
                let isInView = this.isItemCompletelyInView($item);

                $item.toggleClass(PARTIALLY_HIDDEN_CLASS, !isInView);
            });
        }
    }

    /**
     * If an item is completely visible, let the browser handle the link click.
     * Otherwise, prevent that and scroll the item into view.
     * Can also be a focus (i.e. by tabbing through the site) - same here, if
     * it's not in view, scroll to it.
     * @param event
     */
    onItemInteraction(event) {
        let $itemElem = $(event.currentTarget);

        if ( !this.isItemCompletelyInView($itemElem) ) {
            event.preventDefault();
            this.scrollItemIntoView($itemElem);
        }
    }

    /**
     * We can scroll to the left as long as the first item is 'too far left'.
     *
     * @return {Boolean}
     */
    canScrollLeft() {
        return this.isOutOfBoundsLeft( this.$items.first() );
    }

    /**
     * We can scroll to the right as long as the last item is 'too far right'.
     *
     * @return {Boolean}
     */
    canScrollRight() {
        return this.isOutOfBoundsRight( this.$items.last() );
    }

    /**
     * Whether or not the prev/next button should be available depends on the screen size and if it's
     * possible to scroll left/right any further.
     */
    showHidePrevNextButtons() {
        let showLeft = false,
            showRight = false;

        if (isSize3Plus()) {
            showLeft = this.canScrollLeft();
            showRight = this.canScrollRight();
        }

        this.togglePrevNextButtons(showLeft, showRight);
    };

    togglePrevNextButtons(showLeft, showRight) {
        this.$prevBtn
            .toggle( showLeft )
            .attr({'aria-hidden': !showLeft, 'role': showLeft ? '' : 'presentation'});
        this.$nextBtn
            .toggle( showRight )
            .attr({'aria-hidden': !showRight, 'role': showRight ? '' : 'presentation'});
    }

    /**
     * An element is inside its parent's boundaries if it doesn't go over the left or right side.
     * @param $itemElem
     * @return {boolean}
     */
    isItemCompletelyInView($itemElem) {
        return !this.isOutOfBoundsLeft($itemElem) && !this.isOutOfBoundsRight($itemElem);
    }

    isOutOfBoundsLeft($itemElem) {
        return $itemElem.offset().left < this.$container.offset().left;
    }

    isOutOfBoundsRight($itemElem) {
        let rightEdgeItem = $itemElem.offset().left + $itemElem.outerWidth(),
            rightEdgeContainer = this.$container.offset().left + this.$container.outerWidth();

        return rightEdgeItem > rightEdgeContainer;
    }

    scrollLeft(nrOfElements) {
        $(this.$items.get().reverse()).each( (index, el) => {
            if ( this.isOutOfBoundsLeft( $(el) ) ) {
                // Since the order is reversed, the index is of course wrong - have to subtract it from the length-1
                let prevIndex = (this.$items.length - 1 - index) - nrOfElements;
                let $elemToScrollTo = prevIndex < 0 ? this.$items.first() : $(this.$items.get(prevIndex));
                this.scrollItemIntoView( $elemToScrollTo );
                return false;
            }
        });
    }

    scrollRight(nrOfElements) {
        this.$items.each( (index, el) => {
            if ( this.isOutOfBoundsRight( $(el) ) ) {
                let next = index + nrOfElements;
                let $elemToScrollTo = next >= this.$items.length - 1 ? this.$items.last() : $(this.$items.get(next));
                this.scrollItemIntoView( $elemToScrollTo );
                return false;
            }
        });
    }

    /**
     * How to center an element in 3 easy steps:
     * 1) Calculate how far away the item's center IS from the windows's left side
     * 2) Calculate how far away the item's center SHOULD BE from the window's left side
     * 3) add the difference to the previously scrolled amount
     *
     * @param $itemElem
     */
    centerElement($itemElem, checkButtons) {
        let newScrollPos = this.$swipeContainer.scrollLeft();

        // Center Element: The additional distance to scroll is the difference between the current and the target distance to the left edge from the center of the window.
        let currentDistanceToLeftEdge = $itemElem.offset().left;
        let targetDistanceToLeftEdge = (window.innerWidth - $itemElem.outerWidth()) / 2;
        newScrollPos += currentDistanceToLeftEdge - targetDistanceToLeftEdge;

        this.scrollTo(newScrollPos, checkButtons);
    }

    /**
     * How to arrange your items:
     * If you have space for 1 item it should be centered. Easy peasy.
     *
     * If you have space for 2 items, it gets trickier. We don't have to center an item, but we
     * can still align the item on the window's center - but not the item's center, instead we
     * align the left side of the item to the window's center if the element was out of bounds
     * on the right side. Otherwise, we align the right side of it to to the window's center.
     *
     * If you have space for 3 items, a different item needs to be centered. Which one that is
     * depends on the direction we have to scroll. If the item that we want to scroll to was out
     * of bounds on the left side, we have to center the one to the right of it.
     *
     * @param $itemElem
     */
    scrollItemIntoView($itemElem) {
        let availableSlots = potentialSlots(),
            needsButtonCheck = true,
            isOutOfBoundsLeft = this.isOutOfBoundsLeft($itemElem);

        // UX Improvement: If scrolling to 1st or last item, immediately disable the button in this direction.
        if (availableSlots >= 2 && ($itemElem.is(this.$items.first()) || $itemElem.is(this.$items.last()) ) ) {
            this.togglePrevNextButtons(!isOutOfBoundsLeft, isOutOfBoundsLeft);
            needsButtonCheck = false;
        }

        if (availableSlots === 1) {
            this.centerElement($itemElem, needsButtonCheck);
        } else if (availableSlots === 2) {
            let itemPadding = ($itemElem.outerWidth(true) - $itemElem.outerWidth()) / 2,
                currentDistanceToCenter = $itemElem.offset().left - (window.innerWidth / 2),
                newScrollPos = this.$swipeContainer.scrollLeft();

            if (isOutOfBoundsLeft) {
                currentDistanceToCenter += $itemElem.outerWidth(true);
            }

            newScrollPos += currentDistanceToCenter - itemPadding;
            this.scrollTo(newScrollPos, needsButtonCheck);
        } else if (availableSlots === 3) {
            // same as #1 but with the next/previous element.
            let indexToCenter = this.$items.index($itemElem);

            if (isOutOfBoundsLeft) {
                indexToCenter++;
            } else {
                indexToCenter--;
            }

            if (indexToCenter < 0) {
                indexToCenter = 0;
            } else if (indexToCenter >= this.$items.length) {
                indexToCenter = this.$items.length - 1;
            }

            this.centerElement( $(this.$items.get(indexToCenter)), needsButtonCheck );
        }

        this.changeVisibilityClasses();
    }

    /**
     * Scroll to the defined position and check, if necessary, the buttons' states.
     * @param Number targetPos
     * @param Boolean checkButtons
     */
    scrollTo(targetPos, checkButtons) {
        this.isAutoScrolling = true;

        this.$swipeContainer.animate({
            scrollLeft: targetPos
        }, ANIMATIONSPEED, 'easeOutCubic', () => {
            this.isAutoScrolling = false;
            if (checkButtons) {
                this.showHidePrevNextButtons();
            }

            // move the flying focus to the new positioin after scrolling (important for swipe)
            $(document).trigger('flyingfocus:move');

        });
    }

    applyHint(pixels) {
        this.$swipeContainer.children().css('transform', `translateX(${pixels}px)`);
    }
}
