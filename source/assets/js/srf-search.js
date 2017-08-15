export class SrfSearch {

    constructor($inputField, $submitButton, $menu, options = {maxSuggestionCount: 7, minSearchLength: 2}) {
        this.$inputField = $inputField;
        // inputField and submitButton are distinct html elements for accessibility
        this.$submitButton = $submitButton;
        this.$menu = $menu;
        this.$closeIcon = $menu.parent().find('.close-search');
        this.options = options;

        this.typeaheadUrl = this.$inputField.data("typeahead-url");
        this.typeaheadData = null;
        this.suggestionUrl = '';

        // search field is hidden before document.ready (events firing before document.ready can get lost)
        this.$inputField.show();
        this.registerListeners();
    }

    registerListeners() {
        this.$inputField.on("focus", (e) => {
            this.initTypeahead();
        });

        this.$inputField.on("keyup", (e) => {
            this.enhanceAccessibility();
            this.onKeyUp(e);
        });

        this.$inputField.on("keydown", (e) => {
            this.onKeyDown(e);
        });

        this.$inputField.on("blur", (e) => {
            setTimeout(() => {
                this.hideMenu()
            }, 150);
        });

    }

    onKeyUp(e) {
        switch (e.keyCode) {
            case 40: // down arrow
            case 38: // up arrow
                break;
            case 9: // tab
                this.hideMenu();
                break;

            case 27: // escape
                this.hideMenu();
                break;

            default:
                this.lookup();
        }
    }

    onKeyDown(e) {
        // if no suggestion is selected fall back to default browser behavior for form submission
        if (e.keyCode === 13) {
            if (this.suggestionUrl != '') {
                e.stopPropagation();
                e.preventDefault();
                location.href = this.suggestionUrl;
            }
        }
        if (e.keyCode === 40 || e.keyCode === 38) {
            let direction = e.keyCode === 40 ? 'down' : 'up';
            this.moveInMenu(direction);
        }
    }

    hideMenu() {
        this.$menu.addClass('h-element--hide');
        this.suggestionUrl = '';
        this.hideCloseIcon();
    }

    clearInput() {
        this.$inputField.val("");
        this.$submitButton.attr("tabindex", -1).attr("aria-hidden", true);
        this.suggestionUrl = '';
    }

    moveInMenu(direction) {
        if (direction === 'down') {
            this.nextSuggestion();
        }
        else if (direction === 'up') {
            this.prevSuggestion();
        }
    }

    prevSuggestion() {
        let $active = this.$menu.find('.active').removeClass('active');
        let $prev = $active.prev();
        if ($prev.length === 0) {
            $prev = this.$menu.find('li').last();
        }
        this.suggestionUrl = $prev.find("a").attr('href');
        $prev.addClass('active');
    }

    nextSuggestion() {
        let $active = this.$menu.find('.active').removeClass('active');
        let $next = $active.next();
        if ($next.length === 0) {
            $next = $(this.$menu.find('li').first());
        }
        this.suggestionUrl = $next.find("a").attr('href');
        $next.addClass('active');
    }

    enhanceAccessibility() {
        // a search button only makes sense on desktop - when it's actually working
        if (!(('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0))) {
            // this works mobile as well unlike <enter>-keys an d the likes
            if (this.$inputField.val().length > 2 && this.$submitButton.attr("tabindex") == -1) {
                this.$submitButton.attr("tabindex", 0).attr("aria-hidden", false);
            } else if (this.$inputField.val().length == 0 && this.$submitButton.attr("tabindex") == 0) {
                this.$submitButton.attr("tabindex", -1).attr("aria-hidden", true);
            }
        }
    }

    initTypeahead() {
        if (this.typeaheadData === null) {
            $.getJSON(this.typeaheadUrl, (data) => {
                this.typeaheadData = data;
            })
        }
        /* adjust with of ul to current with of search fiekd */
        // this.$menu.width(this.$inputField.width());
    }

    lookup() {
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
                results.push({name: item.name, url: item.url, matchIndex: matchIndex});
            }
        });
        if (results.length > 0) {
            results = results.slice(0, this.options.maxSuggestionCount);
            this.renderResults(results, query);
            this.showCloseIcon();
        }
        else {
            this.hideMenu();
        }
    }

    renderResults(results, query) {
        let html = '';

        results.forEach((result) => {
            let name = this.highlightQuery(query, result.name);
            html += `<li role="option" class="typeahead-suggestion" tabindex="-1"> <a href="${result.url}">${name}</a> </li>`;
        })

        this.$menu.html(html).removeClass('h-element--hide');

    }

    highlightQuery(query, name) {
        query = query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
        return name.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
            return '<strong>' + match + '</strong>'
        })
    }

    showCloseIcon() {
        let y = this.$inputField.position().top;
        let x = this.$inputField.outerWidth();
        // for some reason jquery width is off by approx. 10 pixels, correct it.
        this.$closeIcon.css({'top': y, 'left': x });
        this.$closeIcon.removeClass('h-element--hide');
    }

    hideCloseIcon() {
        this.$closeIcon.addClass('h-element--hide');
    }
}



