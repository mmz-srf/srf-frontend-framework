let ANIMATION_DURATION = 200;

if (window.matchMedia('(prefers-reduced-motion)').matches) {
    ANIMATION_DURATION = 0;
}

const ANIMATION_EASING = 'easeInOutCubic';

const KEYCODES = {
    'enter': 13,
    'space': 32
};

export function init() {
    $('.js-expander').each((index, element) => {
        new FefExpander($(element));
    });
}

export class FefExpander {

    /**
     * @param $element jQuery.element
     */
    constructor($element) {
        this.$element = $element;
        this.$trigger = $('.js-expander-area');

        for (let i = 0; i < this.$trigger.length; i++) {
            const triggerId = $(this.$trigger[i]).attr('data-expander-id');
            const expandArea = '[data-expander-area=' + triggerId + ']';
            this.$trigger[i].$expandArea = $(expandArea);

            this.bindEvents(this.$trigger[i]);
        }
    }

    bindEvents($trigger) {
        let clickHandler = () => {
            this.toggleArea($trigger);
        };

        let keyboardHandler = (event) => {
            if (event.keyCode === KEYCODES.enter || event.keyCode === KEYCODES.space) {
                this.toggleArea($trigger);
            }
        };

        $($trigger).on('click', clickHandler);
        $($trigger).on('keydown', keyboardHandler);
    }

    toggleArea($trigger) {
        this.closeAllAreas($trigger.$expandArea);
        $trigger.$expandArea.slideToggle(ANIMATION_DURATION, ANIMATION_EASING);
    }

    closeAllAreas($exceptedArea) {
        for (let i = 0; i < this.$trigger.length; i++) {
            if (this.$trigger[i].$expandArea !== $exceptedArea) {
                this.$trigger[i].$expandArea.slideUp(ANIMATION_DURATION, ANIMATION_EASING);
            }
        }
    }
}
