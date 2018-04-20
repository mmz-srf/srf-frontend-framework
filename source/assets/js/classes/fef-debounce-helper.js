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
}
