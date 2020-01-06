import { DOM_MUTATION_EVENTS } from '../utils/fef-events';

const HOOK_CLASS = '.image-slider';

function initImageSliders() {
    $(HOOK_CLASS)
        .filter((_, element) => !$(element).data('image-slider-initialized'))
        .each((_, element) => {
            new FefImageSlider($(element));

            // mark element, so that it won't be initialized again by this module
            $(element).data('image-slider-initialized', true);
        });
}

// Self loading on document.ready and updates if dom change event fired
$(window).on(DOM_MUTATION_EVENTS, () => initImageSliders());

// Init function for srf-plugin-loader
export function init() {
    initImageSliders();
}

export class FefImageSlider {

    constructor($element) {

        let currentPosition = 50;

        this.bindMotionEvents($element);

        this.bindMoveLeftClick(currentPosition, $element);
        this.bindMoveRightClick(currentPosition, $element);

        $element.find('.js-spinner-container').remove();
        $element.addClass('ready');
    }

    /**
     * @param $element
     */
    bindMotionEvents($element) {

        $element.on('mousemove touchstart touchmove', (event) => {
            let compBoxLeft = $element.offset().left;

            if (event.type === 'touchstart' || event.type === 'touchmove') {
                event = event.originalEvent.touches[0];
            }

            this.moveSlider(event, compBoxLeft, $element);
        });
    }

    /**
     * @param currentPosition
     * @param $element
     */
    bindMoveLeftClick(currentPosition, $element) {
        $element.parent().find('.image-slider__move-left').on('click', (event) => {
            event.preventDefault();
            let newPosition = currentPosition > 0 ? currentPosition - 10 : currentPosition;
            currentPosition = newPosition;
            this.moveSlider(event, '', $element, newPosition);
        });
    }

    /**
     * @param currentPosition
     * @param $element
     */
    bindMoveRightClick(currentPosition, $element) {
        $element.parent().find('.image-slider__move-right').on('click', (event) => {
            event.preventDefault();
            let newPosition = currentPosition < 100 ? currentPosition + 10 : currentPosition;
            currentPosition = newPosition;
            this.moveSlider(event, '', $element, newPosition);
        });
    }

    /**
     * @param event
     * @param compBoxLeft
     * @param $element
     * @param newPosition
     */
    moveSlider(event, compBoxLeft, $element, newPosition) {
        let position = typeof newPosition == 'undefined' ? ((event.pageX - compBoxLeft) / $element.outerWidth()) * 100 : newPosition;
        let $wrapper = $element.find('.image-slider__cover-wrapper'),
            $coverImage = $element.find('.image-slider__image--cover'),
            $sliderElementLeft = $element.find('.image-slider__slider--left'),
            $sliderElementRight = $element.find('.image-slider__slider--right');

        if (position >= 0 && position <= 100) {
            $wrapper.css('width', position + '%');
            $coverImage.width(((100 / position) * 100) + '%');
            $sliderElementLeft.css({'left': position + '%'});
            $sliderElementRight.css({'left': position + '%'});
        }
    }

}
