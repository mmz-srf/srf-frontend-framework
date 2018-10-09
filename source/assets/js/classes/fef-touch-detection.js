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
     * Detects if the given event is a TouchEvent.
     *
     * @returns {boolean}
     */
    static isTouchEvent(event) {
        const originalEvent = event.originalEvent ? event.originalEvent : event;
        return typeof originalEvent.touches !== 'undefined';
    }

    /**
     * Returns the number of touch points if the given event is a TouchEvent.
     *
     * @returns {boolean}
     */
    static getTouchCount(event) {
        const originalEvent = event.originalEvent ? event.originalEvent : event;
        return FefTouchDetection.isTouchEvent(originalEvent) ? originalEvent.touches.length : 0;
    }

}
