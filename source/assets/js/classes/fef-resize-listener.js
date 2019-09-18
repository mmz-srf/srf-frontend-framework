import {FefDebounceHelper} from './fef-debounce-helper';
import {FefResponsiveHelper} from './fef-responsive-helper';

export const DEBOUNCED = 'debounced';
export const THROTTLED = 'throttled';
export const BREAKPOINT_CHANGED = 'breakpointChanges';
const DEBOUNCETIME = 100;
const THROTTLERATE = 100;

class ResizeListener {
    constructor() {
        this.subscribers = [];
        this.lastId = 0;
        this.wasListening = {
            [DEBOUNCED]: false,
            [THROTTLED]: false
        };
        this.listeners = {
            [DEBOUNCED]: FefDebounceHelper.debounce(() => this.notifySubscribers(DEBOUNCED), DEBOUNCETIME),
            [THROTTLED]: FefDebounceHelper.throttle(() => this.handleThrottledEvents(), THROTTLERATE),
            [BREAKPOINT_CHANGED]: FefDebounceHelper.throttle(() => this.handleThrottledEvents(), THROTTLERATE)
        };
        this.lastBreakpoint = FefResponsiveHelper.getBreakpoint();
    }
    
    subscribe(callback = () => {}, type = DEBOUNCED) {
        let id = this.lastId++;
        
        this.subscribers.push({
            id: id,
            callback: callback,
            type: type
        });
        
        this.updateEventListeners(type);
        return id;
    }
    
    unsubscribe(idToRemove) {
        let subscriberToRemove = this.subscribers.find(listener => listener.id !== idToRemove);
        this.subscribers = this.subscribers.filter(listener => listener.id !== idToRemove);
        this.updateEventListeners(subscriberToRemove.type);
    }
    
    updateEventListeners(type) {
        let typeHasSubscribers = this.subscribers.some(listener => listener.type === type);
        if (!this.wasListening[type] && typeHasSubscribers) {
            // wasn't listening for events of this type before but should now --> start listening
            this.startListening(type);
        } else if (this.wasListening[type] && !typeHasSubscribers) {
            // was listening for events of this type before but shouldn't anymore --> stop listening
            this.stopListening(type);
        }
    }

    startListening(type) {
        window.addEventListener('resize', this.listeners[type], { passive: true });
        this.wasListening[type] = true;
    }

    stopListening(type) {
        window.removeEventListener('resize', this.listeners[type], false);
        this.wasListening[type] = false;
    }
    
    /**
     * Informs all subscribers that subscribed to events of the provided type.
     *
     * @param {String} type DEBOUNCED|THROTTLED|BREAKPOINT_CHANGED
     */
    notifySubscribers(type) {
        this.subscribers
            .filter(listener => listener.type === type)
            .forEach(listener => listener.callback());
    }

    handleThrottledEvents() {
        this.notifySubscribers(THROTTLED);

        // Only inform subscribers that are subscribed to changes in
        // breakpoints if the breakpoint changed
        let newBreakpoint = FefResponsiveHelper.getBreakpoint();

        if (newBreakpoint !== this.lastBreakpoint) {
            this.notifySubscribers(BREAKPOINT_CHANGED);
            this.lastBreakpoint = newBreakpoint;
        }
    }
}

let rl = new ResizeListener();

export class FefResizeListener {
    /**
     * Once subscribed, the callback will be called during or after resizing,
     * depending on the provided type.
     * Returns the ID of the subscriber. This can be used to unsubscribe which
     * you should do if you no longer need to listen to the window resize.
     *
     * @param {Function} callback Will be called after the resizing is done
     * @param {String} type DEBOUNCED (default), THROTTLED or BREAKPOINT_CHANGED
     * @returns {Number} id ID of the subscriber (for unsubscribing)
     */
    static subscribe(callback = () => {}, type = DEBOUNCED) {
        return rl.subscribe(callback, type);
    }

    /**
     * Once subscribed, the callback will be called after a resize event took
     * place (debounced).
     * Returns the ID of the subscriber. This can be used to unsubscribe which
     * you should do if you no longer need to listen to the window resize.
     *
     * @param {Function} callback Will be called after the resizing is done
     * @returns {Number} id ID of the subscriber (for unsubscribing)
     */
    static subscribeDebounced(callback = () => {}) {
        return rl.subscribe(callback, DEBOUNCED);
    }

    /**
     * Once subscribed, the callback will be called continuously while the
     * window is being resized. For performance reason, this happens at most
     * at a fixed rate.
     * Returns the ID of the subscriber. This can be used to unsubscribe which
     * you should do if you no longer need to listen to the window resize.
     *
     * @param {Function} callback Will be called during the resizing
     * @returns {Number} id ID of the subscriber (for unsubscribing)
     */
    static subscribeThrottled(callback = () => {}) {
        return rl.subscribe(callback, THROTTLED);
    }

    /**
     * Once subscribed, the callback will be called when the breakpoint
     * changed. Note: The breakpoint is checked at the same frequency as the
     * throttled events!
     * Returns the ID of the subscriber. This can be used to unsubscribe which
     * you should do if you no longer need to listen to the window resize.
     *
     * @param {Function} callback Will be called when the breakpoint changed
     * @returns {Number} id ID of the subscriber (for unsubscribing)
     */
    static subscribeToBreakpointChanges(callback = () => {}) {
        return rl.subscribe(callback, BREAKPOINT_CHANGED);
    }

    static unsubscribe(idToRemove) {
        rl.unsubscribe(idToRemove);
    }
}
