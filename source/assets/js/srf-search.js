
export function init() {
    $(".searchbox").each((i, elem) => {
        new SrfSearch(elem);
    });
}

const DEFAULT_MAX_SUGGESTIONS = 7;
const DEFAULT_MIN_SEARCH_LENGTH = 2;
const KEYCODES = {
    "enter": 13,
    "tab": 9,
    "escape": 27,
    "down": 40,
    "up": 38
};

export class SrfSearch {

    constructor(element, options) {

        this.$element = $(element);
        this.$inputField = this.$element.find(".searchbox__input");
        this.$submitButton = this.$element.find("button");
        this.$searchResults = this.$element.find(".searchbox__results");
        this.$closeIcon = this.$element.find('.close-search');

        this.options = $.extend({}, {
                maxSuggestionCount: DEFAULT_MAX_SUGGESTIONS,
                minSearchLength: DEFAULT_MIN_SEARCH_LENGTH
            }, options);

        this.expandable = typeof this.options.expandable !== "undefined" ? this.options.expandable : this.$element.hasClass("searchbox--expandable");
        this.typeaheadUrl = this.$inputField.data("typeahead-url");
        this.typeaheadData = null;
        this.suggestionUrl = '';
        this.currTimeout = null;

        // search field is hidden before document.ready (events firing before document.ready can get lost)
        this.$inputField.show();
        this.registerListeners();
    }

    registerListeners() {
        this.$inputField.on("focus", (e) => {
            this.initTypeahead();
            this.disableArticle();
            this.expandSearch();
        });

        this.$closeIcon.on('click', (e) => {
            this.reset();
        });

        this.$inputField.on("keyup", (e) => {
            this.onKeyUp(e);
        });

        this.$inputField.on("keydown", (e) => {
            this.onKeyDown(e);
        });


        this.$inputField.on("blur", (e) => {
            this.enableArticle(); // in case of a click always leave.

            this.currTimeout = setTimeout(() => {
                this.hideMenu();
                this.unexpandSearch();
            }, 150);
        });

        this.$inputField.on("click", (e) => {
            e.stopPropagation();
        });

        this.$closeIcon.on("click", e => {
            e.preventDefault();
        });

        this.$searchResults.on('click', (e) => {
            e.stopPropagation();
            // do not prevent default to allow menu links be clicked.
            if (this.currTimeout !== null) {
                if (this.currTimeout) {
                    clearTimeout(this.currTimeout);
                }
                this.currTimeout = setTimeout(() => {
                    this.hideMenu();
                }, 500); // defer menu hiding to allow some time to show active state before closing.
            }
        });
    }

    onKeyUp(e) {
        switch (e.keyCode) {
            case KEYCODES.down:
            case KEYCODES.up:
                break;
            case KEYCODES.tab:
                this.hideMenu();
                break;
            case KEYCODES.escape: // escape must leave the search and clear input
                this.clearInput();
                this.$inputField.blur();
                break;
            default:
                this.lookup();
        }
    }

    onKeyDown(e) {
        // if no suggestion is selected fall back to default browser behavior for form submission
        if (e.keyCode === KEYCODES.enter) {
            if (this.suggestionUrl !== '') {
                e.stopPropagation();
                e.preventDefault();
                location.href = this.suggestionUrl;
            } else {
                this.$searchResults.hide(); // do not "show" it on voiceOver
                e.stopPropagation();
                e.preventDefault();
                this.$element.submit();
            }
        } else if (e.keyCode === KEYCODES.down || e.keyCode === KEYCODES.up) {
            let direction = e.keyCode === KEYCODES.down? 'down' : 'up';
            this.moveInMenu(direction);
        }
    }

    hideMenu() {
        this.$inputField.removeClass('search--has-results' );
        this.$searchResults.addClass('h-element--hide');
        this.suggestionUrl = '';
    }

    clearInput() {
        this.$inputField.val("");
        this.$submitButton.attr("tabindex", -1).attr("aria-hidden", true);
        this.hideCloseIcon();
        this.suggestionUrl = '';
    }

    reset() {
        this.clearInput();
        this.hideMenu();
        this.unexpandSearch();
    }

    moveInMenu(direction) {
        if (direction === 'down') {
            this.nextSuggestion();
        } else if (direction === 'up') {
            this.prevSuggestion();
        }
    }

    prevSuggestion() {
        let $active = this.$searchResults.find('.active').removeClass('active');
        let $prev = $active.prev();
        if ($prev.length === 0) {
            $prev = this.$searchResults.find('li').last();
        }
        this.suggestionUrl = $prev.find("a").attr('href');
        $prev.addClass('active');
    }

    nextSuggestion() {
        let $active = this.$searchResults.find('.active').removeClass('active');
        let $next = $active.next();
        if ($next.length === 0) {
            $next = $(this.$searchResults.find('li').first());
        }
        this.suggestionUrl = $next.find("a").attr('href');
        $next.addClass('active');
    }

    initTypeahead() {
        if (this.typeaheadData === null) {
            $.getJSON(this.typeaheadUrl, (data) => {
                this.typeaheadData = data;
            });
        }
        this.showCloseIconIfNeeded();
        this.expandSearch();

    }

    lookup() {
        // adjust close icon state regardless of search results
        this.showCloseIconIfNeeded();
        let results = [];
        let query = this.$inputField.val().toString().toLowerCase();

        if (this.typeaheadData === null) {
            return true;
        }

        if(query.length < this.options.minSearchLength) {
            this.hideMenu();
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
            this.$inputField.addClass('search--has-results');
        } else {
            this.hideMenu();
        }
    }

    renderResults(results, query) {
        let html = '';

        results.forEach((result) => {
            let name = this.highlightQuery(query, result.name);
            html += `<li role="option" class="typeahead-suggestion" tabindex="-1" aria-hidden="true"><a href="${result.url}">${name}</a></li>`;
        });
        this.$searchResults.css('width', this.$inputField.outerWidth() + "px");
        this.$searchResults.html(html).removeClass('h-element--hide');
    }

    highlightQuery(query, name) {
        query = query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
        return name.replace(new RegExp('(' + query + ')', 'ig'), ($1, match) => `<strong>${match}</strong>`);
    }

    showCloseIcon() {
        this.$closeIcon.removeClass('h-element--hide');
        let y = this.$inputField.position().top;
        let x = this.$inputField.position().left;

        x = x + this.$inputField.outerWidth() - this.$closeIcon.outerWidth();
        this.$closeIcon.css({'top': y, 'left': x});
        if ($(window).width() > 720) {
            this.$closeIcon.attr("tabindex", -1).attr("aria-hidden", true);
        }

    }

    hideCloseIcon() {
        this.$closeIcon.addClass('h-element--hide');
        if ($(window).width() > 720) {
            this.$closeIcon.attr("tabindex", "").attr("aria-hidden", false);
        }
    }

    showCloseIconIfNeeded(deferred) {
        if (!deferred) {
            if (this.$inputField.val() === '') {
                this.hideCloseIcon();
            } else {
                this.showCloseIcon();
            }
        } else {
            if (this.currTimeout) {
                clearTimeout(this.currTimeout);
            }
            this.currTimeout = setTimeout(() => {this.showCloseIconIfNeeded()}, deferred);
        }
    }

    expandSearch() {
        if (!this.expandable) { return; }

        this.$element.css('width', '100%');
        this.hideCloseIcon();
        this.showCloseIconIfNeeded(500); // currTimeout gets set here
    }

    unexpandSearch() {
        if (!this.expandable) { return; }

        this.$element.css('width', '');
        this.hideCloseIcon();
    }

    disableArticle() {
        if (!this.expandable) { return; }

        if (!$('body').hasClass('body--fixed')) {
            $('body').addClass('search--overlay');
        }
    }

    enableArticle() {
        if (!this.expandable) {
            return;
        }
        $('body').removeClass('search--overlay');
    }
}
