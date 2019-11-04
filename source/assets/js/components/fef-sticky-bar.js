import { DOM_INIT_EVENT } from '../utils/fef-events';

const JS_HOOK_ELEMENT = '.js-sticky-bar';
const JS_HOOK_CLOSE_BUTTON = '.js-close-sticky-bar';
const TIME_TO_SHOW = 3000;

$(window).on(DOM_INIT_EVENT, () => {
    $(JS_HOOK_ELEMENT).each((_, element) => {
        new FefStickyBar($(element));
    });
});

export class FefStickyBar {

    /**
     * @param $element jQuery element
     */
    constructor ($element) {
        this.$element = $element;
        this.$closeButton = $element.find(JS_HOOK_CLOSE_BUTTON);
        
        this.bindEvents();
    }

    bindEvents () {
        this.$closeButton.on('click', () => this.hideBar());

        setTimeout(() => this.showBar(), TIME_TO_SHOW);
    }

    showBar() {
        this.$element.show();
        let modalHeight = this.$element.outerHeight();

        this.$element.css({
            'bottom': `-${modalHeight}px`,
            'transform': `translateY(-${modalHeight}px)`
        });

        $('body').css('margin-bottom', modalHeight);
    }

    hideBar() {
        let modalHeight = this.$element.outerHeight();

        this.$element.one('transitionend', () => this.$element.hide());

        this.$element.css({
            'transform': `translateY(${modalHeight}px)`
        });

        $('body').css('margin-bottom', '');
    }
}
