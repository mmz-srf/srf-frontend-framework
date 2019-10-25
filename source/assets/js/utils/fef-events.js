/**
 * This event is triggered when the DOM was changed.
 * 
 * Example trigger: FefDomObserver
 * Example listener: FefModal (checks if new modal triggers were added to the DOM)
 * 
 * @type {string}
 */
export const DOM_CHANGED_EVENT = 'fef.dom.changed';

/**
 * This event is triggered when an element changed its height.
 * 
 * Example trigger: FefGlobalnav (can open/close submenu which changes the height)
 * Example listener: FefModal (needs to check if the content of the modal is now larger/smaller than the viewport height)
 * 
 * @type {string}
 */
export const DOM_HEIGHT_CHANGE_EVENT = 'fef.element.height.changed';

/**
 * Triggered when an image slider was loaded.
 * 
 * @param {Object} component instance of a component (usually 'this' when triggering)
 * @param {JQuery.element} element corresponding DOM of the instance
 * Example trigger: FefImageSlider
 * Example listener: ?
 * 
 * @type {string}
 */
export const COMPONENT_LOADED = 'fef.component.image.slider.loaded';

/**
 * Triggered when a search component should be deactivated.
 * 
 * Example trigger: ?
 * Example listener: SrfSearch
 * 
 * @type {string}
 */
export const SET_SEARCH_INACTIVE_EVENT = 'srf.search.deactivate';
