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

        // Values for tracking, read from the template
        this.eventSource = this.$element.data('event-source');
        this.eventValue = this.$element.data('event-value');

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
                this.toggleBox(event, {keyPress: true});
            }
        });
    }

    /**
     * Opens or closes the content of the box. This is done via jQuery's slideUp/-Down because
     * the height is dynamic.
     *
     * @param event
     * @param options Option object for named parameters
     */
    toggleBox(event, options) {
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

        $(window).trigger('fef.track.interaction', {
            event_type: options && options.keyPress ? 'keypress' : 'click',
            event_source: this.eventSource,
            event_name: willBeShown ? 'Open': 'Close',
            event_value: this.eventValue
        });
    }
}
