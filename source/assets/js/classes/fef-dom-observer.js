$(document).ready(function () {
    let observer = new FefDomObserver();
    observer.triggerDomChangedEvent();
});

export const DOM_CHANGED_EVENT = 'fef.dom.changed';

export class FefDomObserver {

    /**
     * This event can be triggered to react to DOM changes
     */
    triggerDomChangedEvent () {
        $(window).trigger(DOM_CHANGED_EVENT);
    }

}
