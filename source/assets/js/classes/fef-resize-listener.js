import {FefDebounceHelper} from './fef-debounce-helper';
import {FefResponsiveHelper} from './fef-responsive-helper';

export const DEBOUNCED = 'debounced';
export const THROTTLED = 'throttled';
export const BREAKPOINT_CHANGED = 'breakpointChanges';
const DEBOUNCETIME = 100;
const THROTTLERATE = 100;

class ResizeListener {
    constructor() {
        // make sure there's only one ResizeListener
        if(ResizeListener.instance) {
            return ResizeListener.instance;
        }

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

        ResizeListener.instance = this;
    }
    
    /**
     * Upon subscribing, a new entry in the subscriber list will be added.
     * The subscriber will be notified of the desired events by calling the
     * provided callback function.
     * To enable unsubscribing, an ID wil be generated and returned to the
     * subscriber.
     *
     * @param {Function} callback Function that will be called when the desired event occurs
     * @param {String} type DEBOUNCED|THROTTLED|BREAKPOINT_CHANGED
     */
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
    
    /**
     * A subscriber can also unsubscribe of the events they were subscribed to.
     *
     * @param {Number} idToRemove ID of the subscriber to be removed
     */
    unsubscribe(idToRemove) {
        let subscriberToRemove = this.subscribers.find(listener => listener.id !== idToRemove);
        this.subscribers = this.subscribers.filter(listener => listener.id !== idToRemove);
        this.updateEventListeners(subscriberToRemove.type);
    }
    
    /**
     * After the number of subscribers for a type changed, the need for
     * listeners must be checked. If it was the last subscriber and they
     * unsubscribed, the listener can be removed. If it's the first subscriber
     * for this type, the corresponding listener needs to be added.
     *
     * @param {String} type DEBOUNCED|THROTTLED|BREAKPOINT_CHANGED
     */
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

    /**
     * Add a listener for the provided type.
     *
     * @param {String} type DEBOUNCED|THROTTLED|BREAKPOINT_CHANGED
     */
    startListening(type) {
        window.addEventListener('resize', this.listeners[type], { passive: true });
        this.wasListening[type] = true;
    }

    /**
     * Remove a listener for the provided type.
     *
     * @param {String} type DEBOUNCED|THROTTLED|BREAKPOINT_CHANGED
     */
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

    /**
     * For throttled events, subscribers for breakpoint changes also want to be
     * informed (if the breakpoint changed).
     */
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

// We don't want to make the ResizeListener public - use the static methods in
// FefResizeListener that interact with the ResizeListener instance:
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

    /**
     * If a subscriber no longer wants to receive updates about the resize
     * events, they can unsubscribe here.
     *
     * @param {Number} idToRemove ID of the subscriber
     */
    static unsubscribe(idToRemove) {
        rl.unsubscribe(idToRemove);
    }
}
