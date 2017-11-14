export class FefTouchDetection {

    /**
     * This  is a helper function to detect if a device supports touch events
     *
     * @returns {boolean}
     */
    static isTouchSupported() {
        return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
    }

}
