export function init() {
    $(".swipemod").each((index, elem) => {
        new SrfSwiper(elem);
    });
}

const animationSpeed = 500;
const DIRECTION = {LEFT: "left", RIGHT: "right"};
const BREAKPOINT_2 = 768;
const isSize2 = () => {
    return window.innerWidth >= BREAKPOINT_2;
};
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


        if (isSize2()) {
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

        this.showHidePrevNextButtons();
    }

    scrollRight() {
        this.$items.each( (index, el) => {
            if ( this.isOutOfBoundsRight( $(el) ) ) {
                this.scrollItemIntoView( $(el) );
                return false;
            }
        });

        this.showHidePrevNextButtons();
    }

    scrollItemIntoView($itemElem) {
        let currentScrollPos = this.$swipeContainer.scrollLeft(),
            newScrollPos = currentScrollPos;

        if (this.isOutOfBoundsLeft($itemElem)) {
            newScrollPos -= this.$container.offset().left - $itemElem.offset().left;
            newScrollPos -= this.containerPadding;
        } else {
            let rightEdgeItem = $itemElem.offset().left + $itemElem.outerWidth(),
                rightEdgeContainer = this.$container.offset().left + this.$container.outerWidth();

            newScrollPos += rightEdgeItem - rightEdgeContainer;
            newScrollPos += this.containerPadding;
        }

        this.$swipeContainer.animate({
            scrollLeft: newScrollPos
        }, animationSpeed, () => {
            this.showHidePrevNextButtons();
        });
    }
}
