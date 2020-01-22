import { KEYCODES } from '../utils/fef-keycodes';
import { DOM_INIT_EVENT } from '../utils/fef-events';

$(window).on(DOM_INIT_EVENT, () => {
    $('.radio-button, .checkbox')
        .filter((_, element) => !$(element).data('form-field-initialized'))
        .each((_, element) => {
            new FefFormField($(element));

            // mark element, so that it won't be initialized again by this module
            $(element).data('form-field-initialized', true);
        });
});

/**
 * This component enriches radio buttons and checkboxes with A11y features
 */
export class FefFormField {

    /**
     * @param $element jQuery element
     */
    constructor($element) {
        this.bindEvents($element);
    }

    /**
     * @param $element jQuery element
     */
    bindEvents($element) {
        // Enable checking radios by tabbing in + <enter>
        $element.on('keypress', (e) => {
            if (e.keyCode === KEYCODES.enter) {
                const isChecked = !$element.prop('checked');
                $element.prop('checked', isChecked);
                return false;
            }
        });
    }
}
