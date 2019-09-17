import {FefDebounceHelper} from './fef-debounce-helper';

const DEBOUNCED = 'debounced';
const THROTTLED = 'throttled';
const DEBOUNCETIME = 100;
const THROTTLERATE = 100;

class ResizeListener {
    constructor() {
        this.listeners = [];
        this.lastId = 0;
        this.wasListening = false;
        this.debouncedListener = FefDebounceHelper.debounce(() => this.notifySubscribers(DEBOUNCED), DEBOUNCETIME);
        this.throttledListener = FefDebounceHelper.throttle(() => this.notifySubscribers(THROTTLED), THROTTLERATE);
    }
    
    subscribe(callback = () => {}, type = DEBOUNCED) {
        let id = this.lastId++;
        
        this.listeners.push({
            id: id,
            callback: callback,
            type: type
        });
        
        this.updateEventListeners();
        return id;
    }
    
    unsubscribe(idToRemove) {
        this.listeners = this.listeners.filter(listener => listener.id !== idToRemove);
        this.updateEventListeners();
    }
    
    updateEventListeners() {
        if (this.listeners.length > 0 && !this.wasListening) {
            // Wasn't listening before, should be now --> start listening
            this.startListening();
        } else if (this.listeners.length === 0 && this.wasListening) {
            // Was listening, shouldn't anymore --> stop listening
            this.stopListening();
        }
    }
    
    startListening() {
        window.addEventListener('resize', this.debouncedListener, { passive: true });
        window.addEventListener('resize', this.throttledListener, { passive: true });
        this.wasListening = true;
    }
    
    stopListening() {
        window.removeEventListener('resize', this.debouncedListener, false);
        window.removeEventListener('resize', this.throttledListener, false);
        this.wasListening = false;
    }
    
    notifySubscribers(type) {
        let filtered = this.listeners.filter(listener => listener.type === type);
        
        if (filtered.length > 0) {
            filtered.forEach(listener => listener.callback());
        }
    }
}

let rl = new ResizeListener();

export class FefResizeListener {
    static subscribe(callback = () => {}, type = DEBOUNCED) {
        return rl.subscribe(callback, type);
    }

    static subscribeDebounced(callback = () => {}) {
        return rl.subscribe(callback, DEBOUNCED);
    }

    static subscribeThrottled(callback = () => {}) {
        return rl.subscribe(callback, THROTTLED);
    }

    static unsubscribe(idToRemove) {
        rl.unsubscribe(idToRemove);
    }
}
