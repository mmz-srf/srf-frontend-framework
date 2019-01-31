let ANIMATIONDURATION = 200;

if (window.matchMedia('(prefers-reduced-motion)').matches) {
    ANIMATIONDURATION = 0;
}

const ANIMATIONEASING = 'easeInOutCubic';
const KEYCODES = {
    'enter': 13,
    'space': 32
};

export function init() {
    $('.js-expandable-box').each((index, elem) => {
        new FefExpandableBox($(elem));
    });
}

export class FefExpandableBox {

    /**
     * @param $element jQuery.element
     */
    constructor ($element) {
        this.$element = $element;
        this.$arrow = $element.find('.expand-icon');
        this.$body = $element.find('.js-expandable-box--body');
        this.$header = $element.find('.js-expandable-box--header');

        this.$switchTrigger = $element.find('.js-expand-switch-trigger');
        if (!this.$switchTrigger.length) {
            this.$switchTrigger = this.$header;
        }

        // Values for tracking, read from the template
        this.eventSource = this.$element.data('event-source');
        this.eventValue = this.$element.data('event-value');

        // An expandable box can be opened immediately - this is indicated via the data-initially-open flag
        if (this.$element.data('initially-open') !== undefined) {
            this.openBox(0);
        }

        this.bindEvents();
    }

    /**
     * Bind click and keydown event so that the box can be opened/closed.
     */
    bindEvents () {

        let clickHandler = (event) => {
            this.toggleBox(event);
        };

        let keyboardHandler = (event) => {
            if (event.keyCode === KEYCODES.enter || event.keyCode === KEYCODES.space) {
                this.toggleBox(event, {keyPress: true});
            }
        };

        this.$switchTrigger.on('click', clickHandler);
        this.$switchTrigger.on('keydown', keyboardHandler);
    }

    /**
     * Opens or closes the content of the box. This is done via jQuery's slideUp/-Down because
     * the height is dynamic.
     *
     * @param event
     * @param options Option object for named parameters
     */
    toggleBox(event, options) {
        let willBeShown = !this.$element.hasClass('expandable-box--expanded');

        if (willBeShown) {
            this.openBox(ANIMATIONDURATION);
        } else {
            this.closeBox(ANIMATIONDURATION);
        }

        $(window).trigger('fef.track.interaction', {
            event_type: options && options.keyPress ? 'keypress' : 'click',
            event_source: this.eventSource,
            event_name: willBeShown ? 'Open': 'Close',
            event_value: this.eventValue
        });

        $(window).trigger('fef.expandable.interaction', {
            event_type: options && options.keyPress ? 'keypress' : 'click',
            event_source: this.eventSource,
            event_name: willBeShown ? 'Open': 'Close',
            event_value: this.eventValue
        });
    }

    openBox(duration) {
        this.$element.addClass('expandable-box--expanded');
        this.$arrow.addClass('expand-icon--open');
        this.$body.slideDown(duration, ANIMATIONEASING);
    }

    closeBox(duration) {
        this.$element.removeClass('expandable-box--expanded');
        this.$arrow.removeClass('expand-icon--open');
        this.$body.slideUp(duration, ANIMATIONEASING);
    }
}
