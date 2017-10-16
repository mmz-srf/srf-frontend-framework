export function init() {
    $(".swipemod").each((index, elem) => {
        new SrfSwiper(elem);
    });
}

const ANIMATIONSPEED = 500;
const DIRECTION = {LEFT: "left", RIGHT: "right"};
const isSize2        = () => { return window.innerWidth >= 768 && window.innerWidth < 1024; };
const isSize2Plus    = () => { return window.innerWidth >= 768; };
const isSize3Plus    = () => { return window.innerWidth >= 1024; };
const isSize4        = () => { return window.innerWidth >= 1280; };
const potentialSlots = () => { return isSize3Plus() ? 3 : isSize2() ? 2 : 1; };
const debounce = (fn, time) => {
    let timeout;

    return function() {
        const functionCall = () => fn.apply(this, arguments);

        clearTimeout(timeout);
        timeout = setTimeout(functionCall, time);
    }
};

export class SrfSwiper {

    constructor(element) {
        this.$element = $(element);
        this.$swipeContainer = this.$element.find(".swipemod-swipecontainer");
        this.$container = this.$element.find(".swipemod-container");
        this.containerPadding = parseInt(this.$container.css("paddingLeft"));

        this.$items = this.$element.find(".swipemod-item");
        this.$prevBtn = this.$element.find(".swipemod-button[data-direction='left']");
        this.$nextBtn = this.$element.find(".swipemod-button[data-direction='right']");

        this.registerListeners();

        this.showHidePrevNextButtons();
    }

    registerListeners() {
        this.$element.on("click", ".swipemod-button", event => this.onButtonClick(event) );

        this.$element.on("click", ".swipemod-item", event => this.onItemClick(event) );

        this.$swipeContainer.on("scroll", debounce(() => this.afterScroll(), 100) );
    }

    afterScroll() {
        this.showHidePrevNextButtons();
    }

    onButtonClick(event) {
        let $btn = $(event.currentTarget),
            direction = $btn.data("direction");

        if (direction === DIRECTION.LEFT) {
            this.scrollLeft();
        } else if (direction === DIRECTION.RIGHT) {
            this.scrollRight();
        }
    }

    /**
     * If an item is completely visible, let the browser handle the link click.
     * Otherwise, prevent that and scroll the item into view.
     * @param event
     */
    onItemClick(event) {
        let $itemElem = $(event.currentTarget);

        if ( !this.isItemCompletelyInView($itemElem) ) {
            event.preventDefault();
            this.scrollItemIntoView($itemElem);
        }
    }

    /**
     * We can scroll to the left as long as the first item is "too far left".
     *
     * @return {Boolean}
     */
    canScrollLeft() {
        return this.isOutOfBoundsLeft( this.$items.first() );
    }

    /**
     * We can scroll to the right as long as the last item is "too far right".
     *
     * @return {Boolean}
     */
    canScrollRight() {
        return this.isOutOfBoundsRight( this.$items.last() );
    }

    showHidePrevNextButtons() {
        let showLeft = false,
            showRight = false;


        if (isSize2Plus()) {
            showLeft = this.canScrollLeft();
            showRight = this.canScrollRight();
        }

        this.$prevBtn.toggle( showLeft );
        this.$nextBtn.toggle( showRight );
    };

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

    scrollLeft() {
        $(this.$items.get().reverse()).each( (index, el) => {
            if ( this.isOutOfBoundsLeft( $(el) ) ) {
                this.scrollItemIntoView( $(el) );
                return false;
            }
        });

        this.afterScroll();
    }

    scrollRight() {
        this.$items.each( (index, el) => {
            if ( this.isOutOfBoundsRight( $(el) ) ) {
                this.scrollItemIntoView( $(el) );
                return false;
            }
        });

        this.afterScroll();
    }

    /**
     * How to center an element in 3 easy steps:
     * 1) Calculate how far away the item's center IS from the windows's left side
     * 2) Calculate how far away the item's center SHOULD BE from the window's left side
     * 3) add the difference to the previously scrolled amount
     *
     * @param $itemElem
     */
    centerElement($itemElem) {
        let newScrollPos = this.$swipeContainer.scrollLeft();

        // Center Element: The additional distance to scroll is the difference between the current and the target distance to the left edge from the center of the window.
        let currentDistanceToLeftEdge = $itemElem.offset().left;
        let targetDistanceToLeftEdge = (window.innerWidth - $itemElem.outerWidth()) / 2;
        newScrollPos += currentDistanceToLeftEdge - targetDistanceToLeftEdge;

        this.scrollTo(newScrollPos);
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
        if (potentialSlots() === 1) {
            this.centerElement($itemElem);
        } else if (potentialSlots() === 2) {
            let itemPadding = ($itemElem.outerWidth(true) - $itemElem.outerWidth()) / 2,
                currentDistanceToCenter = $itemElem.offset().left - (window.innerWidth / 2),
                newScrollPos = this.$swipeContainer.scrollLeft();

            if (this.isOutOfBoundsLeft($itemElem)) {
                currentDistanceToCenter += $itemElem.outerWidth(true);
            }

            newScrollPos += currentDistanceToCenter - itemPadding;
            this.scrollTo(newScrollPos);
        } else if (potentialSlots() === 3) {
            // same as #1 but with the next/previous element.
            let indexToCenter = this.$items.index($itemElem);

            if (this.isOutOfBoundsLeft($itemElem)) {
                indexToCenter++;
            } else {
                indexToCenter--;
            }

            if (indexToCenter < 0) {
                indexToCenter = 0;
            } else if (indexToCenter >= this.$items.length) {
                indexToCenter = this.$items.length - 1;
            }

            this.centerElement( $(this.$items.get(indexToCenter)) );
        }
    }

    scrollTo(targetPos) {
        this.$swipeContainer.animate({
            scrollLeft: targetPos
        }, ANIMATIONSPEED, () => {
            this.afterScroll();
        });
    }
}
