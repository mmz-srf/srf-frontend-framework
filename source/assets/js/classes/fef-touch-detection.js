export class FefTouchDetection {

    /**
     * This  is a helper function to detect if a device supports touch events
     *
     * @returns {boolean}
     */
    static isTouchSupported() {
        return ('ontouchstart' in window) || typeof window.DocumentTouch !== 'undefined' && document instanceof DocumentTouch;
    }

    /**
     * Checks if an event was caused by a mouse click or a keyboard.
     *
     * @param {jQuery.event} event
     */
    static eventIsMouseclick(event) {
        return event.screenX !== undefined && event.screenX !== 0 && event.screenY !== undefined && event.screenY !== 0;
    }
}
