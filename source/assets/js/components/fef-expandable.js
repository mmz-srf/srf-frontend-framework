$(document).ready(() => {
    $('.js-expandable').each((index, elem) => {
        new FefExpandable($(elem));
    });
});

const ANIMATIONDURATION = 200;
const ANIMATIONEASING = 'easeInOutCubic';
const KEYCODES = {
    'enter': 13,
    'space': 32
};

export class FefExpandable {

    /**
     * @param $element jQuery.element
     */
    constructor ($element) {
        this.$element = $element;
        this.$arrow = $element.find('.expand-icon');
        this.$body = $element.find('.js-expandable--body');
        this.$header = $element.find('.js-expandable--header');

        this.bindEvents();
    }

    /**
     * Bind click and keydown event so that the box can be opened/closed.
     */
    bindEvents () {
        this.$header.on('click', (event) => {
            this.toggleBox(event);
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
        let willBeShown = !this.$element.hasClass('expandable--expanded');

        this.$element.toggleClass('expandable--expanded', willBeShown);

        if (this.$arrow) {
            this.$arrow.toggleClass('expand-icon--open', willBeShown);
        }

        if (willBeShown) {
            this.$body.slideDown(ANIMATIONDURATION, ANIMATIONEASING);
        } else {
            this.$body.slideUp(ANIMATIONDURATION, ANIMATIONEASING);
        }
    }
}
