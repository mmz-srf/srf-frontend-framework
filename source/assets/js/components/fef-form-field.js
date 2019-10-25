import { KEYCODES } from '../utils/fef-keycodes';
import { DOM_CHANGED_EVENT } from '../utils/fef-events';

$(window).on(DOM_CHANGED_EVENT, (e) => {
    $('.radio-button, .checkbox').each((index, element) => {
        new FefFormField($(element));
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
