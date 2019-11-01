import { DOM_MUTATION_EVENTS } from '../utils/fef-events';

$(window).on(DOM_MUTATION_EVENTS, () => {
    $('.js-sticky-bar').each((_, element) => {
        new FefStickyBar($(element));
    });
});

export class FefStickyBar {

    /**
     * @param $element jQuery element
     */
    constructor ($element) {
        this.$element = $element;
        this.$closeButton = $element.find('.js-close-sticky-bar');
        
        this.bindEvents();
    }

    bindEvents () {
        this.$closeButton.on('click', () => {
            this.$element.hide();
        });
    }
}
