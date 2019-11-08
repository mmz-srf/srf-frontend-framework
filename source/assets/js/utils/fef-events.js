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
 * This event is triggered when the DOM is initialized.
 * 
 * Example trigger: FefDomObserver
 * Example listener: FefModal
 * 
 * @type {string}
 */
export const DOM_INIT_EVENT = 'fef.dom.initialized';

/**
 * Triggered when the DOM is initialized or changed. Be careful, consists
 * actually of 2 events, DOM_INIT_EVENT and DOM_CHANGED_EVENT!
 * Make sure you know what you are doing.
 * 
 * Example trigger: See DOM_INIT_EVENT/DOM_CHANGED_EVENT
 * Example listener: FefTooltip
 * 
 * @type {string}
 */
export const DOM_MUTATION_EVENTS = `${DOM_INIT_EVENT} ${DOM_CHANGED_EVENT}`;

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
 * Triggered when a search component should be deactivated.
 * 
 * Example trigger: A2zFilter (CMS)
 * Example listener: SrfSearch
 * 
 * @type {string}
 */
export const SET_SEARCH_INACTIVE_EVENT = 'fef.search.deactivate';

/**
 * Show the sticky sidebar with related articles (only during A-B-Testing
 * period)
 * 
 * Example trigger: A-B-Tasty custom script
 * Example listener: FefStickySidebar
 * 
 * @type {string}
 */
export const SHOW_SIDEBAR_RELATED_ARTICLES_EVENT = 'fef.sidebar.show';

/**
 * Show the sticky bottom bar with related articles (only during A-B-Testing
 * period)
 * 
 * Example trigger: A-B-Tasty custom script
 * Example listener: FefStickyBar
 * 
 * @type {string}
 */
export const SHOW_BOTTOMBAR_RELATED_ARTICLES_EVENT = 'fef.bottombar.show';
