import {DOM_CHANGED_EVENT} from '../classes/fef-dom-observer';

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
            if (e.keyCode === 13) {
                const isChecked = !$element.prop('checked');
                $element.prop('checked', isChecked);
                return false;
            }
        });
    }
}
