import { DOM_INIT_EVENT } from '../utils/fef-events';

$(window).on(DOM_INIT_EVENT, () => {
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
        this.$closeButton.on('click', () => this.hideBar());

        setTimeout(() => this.showBar(), 3000);
    }

    showBar() {
        this.$element.show();
        let modalHeight = this.$element.outerHeight();

        this.$element.css({
            'bottom': `-${modalHeight}px`,
            'transform': `translateY(-${modalHeight}px)`
        });
    }

    hideBar() {
        let modalHeight = this.$element.outerHeight();

        this.$element.one('transitionend', () => this.$element.hide());

        this.$element.css({
            'transform': `translateY(${modalHeight}px)`
        });
    }
}
