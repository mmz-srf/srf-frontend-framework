let ANIMATION_DURATION = 200;

if (window.matchMedia('(prefers-reduced-motion)').matches) {
    ANIMATION_DURATION = 0;
}

const ANIMATION_EASING = 'easeInOutCubic';

const KEYCODES = {
    'enter': 13,
    'space': 32
};

const EXPANDER_CLASS = 'js-expander';

export function init() {
    $(`.${EXPANDER_CLASS}`).each((index, element) => {
        new FefExpander(element);
    });
}

export class FefExpander {
    constructor(element) {
        this.$element = $(element);
        this.$triggers = $('[data-expander-id]');

        for (let i = 0; i < this.$triggers.length; i++) {
            const triggerId = $(this.$triggers[i]).data('expander-id');
            const query = '[data-expander-area=' + triggerId + ']';
            this.$triggers[i].$area = $(query);

            this.bindEvents(this.$triggers[i]);
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
        this.closeAllAreas($trigger.$area);
        $trigger.$area.slideToggle(ANIMATION_DURATION, ANIMATION_EASING);
    }

    closeAllAreas($exceptedArea) {
        for (let i = 0; i < this.$triggers.length; i++) {
            if (this.$triggers[i].$area !== $exceptedArea) {
                this.$triggers[i].$area.slideUp(ANIMATION_DURATION, ANIMATION_EASING);
            }
        }
    }

}