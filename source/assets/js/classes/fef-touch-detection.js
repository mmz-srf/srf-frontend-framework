export class FefTouchDetection {

    /**
     * This  is a helper function to detect if a device supports touch events
     *
     * @returns {boolean}
     */
    static isTouchSupported() {
        return ('ontouchstart' in window) || typeof window.DocumentTouch !== 'undefined' && document instanceof DocumentTouch;
    }

}
