import { DOM_INIT_EVENT } from '../utils/fef-events';

const JS_HOOK_ELEMENT = '.js-sticky-sidebar';
const TIME_TO_SHOW = 3000;

$(window).on(DOM_INIT_EVENT, () => {
    $(JS_HOOK_ELEMENT).each((_, element) => {
        new FefStickySidebar($(element));
    });
});

export class FefStickySidebar {

    /**
     * @param $element jQuery element
     */
    constructor ($element) {
        this.$element = $element;
        this.bindEvents();
    }

    bindEvents () {
        setTimeout(() => this.showBar(), TIME_TO_SHOW);
    }

    showBar() {
        this.$element.show();
        let barHeight = this.$element.outerHeight();

        this.$element.css({
            'bottom': `-${barHeight}px`,
            'transform': `translateY(-${barHeight}px)`
        });

        $('body').css('margin-bottom', barHeight);
    }
}
