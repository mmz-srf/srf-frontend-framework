export class SrfSearch {

    constructor($inputField, $submitButton, $menu, options = {maxSuggestionCount: 6}) {
        this.$inputField = $inputField;
        // inputField and submitButton are distinct html elements for accessibility
        this.$submitButton = $submitButton;
        this.$menu = $menu;
        // dont show more than x suggestions
        this.options = options;

        this.typeaheadUrl = this.$inputField.data("typeahead-url");
        this.typeaheadData = null;

        this.isShown = false;

        this.registerListeners();


    }


    registerListeners() {

        this.$inputField.on("focus", (e) => {
            this.initTypeahead();
        });

        this.$inputField.on("keyup", (e) => {
            e.stopPropagation()
            e.preventDefault()

            this.enhanceAccessibility();
            this.onKeyUp(e);
            //  this.lookup(this.$inputField.val());
        });

        this.$inputField.on("blur", (e) => {
            setTimeout(() => {
                this.hideMenu()
            }, 150);
        });

        /*
         this.$inputField.on("keypress", (e) => {
         this.onKeypress();
         });
         */


        this.$inputField.on("keypress", (e) => {
            this.onKeyUp(e);
        });

        /*
         needed????
         if ($.browser.chrome || $.browser.webkit || $.browser.msie) {
         this.$inputField.on("keydown", (e) => {
         this.onKeyDown();
         });
         }
         */

        this.$menu.on("click", (e) => {
            e.stopPropagation()
            e.preventDefault()
            this.selectOption();
        });

        this.$menu.on("mouseenter", (e) => {
            this.onMenuMouseenter(e);
        });

        this.$menu.on("touchstart", (e) => {
            this.onMenuMouseenter();
        });

    }

    onKeyUp(e) {
        switch (e.keyCode) {
            case 40: // down arrow
            case 38: // up arrow
                break;

            case 9: // tab
            case 13: // enter
                if (!this.isShown) return;
                this.selectOption();
                break;

            case 27: // escape
                if (!this.isShown) return;
                this.hideMenu();
                break;

            default:
                this.lookup();
        }
    }

    onMenuMouseenter(e) {
        this.$menu.find('.active').removeClass('active');
        $(e.currentTarget).addClass('active');
    }

    selectOption() {
        console.log("option selected: execute sendungs-url or go to search page");
        // get selected option
        // location.href = url;
    }

    hideMenu() {
        this.$menu.hide()
        this.isShown = false
    }

    moveInMenu(e) {
        if (!this.isShown) return;

        switch (e.keyCode) {
            case 9: // tab
            case 13: // enter
            case 27: // escape
                e.preventDefault();
                break;

            case 38: // up arrow
                e.preventDefault();
                this.prevOption();
                break

            case 40: // down arrow
                e.preventDefault();
                this.nextOption();
                break
        }

        e.stopPropagation()
    }

    prevOption() {
        let $active = this.$menu.find('.active').removeClass('active');
        let $prev = $active.prev()

        if ($prev.length > 0) {
            $prev = this.$menu.find('li').last();
        }
        $prev.addClass('active')
    }

    nextOption() {
        let $active = this.$menu.find('.active').removeClass('active');
        let $next = $active.next()

        if ($next.length > 0) {
            $next = $(this.$menu.find('li')[0])
        }
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

    clearInput() {
        this.$inputField.val("");
        this.$submitButton.attr("tabindex", -1).attr("aria-hidden", true);
    }

    initTypeahead() {

        if (this.typeaheadData === null) {
            $.getJSON(this.typeaheadUrl, (data) => {
                this.typeaheadData = data;
            })
        }
    }

    lookup(query) {
        let results = [];
        query = this.$inputField.val().toString().toLowerCase();

        this.typeaheadData.forEach((item) => {
            let matchIndex = item.name.toString().toLowerCase().indexOf(query);
            if (matchIndex >= 0) {
                results.push({name: item.name, url: item.url, matchIndex: matchIndex});
            }
        })
        results = results.slice(0, this.options.maxSuggestionCount);
        this.renderResults(results, query);

    }

    renderResults(results, query) {
        let html = '';
        results.forEach((result) => {
            let name = this.highlightQuery(query, result.name);
            html += `<li data-url="${result.url}">${name}</li>`;
        })
        this.$menu.html(html).show();
        console.log(results);
    }

    highlightQuery(query, name) {
        query = query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
        return name.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
            return '<strong>' + match + '</strong>'
        })
    }
}



