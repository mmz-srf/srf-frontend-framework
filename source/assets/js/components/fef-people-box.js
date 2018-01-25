$(document).ready(() => {
    $(".js-people").each((index, elem) => {
        new FefPeopleBox($(elem));
    });
});

const ANIMATIONDURATION = 200;
const KEYCODES = {
    'enter': 13,
    'space': 32
};

export class FefPeopleBox {

    /**
     * @param $element jQuery.element
     */
    constructor ($element) {
        this.$element = $element;
        this.$arrow = $element.find(".expand-icon");
        this.$body = $element.find(".js-people-body");
        this.$header = $element.find(".js-people-header");

        this.bindEvents();
    }

    /**
     * Bind click and keydown event so that the people box can be opened/closed.
     */
    bindEvents () {
        this.$header.on('click', (event) => {
            this.toggleBox(event)
            this.$header.blur();
        });

        this.$header.on('keydown', (event) => {
            if (event.keyCode === KEYCODES.enter || event.keyCode === KEYCODES.space) {
                this.toggleBox(event);
            }
        });
    }

    /**
     * Opens or closes the content of the box. This is done via jQuery's slideUp/-Down because
     * the height is dynamic.
     *
     * @param event
     */
    toggleBox(event) {
        let willBeShown = !this.$element.hasClass("people--expanded");

        this.$element.toggleClass("people--expanded", willBeShown);
        this.$arrow.toggleClass('expand-icon--open', willBeShown);

        if (willBeShown) {
            this.$body.slideDown(ANIMATIONDURATION);
        } else {
            this.$body.slideUp(ANIMATIONDURATION);
        }

        event.preventDefault();
        event.stopPropagation();
    }
}
