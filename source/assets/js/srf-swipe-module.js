export function init() {
    $(".swipemod").each((index, elem) => {
        new SrfSwiper(elem);
    });
}

const animationSpeed = 500;

export class SrfSwiper {

    constructor(element) {
        this.$element = $(element);
        this.$swipeContainer = this.$element.find(".swipemod-swipecontainer");
        this.$container = this.$element.find(".swipemod-container");
        this.$containerPadding = parseInt(this.$container.css("paddingLeft"));

        this.registerListeners();
    }

    registerListeners() {
        this.$element.on("click", ".swipemod-button", event => this.onButtonClick(event) );

        this.$element.on("click", ".swipemod-item", event => this.onItemClick(event) );

    }

    onButtonClick(event) {
        let $btn = $(event.currentTarget),
            direction = $btn.data("direction");

        if (direction === "left") {
            this.scrollLeft();
        } else if (direction === "right") {
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
     * An element is inside its parent's boundaries if it doesn't go over the left or right side.
     * @param $itemElem
     * @return {boolean}
     */
    isItemCompletelyInView($itemElem) {
        return !this.isOufOfBoundsLeft($itemElem) && !this.isOutOfBoundsRight($itemElem);
    }

    isOufOfBoundsLeft($itemElem) {
        return $itemElem.offset().left < this.$container.offset().left;
    }

    isOutOfBoundsRight($itemElem) {
        let rightEdgeItem = $itemElem.offset().left + $itemElem.outerWidth(),
            rightEdgeContainer = this.$container.offset().left + this.$container.outerWidth();

        return rightEdgeItem > rightEdgeContainer;
    }

    scrollLeft() {
        $(this.$element.find(".swipemod-item").get().reverse()).each( (index, el) => {
            if ( this.isOufOfBoundsLeft( $(el) ) ) {
                this.scrollItemIntoView( $(el) );
                return false;
            }
        });
    }

    scrollRight() {
        this.$element.find(".swipemod-item").each( (index, el) => {
            if ( this.isOutOfBoundsRight( $(el) ) ) {
                this.scrollItemIntoView( $(el) );
                return false;
            }
        });
    }

    scrollItemIntoView($itemElem) {
        let currentScrollPos = this.$swipeContainer.scrollLeft(),
            newScrollPos = currentScrollPos;

        if (this.isOufOfBoundsLeft($itemElem)) {
            newScrollPos -= this.$container.offset().left - $itemElem.offset().left;
            newScrollPos -= this.$containerPadding;
        } else {
            let rightEdgeItem = $itemElem.offset().left + $itemElem.outerWidth(),
                rightEdgeContainer = this.$container.offset().left + this.$container.outerWidth();

            newScrollPos += rightEdgeItem - rightEdgeContainer;
            newScrollPos += this.$containerPadding;
        }

        this.$swipeContainer.animate({
            scrollLeft: newScrollPos
        }, animationSpeed);
    }
}
