import {DOM_CHANGED_EVENT} from '../classes/fef-dom-observer';

const KEYCODES = {
    'enter': 13,
    'tab': 9,
    'escape': 27
};

$(window).on(DOM_CHANGED_EVENT, (e) => {
    $('[data-modal-id]').each((index, element) => {

        $(element).on('click', () => {
            let $caller = $(element);
            let modalId = $caller.attr('data-modal-id');
            let $modalElement = $(`[data-id=${modalId}]`);

            // TODO: what if there are more than one modals with the same ID?
            if ($modalElement.length > 0) {
                new FefModal($modalElement, $caller);
            }

            //TODO: only intantiate FefModal once per modal. Destroy on close or check if already created on opening
        });
    });
});

/**
 * Handles showing and hiding a modal element
 */
export class FefModal {

    /**
     * @param $element jQuery element
     * @param $caller jQuery element
     */
    constructor($element, $caller) {
        this.$element = $element;
        this.$caller = $caller;
        this.$focusTarget = this.$element.find('.js-focus-target');

        this.bindEvents();

        this.show();
    }

    /**
     */
    bindEvents() {
        this.$element.find('.js-close-modal').on('click', () => {
            this.close();
        });

        this.$element.on('keydown', (e) => {
            if (e.keyCode === KEYCODES.escape) {
                this.close();
            }
        });
    }

    show() {
        this.$element.show();
        this.hackyFocus(this.$focusTarget);
    }

    close() {
        this.$element.hide();
        this.hackyFocus(this.$caller);
    }

    hackyFocus($element) {
        $element.attr('tabindex', -1).on('blur focusout', () => {
            $element.removeAttr('tabindex');
        }).focus();
    }
}
