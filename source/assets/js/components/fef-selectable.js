import {FefStorage} from '../classes/fef-storage';

const STORAGE_KEY = 'srf:rlp:selectable:selected';
const ANIMATION_PART_DURATION = 200;

export function init() {
    $('.js-selectable').each((i, elem) => {
        new SrfSelectableCollection(elem);
    });
}

export class SrfSelectableCollection {

    constructor(element) {
        this.$element = $(element);
        this.$brandingWrapper = $('.js-selectable-branding-wrapper', this.$element);
        this.collectionTitle = this.$element.data('title');
        this.collectionURN = this.$element.data('urn');

        this.$groupButtons = $('.js-group-button', this.$element);

        this.$sourceCollections = $(`.js-collection[data-selectable-urn="${this.collectionURN}"]`);

        // Sources are read from a data attribute on the collection element.
        // A source is a plain old JS object (POJO) that contains URN, Title and Link of the landingpage it represents
        this.sources = this.initialSourceConversion(this.$element.data('groups'));

        // The selected source has to be saved temporarily to enable tracking when going "back" via empty state
        this.selectedSource = null;

        this.registerListener();
        this.setInitialState();
        this.removeEmptySourceButtons();
    }

    registerListener() {
        // Going back to the empty state when clicking on the buttons in the source collections
        $('.js-selectable-button', this.$sourceCollections).on('click', () => this.showSelectionElement());

        // Changing between sources
        this.$groupButtons.on('click', (e) => this.changeSelectedSource( $(e.currentTarget).data('source') ));
    }

    setInitialState() {
        if (FefStorage.isLocalStorageAvailable() && FefStorage.hasItem(STORAGE_KEY)) {
            let savedSelections = FefStorage.getItemJsonParsed(STORAGE_KEY);

            let selectedSourceURN = savedSelections[this.collectionURN];

            if (selectedSourceURN && this.connectsToCollection(selectedSourceURN)) {
                this.$element.hide();
                this.toggleCollections(selectedSourceURN);
                return;
            }
        }

        this.showSelectionElement(false);
    }

    /**
     * Upon changing a new 'Option', the following things happen:
     * - collection representing the selected landingpage is shown, the others hidden
     * - empty state (this.$element) gets hidden
     * - selection is saved in localstorage
     * - tracking
     *
     * @param {string} sourceURN
     */
    changeSelectedSource(sourceURN) {
        let nextSource = this.sources.find(source => source.urn === sourceURN);

        if (!nextSource) {
            throw new Error(`Source '${ sourceURN }' can't be found in the selectable collection ${ this.collectionURN }.`);
        }

        this.showSource(sourceURN);

        this.saveSelection(sourceURN);

        this.track(this.selectedSource, nextSource);

        this.selectedSource = nextSource;
    }

    toggleCollections(sourceURN) {
        this.$sourceCollections.each((_, collection) => {
            let $collection = $(collection),
                willBeShown = $collection.data('urn') === sourceURN;
            $collection.toggle(willBeShown);
        });
    }

    showSelectionElement(setFocus = true) {
        this.$element.show();
        this.toggleCollections(false);
        //this.animateStateChange(() => {});
    }

    showSource(nextSource) {
        this.$element.hide();
        this.toggleCollections(nextSource);
        //this.animateStateChange(() => {});
    }

    /**
     * Animates a state change, i.e. from "empty" to "default" state or back.
     *
     * @param changeContentFn function Function to be executed when the animation is halfway done.
     * @param getElementToFocusOnFn function Function to be executed to get the element to focus on after the animation
     */
    animateStateChange(changeContentFn, getElementToFocusOnFn = false) {
        // Animation:
        // 1. Remove focus (otherwise the flying focus will stay visible)
        // 2. Fade out content
        // 3. set height of collection so it doesn't jump around during next step
        // 4. show/hide/change content, teasers, etc.
        // 5. animate collection's height to the content-wrapper's height
        // 6. fade in content
        // 7. remove fixed height
        // 8. focus on the specified element if desired (=getElementToFocusOnFn is set)

        $(':focus').blur(); // 1

        this.$contentWrapper
            .animate({'opacity': 0}, ANIMATION_PART_DURATION, () => { // 2
                this.$element.height(this.$element.outerHeight()); // 3

                changeContentFn(); // 4

                this.$element.animate({'height': this.$brandingWrapper.outerHeight(true)}, ANIMATION_PART_DURATION, () => { // 5
                    this.$contentWrapper.animate({'opacity': 1}, ANIMATION_PART_DURATION, () => { // 6
                        this.$element.height(''); // 7
                        // TODO: focus on first teaser or first sourceBtn
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
    saveSelection(sourceUrn) {
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
     * It can happen that a landingpage returns no teasers. In that case we
     * remove the button so that the user can't chose a selection that is empty.
     */
    removeEmptySourceButtons() {
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

        // TODO: use const from CMS instead of string
        $(window).trigger('fef.track.interaction', {
            event_source: 'user_setting_changed',
            event_name: `collection_${this.collectionTitle}(${ currentTitle })`,
            event_value: `collection_${this.collectionTitle}(${ nextSourceData.title })`
        });
    }

    /**
     * Simply using .focus() doesn't suffice.
     *
     * @param $element jQuery.Element
     */
    setFocus($element) {
        $element.attr('tabindex', -1).on('blur focusout', () => {
            $element.removeAttr('tabindex');
        }).focus();
    }
}
