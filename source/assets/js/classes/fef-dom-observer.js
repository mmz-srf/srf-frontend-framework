import { DOM_CHANGED_EVENT } from '../utils/fef-events';

$(document).ready(function () {
    let observer = new FefDomObserver();
    observer.triggerDomChangedEvent();
});

export class FefDomObserver {
    /**
     * This event can be triggered to react to DOM changes
     */
    triggerDomChangedEvent () {
        $(window).trigger(DOM_CHANGED_EVENT);
    }

}
