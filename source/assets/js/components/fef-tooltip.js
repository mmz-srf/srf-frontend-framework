import {FefTouchDetection} from '../classes/fef-touch-detection';
import {DOM_CHANGED_EVENT} from '../classes/fef-dom-observer';

$(window).on(DOM_CHANGED_EVENT, (e) => {

    $('[data-tooltip-toggle]').each((index, element) => {
        new FefTooltip($(element));
    });

});

export class FefTooltip {

    /**
     * @param $element jQuery element
     */
    constructor ($element) {
        this.clientTouchSupported = FefTouchDetection.isTouchSupported();

        this.title = $element.data('tooltipContent');

        // Set correct value for touch enabled flag (YAGNI?)
        this.touchEnabled = (typeof $element.data('tooltipTouch')) !== 'undefined';

        this.tooltipEnabled = false;

        // Explicit check for provided data-tooltip-content attribute
        if (typeof this.title !== 'undefined') {
            this.tooltipEnabled = true;
        } else if (console && console.warn) {
            console.warn('Tooltip used without content, please add data-tooltip-content to enable tooltip');
        }

        // We need the original size before insertion of tooltip content
        this.originalWidth = $element.width();

        this.template = '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div>'
            + '<div class="tooltip-content"></div></div>';

        // Disable on touch devices if not explicitly set
        if (this.clientTouchSupported && !this.touchEnabled) {
            this.tooltipEnabled = false;
        }

        // Only bind if tooltip is enabled
        if (this.tooltipEnabled) {
            this.bindEvents($element);
        }
    }

    /**
     * This function will bind mouseenter and focus events
     *
     * @param $element
     */
    bindEvents ($element) {
        $element.on('mouseenter focus', () => {
            $element.children('.tooltip').remove();

            $element.append(this.template);
            $element.css('position', 'relative');

            $element.find('.tooltip-content').html(this.title);

            let $tooltip = $element.children('.tooltip');

            // Move tooltip in right position relative to its parent
            let leftPosition = (this.originalWidth - $tooltip.width()) / 2;

            let topPosition = ($tooltip.height() + 25) * -1;

            $tooltip.css({
                "top": topPosition,
                "left": leftPosition - 8,
                "position": "absolute"
            });
        });

        $element.on('mouseleave focusout', () => {
            $element.children('.tooltip').remove();
        });
    }

}
