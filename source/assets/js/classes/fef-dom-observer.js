$(document).ready(function () {
    let observer = new FefDomObserver();
    observer.triggerDomInitEvent();
});

export const DOM_INIT_EVENT = 'fef.dom.initialized';
export const DOM_CHANGED_EVENT = 'fef.dom.changed';
export const DOM_MUTATION = 'fef.dom.initialized fef.dom.changed';

export class FefDomObserver {

    constructor () {
        const targetNode = document.querySelector('body');
        // Options for the observer (which mutations to observe)
        const config = { attributes: false, childList: true, subtree: false };

        // Callback function to execute when mutations are observed
        const callback = (mutationsList, observer) => {
            let mutationsOfInterest = 0;

            for(let mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    console.log('A child node has been added or removed.', mutation);
                    mutationsOfInterest++;
                }
                else if (mutation.type === 'attributes') {
                    console.log('The ' + mutation.attributeName + ' attribute was modified.');
                }
            }

            if (mutationsOfInterest > 0) {
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
