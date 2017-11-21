const KEYCODES = {
    "enter": 13,
    "tab": 9,
    "escape": 27
};

export function init() {
    $(".header").each((i, elem) => {
        new SrfHeader(
            elem,
            (isOpen) => {/* Header is now open or closed */}
        );
    });
}

export class SrfHeader {

    constructor(element, onMenuToggle) {
        this.$element = $(element);
        this.menuToggleCallback  = this.checkFunctionParam(onMenuToggle);

        this.$menuButton = this.$element.find(".js-menu-button");
        this.menuIsOpen = false;

        // A11Y
        this.$logo = this.$element.find(".header-startlink");
        this.$navigation = this.$element.find(".js-header-navigation");
        this.$A11YElements = $("body > div, body > section, body > footer").not(".header");
        this.setA11YProperties(this.menuIsOpen);

        this.registerListeners();

        // Set initial state
        this.$navigation.hide();
    }

    /**
     * Make sure a parameter is actually a function - return an empty function if it's not.
     *
     * @param param any
     * @return {function()}
     */
    checkFunctionParam(param) {
        return param && typeof param == 'function' ? param : () => {};
    }

    registerListeners() {
        this.$menuButton.on("click", event => this.onMenuButtonClicked(event) );

        $(document).on("click", event => this.onDocumentClicked(event) );

        // A11Y Helper: when tabbing out of the menu, the first element is and will always be a breadcrumb. --> on focus, close the menu.
        $(".breadcrumb__link").first().on('focus', event => this.closeIfOpen());
        $(".footer-bottom__link").last().on('focus', event => this.closeIfOpen());
    }

    /**
     * Click on any element outside of the header or on the root element of the header itself should close the menu if
     * it's open.
     *
     * @param e {jQuery.Event}
     */
    onDocumentClicked(e) {
        if (this.menuIsOpen && !$.contains(this.$element[0], e.target)) {
            this.close();
        }
    }

    closeIfOpen() {
        if (this.menuIsOpen) {
            this.close();
        }
    }

    onMenuButtonClicked(e) {
        typeof e !== "undefined" ? e.preventDefault() : null;

        this.changeMenuState(!this.menuIsOpen);
        return false;
    }

    changeMenuState(newState) {
        this.menuIsOpen = newState;

        if (this.menuIsOpen) {
            $(document).on("keydown.header", event => this.onKeyPressed(event));

            this.$navigation.show();
        } else {
            this.$navigation.one('transitionend', () => {
                this.$navigation.hide();
            });
        }

        this.$element.toggleClass("header--open", this.menuIsOpen);

        $('html').toggleClass("menu--opened", this.menuIsOpen);

        this.setA11YProperties(this.menuIsOpen);
        this.menuToggleCallback(this.menuIsOpen);
    }

    /**
     * The following key events concern us:
     * - Escape if the menu's open --> close it
     *
     * @param e {jQuery.Event}
     */
    onKeyPressed(e) {
        if (e.keyCode === KEYCODES.escape && this.menuIsOpen) {
            this.close();
        }
    }

    close() {
        this.changeMenuState(false);
    }

    /**
     * When the menu is open, make the navigation accessible to screenreaders and hide the rest of the page from them.
     *
     * @param menuIsOpened {Boolean}
     */
    setA11YProperties(menuIsOpened) {
        this.$navigation.attr({
            "aria-hidden": !menuIsOpened,
            "role": menuIsOpened ? "" : "presentation"
        });

        this.$A11YElements.attr({
            "aria-hidden": menuIsOpened,
            "role": menuIsOpened ? "presentation": ""
        });
    }
}
