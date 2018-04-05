import {DOM_CHANGED_EVENT} from '../classes/fef-dom-observer';

const ANIMATION_SPEED = 200;
const KEYCODES = {
    'enter': 13,
    'tab': 9,
    'escape': 27
};

let existingModals = {};

$(window).on(DOM_CHANGED_EVENT, (e) => {
    $('[data-modal-id]').each((index, element) => {

        $(element).on('click', () => {
            let $caller = $(element);
            let modalId = $caller.attr('data-modal-id');
            let $modalElement = $(`[data-id=${modalId}]`);

            // TODO: what if there are more than one modals with the same ID?
            if (existingModals[modalId]) {
                existingModals[modalId].show();
            } else if ($modalElement.length > 0) {
                existingModals[modalId] = new FefModal($modalElement, $caller);
            }
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
     * Binds the relevant events for this modal:
     * - Click on a close-button or the overlay
     * - Pressing Escape
     */
    bindEvents() {
        this.$element.find('.js-close-modal, .js-modal-overlay').on('click', () => {
            this.close();
        });

        this.$element.on('keydown', (e) => {
            if (e.keyCode === KEYCODES.escape) {
                this.close();
            }
        });
    }

    show() {
        this.$element.stop(true, true).fadeIn(ANIMATION_SPEED);
        this.setFocus(this.$focusTarget);
    }

    close() {
        this.$element.stop(true, true).fadeOut(ANIMATION_SPEED);
        this.setFocus(this.$caller);
    }

    /**
     * Simply using .focus() doesn't suffice.
     * 
     * @param $element jQuery.Element
     */
    setFocus($element) {
        $element.attr('tabindex', -1).on('blur focusout', () => {
            $element.removeAttr('tabindex');
        }).focus();
    }
}
