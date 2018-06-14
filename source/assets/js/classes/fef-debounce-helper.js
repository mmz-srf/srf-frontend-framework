export class FefDebounceHelper {

    /**
     * This is a helper for debouncing function calls (i.e. for events handlers)
     *
     * @param {function} fn - Function to be debounced
     * @param {int} time -  Call rate limit in milliseconds
     * @returns {function}
     */
    static debounce(fn, time = 100) {
        let timeout;

        return function() {
            const functionCall = () => fn.apply(this, arguments);

            clearTimeout(timeout);
            timeout = setTimeout(functionCall, time);
        };
    }

    /**
     * Throttling functions, calls a function at most at the provided rate.
     *
     * @param {function} func Function to throttle
     * @param {int} limit Call rate limit in milliseconds
     */
    static throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function() {
            const context = this;
            const args = arguments;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }
}
