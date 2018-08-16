import {setFocus} from '../srf-flying-focus';

export function init() {
    $('.js-search').each((i, elem) => {
        new SrfSearch(elem);
    });
}

const DEFAULT_MAX_SUGGESTIONS = 7;
const DEFAULT_MIN_SEARCH_LENGTH = 2;
const KEYCODES = {
    'enter': 13,
    'tab': 9,
    'escape': 27,
    'up': 38,
    'down': 40
};
const ACTIVE_CLASS = 'search--active';
const OUTSIDE_CLICK_LISTENER_NAME = 'click.search-destroyer';

export class SrfSearch {

    constructor(element, options) {

        this.$element = $(element);
        this.$inputField = this.$element.find('.js-search-input');
        this.$searchResults = this.$element.find('.js-search-results');
        this.$closeIcon = this.$element.find('.js-search-close');

        this.options = $.extend({}, {
            maxSuggestionCount: DEFAULT_MAX_SUGGESTIONS,
            minSearchLength: DEFAULT_MIN_SEARCH_LENGTH
        }, options);

        this.typeaheadUrl = this.$element.attr('data-typeahead-url');
        this.typeaheadData = null;
        this.suggestionUrl = '';
        this.currTimeout = null;

        // search field is hidden before document.ready (events firing before document.ready can get lost)
        this.$inputField.show();
        this.registerListeners();
    }

    registerListeners() {
        // e.g. in the search modal, the whole element will be focused -> set focus to inputfield
        this.$element.on('focus', (e) => {
            setTimeout(() => {
                this.$inputField.focus();
            }, 0);
        });

        this.$inputField.on('focus', (e) => {
            this.setSearchActive();
        }).on('keyup', (e) => {
            this.onKeyUp(e);
        }).on('keydown', (e) => {
            this.onKeyDown(e);
        }).on('click', (e) => {
            e.stopPropagation();
        });

        this.$closeIcon.on('click', (e) => {
            this.setSearchInactive();
        }).on('keydown', (e) => {
            this.onCloseIconKeyDown(e);
        }).on('click', e => {
            e.preventDefault();
            this.setSearchInactive();
        });

        this.$searchResults.on('keydown', (e) => {
            this.onResultsKeyDown(e);
        });
    }

    onKeyUp(e) {
        switch (e.keyCode) {
            case KEYCODES.tab:
                break;
            case KEYCODES.escape:
                this.clearInput();
                this.$inputField.blur();
                this.setSearchInactive();
                break;
            default:
                let query = this.$inputField.val().toString().toLowerCase();
                this.lookup(query);
        }
    }

    onKeyDown(e) {
        switch (e.keyCode) {
            case KEYCODES.tab:
                if (e.shiftKey) {
                    // Shift-Tabbing out of the search component
                    this.setSearchInactive();
                }
                break;
            case KEYCODES.up:
                this.moveUpInMenu();
                e.preventDefault();
                break;
            case KEYCODES.down:
                this.moveDownInMenu();
                e.preventDefault();
                break;
            default:
                break;
        }
    }

    onCloseIconKeyDown(e) {
        switch (e.keyCode) {
            case KEYCODES.escape:
                this.setSearchInactive();
                break;
            case KEYCODES.tab:
                if (this.$searchResults.children().length === 0) {
                    this.setSearchInactive();
                }
                break;
            default:
                break;
        }
    }

    onResultsKeyDown(e) {
        switch (e.keyCode) {
            case KEYCODES.escape:
                this.setSearchInactive();
                break;
            case KEYCODES.tab:
                // tabbing away from the last result
                if ($(e.target).parents('li').is(':last-child') && !e.shiftKey) {
                    this.setSearchInactive();
                }
                break;
            case KEYCODES.up:
                this.moveUpInMenu();
                e.preventDefault();
                break;
            case KEYCODES.down:
                this.moveDownInMenu();
                e.preventDefault();
                break;
            default:
                break;
        }
    }

    setSearchActive() {
        if (this.$element.hasClass(ACTIVE_CLASS)) {
            return false;
        }

        this.$element.addClass(ACTIVE_CLASS);
        // Listen to clicks outside of the element --> deactivates this search component
        $(document).on(OUTSIDE_CLICK_LISTENER_NAME, (e) => {
            // Disable this search if the click was not a descendant of any .js-search or if it's a descendant of a different search component.
            if (!$(e.target).parents('.js-search').length && $(e.target).parents('.js-search') !== this.$element) {
                this.setSearchInactive();
            }
        });

        if (this.typeaheadData === null) {
            $.getJSON(this.typeaheadUrl, (data) => {
                this.typeaheadData = data;
            });
        }

        this.$closeIcon.show();
    }

    setSearchInactive() {
        this.clearInput();
        this.hideResults();
        this.$element.removeClass(ACTIVE_CLASS);
        $(document).off(OUTSIDE_CLICK_LISTENER_NAME);
    }

    moveUpInMenu() {
        let $suggestions = this.$searchResults.find('.search-result__link'),
            $currentlyFocused = $('.search-result__link:focus'),
            currentIndex = $suggestions.index($currentlyFocused),
            nextIndex = currentIndex - 1;

        if ($suggestions.length === 0) {
            return;
        }

        if (nextIndex < 0) {
            nextIndex = $suggestions.length - 1;
        }

        setFocus($suggestions.eq(nextIndex));
    }

    moveDownInMenu() {
        let $suggestions = this.$searchResults.find('.search-result__link'),
            $currentlyFocused = $('.search-result__link:focus'),
            currentIndex = $suggestions.index($currentlyFocused),
            nextIndex = currentIndex + 1;

        if ($suggestions.length === 0) {
            return;
        }

        if (nextIndex >= $suggestions.length) {
            nextIndex = 0;
        }

        setFocus($suggestions.eq(nextIndex));
    }

    hideResults() {
        this.$inputField.attr('aria-expanded', false);
        this.$searchResults.hide().html('').removeClass('search__results--showed-results');
        this.suggestionUrl = '';
    }

    clearInput() {
        this.$inputField.val('');
        this.$closeIcon.hide();
        this.suggestionUrl = '';
    }

    lookup(query) {
        let results = [];

        if (this.typeaheadData === null) {
            return true;
        }

        if (query.length < this.options.minSearchLength) {
            this.hideResults();
            return true;
        }

        this.typeaheadData.forEach((item) => {
            let matchIndex = item.name.toString().toLowerCase().indexOf(query);
            if (matchIndex >= 0) {
                results.push({
                    name: item.name,
                    url: item.url,
                    matchIndex: matchIndex
                });
            }
        });

        if (results.length > 0) {
            results = results.slice(0, this.options.maxSuggestionCount);
            this.renderResults(results, query);
        } else {
            this.hideResults();
        }
    }

    /**
     * Renders the received search results into the results list.
     * For the Screen-Reader's sake it'll be rendered twice, once with the found substring highlighted and once readable.
     * 
     * If we're replacing previously shown search results, make sure they're not animated anymore.
     *
     * @param {Object} results 
     * @param {String} query 
     */
    renderResults(results, query) {
        let html = '';

        let wasAlreadyShowingResults = this.$searchResults.children('li').length > 0;

        results.forEach((result) => {
            let highlightedResult = this.highlightQuery(query, result.name);
            html += `
                <li class="typeahead-suggestion ${wasAlreadyShowingResults ? 'typeahead-suggestion--no-animation' : ''}">
                    <a class="search-result__link" href="${result.url}">
                        <span role="presentation" aria-hidden="true">${highlightedResult}</span>
                        <span class="h-offscreen">${result.name}</span>
                    </a>
                </li>`;
        });

        this.$inputField.attr('aria-expanded', true);
        this.$searchResults.html(html).show();
    }

    /**
     * Replaces the query string in a search result with the same string in bold  e.g.
     * "Tag" in "Tagesschau" after searching for "Tag"
     *
     * @param {String} query
     * @param {String} name
     * @returns {String}
     */
    highlightQuery(query, name) {
        query = query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
        return name.replace(new RegExp('(' + query + ')', 'ig'), ($1, match) => `<strong>${match}</strong>`);
    }
}
