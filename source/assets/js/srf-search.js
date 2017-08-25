export class SrfSearch {

    constructor($inputField, $submitButton, $menu, options = {maxSuggestionCount: 7, minSearchLength: 2}) {
        this.$inputField = $inputField;
        // inputField and submitButton are distinct html elements for accessibility
        this.$submitButton = $submitButton;
        this.$menu = $menu;
        this.$closeIcon = $menu.parent().find('.close-search');
        this.options = options;

        this.expandable = (options && options.expandable) ? options.expandable : false;
        console.log(this.expandable);
        this.typeaheadUrl = this.$inputField.data("typeahead-url");
        this.typeaheadData = null;
        this.suggestionUrl = '';
        this.currTimeout = null;
        this.initialWidth = 0;
        this.resizeTimout = 0;


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
        })

        this.$inputField.on("keyup", (e) => {
            this.enhanceAccessibility();
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

        $(window).on('resize', (e) => {
            if ($(window).width() < 720) {
                $('.searchbox').css('width', "");
            }

            this.$inputField.blur();
        });


        this.$menu.on('click', (e) => {
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
            case 40: // down arrow or
            case 38: // up arrow
                break;
            case 9: // tab or
                this.hideMenu();
                break;
            case 27: // escape must unexpand the menu but not clear it
                this.clearInput();
                this.$inputField.blur();
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
        this.$inputField.removeClass('search--has-results' );
        this.$menu.addClass('h-element--hide');
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
        // a search button only makes sense on desktop - when it's actually workin.
        // TODO: What is still needed here?
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
            this.initialWidth = parseInt($('.searchbox:first').css('width'));
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
                results.push({name: item.name, url: item.url, matchIndex: matchIndex});
            }
        });

        if (results.length > 0) {
            results = results.slice(0, this.options.maxSuggestionCount);
            this.renderResults(results, query);
            this.$inputField.addClass('search--has-results' );
        } else {
            this.hideMenu();
        }
    }

    renderResults(results, query) {
        let html = '';

        results.forEach((result) => {
            let name = this.highlightQuery(query, result.name);
            html += `<li role="option" class="typeahead-suggestion" tabindex="-1"> <a href="${result.url}">${name}</a> </li>`;
        })
        this.$menu.css('width', this.$inputField.outerWidth() + "px");
        this.$menu.html(html).removeClass('h-element--hide');
    }

    highlightQuery(query, name) {
        query = query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
        return name.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
            return '<strong>' + match + '</strong>'
        })
    }

    showCloseIcon() {
        this.$closeIcon.removeClass('h-element--hide');
        let y = this.$inputField.position().top;
        let x = this.$inputField.position().left;
        x = x + this.$inputField.outerWidth() - this.$closeIcon.outerWidth();
        console.log(x, y);
        this.$closeIcon.css({'top': y, 'left': x + (this.expandable ? 0 : 440) });
    }

    hideCloseIcon() {
        this.$closeIcon.addClass('h-element--hide');
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
        if ($(window).width() < 720) {
            $('.searchbox').css('width', "");
            return;
        }

        if (!this.expandable) {
            console.log("returning");
            return;
        }
        this.hideCloseIcon();
        this.showCloseIconIfNeeded(500); // currTimeout gets set here
        $('.searchbox').addClass('centered'); // add margin: 50% and animations and calculate the new width (90% of container, adjusted by width).

        // calculate new width (bar must be centered)
        let right = $('.menu-handle__info').offset().left;
        let left = $('.header__logo-img').offset().left;
        let newWidth = right - left - 77; // srf logo width and  margins and paddings :/
        $('.searchbox').css('width', newWidth);
    }

    unexpandSearch() {
        if (!this.expandable) {
            return;
        }
        if ($('.searchbox').hasClass('centered')) {
            this.hideCloseIcon();
            $('.searchbox').removeClass('centered');
            let right = parseInt($('.searchbox').css('right'));
            $('.searchbox').css('width', this.initialWidth);
        }
    }

    disableArticle() {
        if (!this.expandable) {
            return;
        }
        if ($(window).width() > 720 && $('body').hasClass('body--fixed') == false) {
            // add classes once
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



