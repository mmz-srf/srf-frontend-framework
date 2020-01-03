import { FefStorage } from '../classes/fef-storage';
import { setFocus } from '../components/fef-a11y';
import { FefTouchDetection } from '../classes/fef-touch-detection';

const STORAGE_KEY = 'srf:rlp:selectable:selected';
const SELECTED_COLLECTION_CLASS = 'js-selected-collection';
const ANIMATION_PART_DURATION = 200;

export function init() {
    $('.js-selectable')
        .filter((_, element) => !$(element).data('selectable-initialized'))
        .each((_, element) => {
            new SrfSelectableCollection(element);

            // mark element, so that it won't be initialized again by this module
            $(element).data('selectable-initialized', true);
        });
}

export class SrfSelectableCollection {

    constructor(element, onCollectionShowCallback = () => {}, interactionMeasureString = '') {
        this.$element = $(element);

        this.collectionTitle = this.$element.data('title');
        this.collectionURN = this.$element.data('urn');
        this.interactionMeasureString = interactionMeasureString;

        this.$animationWrapper = $('.js-selectable-animation-wrapper', this.$element);
        this.$groupButtons = $('.js-group-button', this.$element);
        this.$sourceCollections = $(`.js-collection[data-selectable-urn="${this.collectionURN}"]`);

        // Sources are read from a data attribute on the collection element.
        // A source is a plain old JS object (POJO) that contains URN, Title and Link of the landingpage it represents
        this.sources = this.initialSourceConversion(this.$element.data('groups'));

        // The selected source has to be saved temporarily to enable tracking when going "back" via empty state
        this.selectedSource = null;

        this.onCollectionShowCallback = onCollectionShowCallback;

        this.registerListener();
        this.setInitialState();
        this.removeUselessSourceButtons();
    }

    registerListener() {
        // Going back to the empty state when clicking on the buttons in the source collections
        $('.js-selectable-button', this.$sourceCollections).on('click', (e) => this.showSelectionElement(e));

        // Changing between sources
        this.$groupButtons.on('click', (e) => this.changeSelectedSource( $(e.currentTarget).data('source'), e ));
    }

    /**
     * Read data from localstorage. If there's a selection for this selectable
     * already saved, check if that collection exists and show that collection.
     * In any other case, the selection element will be shown and all
     * collections will be hidden.
     */
    setInitialState() {
        if (FefStorage.isLocalStorageAvailable() && FefStorage.hasItem(STORAGE_KEY)) {
            let savedSelections = FefStorage.getItemJsonParsed(STORAGE_KEY);

            let selectedSourceURN = savedSelections[this.collectionURN];

            if (selectedSourceURN && this.connectsToCollection(selectedSourceURN)) {
                this.$element.hide();
                this.toggleCollections(selectedSourceURN);

                let $collection = $(this.$sourceCollections.toArray().find(c => $(c).data('urn') === selectedSourceURN));

                if ($collection) {
                    $collection.addClass(SELECTED_COLLECTION_CLASS);
                    return;
                }
            }
        }

        // none was selected: hide all collections, show selection element
        this.toggleCollections(false);
        this.$element.show();
    }

    /**
     * Upon changing a new 'Option', the following things happen:
     * - collection representing the selected landingpage is shown, the others hidden
     * - empty state (this.$element) gets hidden
     * - selection is saved in localstorage
     * - tracking
     *
     * @param {string} sourceURN
     * @param {jQuery.event} e
     */
    changeSelectedSource(sourceURN, e) {
        let nextSource = this.sources.find(source => source.urn === sourceURN);

        if (!nextSource) {
            throw new Error(`Source '${ sourceURN }' can't be found in the selectable collection ${ this.collectionURN }.`);
        }

        this.showSourceCollection(sourceURN, e);
        this.saveSelectionInLocalStorage(sourceURN);

        this.track(this.selectedSource, nextSource);
        this.selectedSource = nextSource;
    }

    /**
     * Immediately shows/hides collections, depending on their urn.
     *
     * @param {string} sourceURN URN of a collection that acts as a source
     */
    toggleCollections(sourceURN) {
        this.$sourceCollections.each((_, collection) => {
            let $collection = $(collection),
                willBeShown = $collection.data('urn') === sourceURN;
            $collection.toggle(willBeShown);
        });
    }

    /**
     * Shows the selection element and removes the saved Selection from localstorage.
     *
     * @param {jQuery.event} event Original event that triggered the change
     */
    showSelectionElement(event) {
        let $collection = this.$sourceCollections.filter(`.${SELECTED_COLLECTION_CLASS}`).first(),
            shouldFocus = !FefTouchDetection.eventIsMouseclick(event);

        this.removeSelectionFromLocalstorage();

        if (!$collection) {
            this.$element.show();
            return;
        }

        this.$element.css({'position': 'absolute', 'height': 0}).show();
        let $contentWrapper = $collection.find('.js-collection-content-wrapper');
        let newHeight = this.$animationWrapper.height();
        this.$animationWrapper.css('opacity', 0);

        if (!shouldFocus) {
            $(':focus').blur();
        }

        $contentWrapper.animate({'opacity': 0}, ANIMATION_PART_DURATION, () => {
            $contentWrapper.animate({'height': newHeight}, ANIMATION_PART_DURATION, 'easeInOutSine', () => {
                this.$element.css({'position': '', 'height': ''});
                $collection.hide();
                $contentWrapper.css({'opacity': 1, 'height': ''});

                this.$animationWrapper.animate({'opacity': 1}, ANIMATION_PART_DURATION, () => {
                    $collection.removeClass(SELECTED_COLLECTION_CLASS);

                    if (shouldFocus) {
                        setFocus(this.$groupButtons.first());
                    }
                });
            });
        });
    }

    /**
     * Changes from the selection element to a collection with animation.
     * If the change was triggered by a mouseclick, it'll also focus on the
     * first teaser of the collection after the animations are done.
     *
     * @param {string} nextSource URN of the collection to show
     * @param {jQuery.event} event
     */
    showSourceCollection(nextSource, event) {
        let $collection = $(this.$sourceCollections.toArray().find(c => $(c).data('urn') === nextSource)),
            shouldFocus = !FefTouchDetection.eventIsMouseclick(event);

        if (!$collection) {
            this.$element.show();
            return;
        }

        let $swipeableArea = $collection.find('.js-swipeable-area');
        this.$sourceCollections.each((_, coll) => $(coll).removeClass(SELECTED_COLLECTION_CLASS));
        $collection.css({'display': 'block', 'position': 'absolute', 'height': 0});
        let $contentWrapper = $collection.find('.js-collection-content-wrapper');
        let newHeight = $contentWrapper.height();
        $contentWrapper.css('opacity', 0);

        if (shouldFocus) {
            $(':focus').blur();
        }

        this.$animationWrapper.animate({'opacity': 0}, ANIMATION_PART_DURATION, () => {
            this.$animationWrapper.animate({'height': newHeight}, ANIMATION_PART_DURATION, 'easeInOutSine', () => {
                $collection.css({'position': '', 'height': ''});
                this.$element.hide();
                this.$animationWrapper.css({'height': '', 'opacity': 1});

                $contentWrapper.animate({'opacity': 1}, ANIMATION_PART_DURATION, () => {
                    $collection.addClass(SELECTED_COLLECTION_CLASS);
                    this.onCollectionShowCallback($collection);

                    if (shouldFocus) {
                        setFocus($collection.find('.teaser__main').first());
                    }

                    // reinitialize swipeable area for chosen collection
                    $swipeableArea.trigger('srf.swipeableArea.reinitialize');
                });
            });
        });
    }

    /**
     * A JSON object with the following structure will be saved in localstorage:
     *   {
     *     "srf:urn:collection:1": "srf:urn:landingpage:1000",
     *     "srf:urn:collection:2": "srf:urn:landingpage:1001",
     *     ...
     *   }
     * where the URNs of the selectable collections are used as the keys and the URNs of the selected sources
     * (= landingpages) as the values. This makes it possible to have the same landingpage used in multiple selectable
     * collections.
     *
     * @param sourceUrn
     */
    saveSelectionInLocalStorage(sourceUrn) {
        if (FefStorage.isLocalStorageAvailable()) {
            let savedSelections = FefStorage.getItemJsonParsed(STORAGE_KEY);

            if (!savedSelections) {
                savedSelections = {};
            }

            // override the previously saved sourceURN for this collection (or set it if it didn't exist before)
            savedSelections[this.collectionURN] = sourceUrn;

            FefStorage.setItem(STORAGE_KEY, JSON.stringify(savedSelections));
        }
    }

    /**
     * Removes a selection from localstorate. It replaces the previously saved
     * object with a new object from which it deleted the key that is this
     * collection's URN. If nothing was saved, nothing will be deleted. If no
     * selection was saved for this collection, `delete` will not throw an error.
     */
    removeSelectionFromLocalstorage() {
        if (FefStorage.isLocalStorageAvailable()) {
            let savedSelections = FefStorage.getItemJsonParsed(STORAGE_KEY);

            if (!savedSelections) {
                savedSelections = {};
            }

            delete savedSelections[this.collectionURN];

            FefStorage.setItem(STORAGE_KEY, JSON.stringify(savedSelections));
        }
    }

    /**
     * It can happen that a landingpage returns no teasers. In that case we
     * remove the button so that the user can't chose a selection that is empty.
     */
    removeUselessSourceButtons() {
        this.$groupButtons.each((_, button) => {
            if (!this.connectsToCollection($(button).data('source'))) {
                $(button).remove();
            }
        });
    }

    /**
     * Check if a collection with the specified urn exists and has at least 1 teaser.
     *
     * @param {string} sourceUrn URN of landingpage
     * @returns {boolean}
     */
    connectsToCollection(sourceUrn) {
        let collection = this.$sourceCollections.toArray().find(collection => $(collection).data('urn') === sourceUrn);
        return collection && $(collection).find('.js-teaser').length > 0;
    }

    /**
     * Twig's rendering of a PHP array is { 0: {objectA}, 1: {objectB} } where we want [ {objectA}, {objectB} ]
     * If rendered correctly (as an array), return it unmodified.
     *
     * @param rawData
     * @return {Array}
     */
    initialSourceConversion(rawData) {
        if (Array.isArray(rawData)) {
            return rawData;
        }
        return Object.keys(rawData).map(key => rawData[key]);
    }

    /**
     * Trigger a window event so the tracking component will send the supplied data.
     *
     * event_name contains the title of the currently selected landingpage source,
     * event_value contains the title of the landingpage source the collection will change to
     *
     * When this is the first time the source LP is changed, event_name contains DEFAULT
     *
     * @param currentSourceData
     * @param nextSourceData
     */
    track(currentSourceData, nextSourceData) {
        let currentTitle = 'DEFAULT';

        if (currentSourceData) {
            currentTitle = currentSourceData.title;
        }

        $(window).trigger(this.interactionMeasureString, {
            event_source: 'user_setting_changed',
            event_name: `collection_${this.collectionTitle}(${ currentTitle })`,
            event_value: `collection_${this.collectionTitle}(${ nextSourceData.title })`
        });
    }
}
