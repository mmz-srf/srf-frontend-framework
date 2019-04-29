export class FefResponsiveHelper {

    /**
     * Returns true if current breakpoint is 'smartphone'
     *
     * @returns {boolean}
     */
    static isSmartphone() {
        return this.getBreakpoint() === 'smartphone';
    }

    /**
     * Returns true if current breakpoint is 'tablet'
     *
     * @returns {boolean}
     */
    static isTablet() {
        return this.getBreakpoint() === 'tablet';
    }

    /**
     * Returns true if current breakpoint is NOT 'smartphone'
     * 
     * @returns {boolean}
     */
    static isTabletUp() {
        return !this.isSmartphone();
    }

    /**
     * Returns true if current breakpoint is 'desktop'
     *
     * @returns {boolean}
     */
    static isDesktop() {
        return this.getBreakpoint() === 'desktop';
    }

    /**
     * Returns true if current breakpoint is 'desktop' or 'desktop-wide'
     *
     * @returns {boolean}
     */
    static isDesktopUp() {
        return this.isDesktop() || this.isDesktopWide();
    }

    /**
     * Returns true if current breakpoint is 'desktop-wide'
     *
     * @returns {boolean}
     */
    static isDesktopWide() {
        return this.getBreakpoint() === 'desktop-wide';
    }

    /**
     * Returns the content of the body::before pseudo-element which contains the
     * breakpoint string set via css media queries in _breakpoints.scss
     *
     * @returns {string}
     */
    static getBreakpoint() {
        return window.getComputedStyle(document.querySelector('body'), '::before').getPropertyValue('content').replace(/\"/g, '');
    }
}
