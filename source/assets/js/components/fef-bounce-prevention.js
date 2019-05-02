/**
 * FefBouncePrevention does what it says on the tin:
 * it prevents bounces. To elaborate:
 * On iOS, it's possible to "overscroll" the page. This messes with the
 * scrolling in absolute/fixed positioned elements like modals.
 * This file basically prevents scrolling (touchmove) upwards if the body is
 * already scrolled all the way up (and the same for the downward direction).
 * 
 * See: https://srfmmz.atlassian.net/browse/SRFCMSAL-2036
 */

let startY = 0; // Stores the Y position where the touch started

export class FefBouncePrevention {
    static handleTouchstart(evt) {
        // Store the first Y position of the touch
        startY = evt.touches ? evt.touches[0].screenY : evt.screenY;
    }

    static handleTouchmove(evt) {
        // Get the element that was scrolled upon
        let el = evt.target;
    
        // Allow zooming
        let zoom = window.innerWidth / window.document.documentElement.clientWidth;
        if (evt.touches.length > 1 || zoom !== 1) {
            return;
        }
    
        // Check all parent elements for scrollability
        while (el !== document.body && el !== document) {
            // Get some style properties
            let style = window.getComputedStyle(el);
    
            if (!style) {
                // If we've encountered an element we can't compute the style for, get out
                break;
            }
    
            // Ignore range input element
            if (el.nodeName === 'INPUT' && el.getAttribute('type') === 'range') {
                return;
            }
    
            let scrolling = style.getPropertyValue('-webkit-overflow-scrolling'),
                overflowY = style.getPropertyValue('overflow-y'),
                height = parseInt(style.getPropertyValue('height'), 10);
    
            // Determine if the element should scroll
            let isScrollable = scrolling === 'touch' && (overflowY === 'auto' || overflowY === 'scroll'),
                canScroll = el.scrollHeight > el.offsetHeight;
    
            if (isScrollable && canScroll) {
                // Get the current Y position of the touch
                let curY = evt.touches ? evt.touches[0].screenY : evt.screenY;
    
                // Determine if the user is trying to scroll past the top or bottom
                // In this case, the window will bounce, so we have to prevent scrolling completely
                let isAtTop = (startY <= curY && el.scrollTop === 0);
                let isAtBottom = (startY >= curY && el.scrollHeight - el.scrollTop === height);
    
                // Stop a bounce bug when at the bottom or top of the scrollable element
                if (isAtTop || isAtBottom) {
                    evt.preventDefault();
                }
    
                // No need to continue up the DOM, we've done our job
                return;
            }
    
            // Test the next parent
            el = el.parentNode;
        }
    
        // Stop the bouncing -- no parents are scrollable
        evt.preventDefault();
    }
    
    static enable() {
        // Listen to a couple key touch events
        $(window).on('touchstart.bouncePrevention', FefBouncePrevention.handleTouchstart);
        $(window).on('touchmove.bouncePrevention', FefBouncePrevention.handleTouchmove);
    }
    
    static disable() {
        // Stop listening
        $(window).off('.bouncePrevention');
    }
    
    static checkSupport() {
        // Check if the browser supports -webkit-overflow-scrolling
        // Test this by setting the property with JavaScript on an element that exists in the DOM
        // Then, see if the property is reflected in the computed style
        let testDiv = document.createElement('div');
        document.documentElement.appendChild(testDiv);
        testDiv.style.WebkitOverflowScrolling = 'touch';
        let scrollSupport = 'getComputedStyle' in window && window.getComputedStyle(testDiv)['-webkit-overflow-scrolling'] === 'touch';
        document.documentElement.removeChild(testDiv);
    
        return scrollSupport;
    }
}
