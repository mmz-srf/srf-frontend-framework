import { DOM_CHANGED_EVENT, DOM_INIT_EVENT } from '../utils/fef-events';

$(document).ready(function () {
    let observer = new FefDomObserver();
    observer.triggerDomInitEvent();
});

export class FefDomObserver {

    constructor () {
        const targetNode = document.querySelector('body');
        // Options for the observer (which mutations to observe)
        const config = { attributes: false, childList: true, subtree: false };

        // Callback function to execute when mutations are observed
        const callback = (mutationsList, observer) => {
            // Let's only trigger changed events if we have any that are of interest
            if (mutationsList.some(mutation => mutation.type === 'childList' && mutation.addedNodes.length > 0)) {
                setTimeout(() => {
                    this.triggerDomChangedEvent();
                }, 250);
            }
        };

        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);
    }

    /**
     * This event can be triggered to react to DOM initializations
     */
    triggerDomInitEvent () {
        $(window).trigger(DOM_INIT_EVENT);
    }

    /**
     * This event can be triggered to react to DOM changes
     */
    triggerDomChangedEvent () {
        $(window).trigger(DOM_CHANGED_EVENT);
    }

}
