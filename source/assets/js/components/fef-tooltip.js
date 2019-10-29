import {FefTouchDetection} from '../classes/fef-touch-detection';
import { DOM_MUTATION_EVENTS } from '../utils/fef-events';

$(window).on(DOM_MUTATION_EVENTS, (e) => {
    $('[data-tooltip-toggle]').each((index, element) => {
        new FefTooltip($(element));
    });

});

const DEFAULT_OFFSET = 16; // distance between tooltip's triangle and the edge of the parent
const ADDITIONAL_OFFSET = 9; // padding + triangle

export class FefTooltip {

    /**
     * @param $element jQuery element
     */
    constructor ($element) {
        // make sure tooltip doesn't get initialized multiple times
        if ($element.data('tooltipInitialized') === true) {
            return;
        }

        this.clientTouchSupported = FefTouchDetection.isTouchSupported();
        this.title = $element.data('tooltipContent');

        // Set correct value for touch enabled flag (YAGNI?)
        this.touchEnabled = (typeof $element.data('tooltipTouch')) !== 'undefined';
        this.tooltipEnabled = false;

        // Explicit check for provided data-tooltip-content attribute
        if (typeof this.title !== 'undefined') {
            this.tooltipEnabled = true;
        // eslint-disable-next-line no-console
        } else if (console && console.warn) {
            // eslint-disable-next-line no-console
            console.warn('Tooltip used without content, please add data-tooltip-content to enable tooltip');
        }

        // We need the original size before insertion of tooltip content
        this.originalWidth = $element.width();

        // enable passing a modifier to the tooltip
        let modifier = $element.data('tooltipModifier') === undefined ? '' : $element.data('tooltipModifier');

        this.template = `
            <div class="tooltip ${modifier}" role="tooltip">
                <div class="tooltip-arrow"></div>
                <div class="tooltip-content"></div>
            </div>`;

        // Disable on touch devices if not explicitly set
        if (this.clientTouchSupported && !this.touchEnabled) {
            this.tooltipEnabled = false;
        }

        // Only bind if tooltip is enabled
        if (this.tooltipEnabled) {
            this.bindEvents($element);
        }

        $element.data('tooltipInitialized', true);
    }

    /**
     * This function will bind events when the tooltip should be shown and
     * hidden. This can be mouse and focus events, but also manually triggered
     * events.
     *
     * @param $element
     */
    bindEvents ($element) {
        let showEvents = 'srf.tooltip.show',
            hideEvents = 'srf.tooltip.hide';

        if ($element.data('tooltipNoHover') === undefined) {
            showEvents += ' mouseenter focus';
            hideEvents += ' mouseleave focusout';
        }

        $element.on(showEvents, () => {
            $element.children('.tooltip').remove();

            $element.append(this.template);
            $element.css('position', 'relative');

            $element.find('.tooltip-content').html(this.title);

            const $tooltip = $element.children('.tooltip');

            // use custom offset, if defined. Otherwise take the default offset
            let offset = $element.data('tooltipOffset') ? $element.data('tooltipOffset') : DEFAULT_OFFSET;

            // Move tooltip in right position relative to its parent
            const leftPosition = (this.originalWidth - $tooltip.width()) / 2;
            const topPosition = ($tooltip.height() + ADDITIONAL_OFFSET + offset) * -1;

            $tooltip.css({
                'top': topPosition,
                'left': leftPosition - 8,
                'position': 'absolute'
            });
        }).on(hideEvents, () => {
            $element.children('.tooltip').remove();
        });
    }
}
