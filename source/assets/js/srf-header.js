import {SrfSearch} from './srf-search';

const KEYCODES = {
    "enter": 13,
    "tab": 9,
    "escape": 27
};

export function init() {
    $(".header").each((i, elem) => {
        new SrfHeader(
            elem,
            {
                menuToggleCallback: (isOpen) => {console.log("Menu is now " + (isOpen ? "open" : "closed"));},
                submenuToggleCallback: (isOpen) => {console.log("Submenu is now " + (isOpen ? "open" : "closed"));}
            }
        );
    });
}

export class SrfHeader {

    constructor(element, options) {
        this.$element = $(element);
        this.menuToggleCallback  = this.checkFunctionParam(options.menuToggleCallback);
        this.submenuToggleCallback  = this.checkFunctionParam(options.submenuToggleCallback);

        this.$menuButton = this.$element.find(".js-menu-button");
        this.$subMenuButton = this.$element.find(".js-expand-arrow");
        this.menuIsOpen = false;

        // Submenu (Radio)
        this.$subMenuContent = $(".navigation__group--radio");
        this.$arrow = $(".expand-arrow");

        // A11Y
        this.$logo = this.$element.find(".header-startlink");
        this.$navigation = this.$element.find(".js-header-navigation");
        this.$A11YElements = $("body > div, body > section, body > footer").not(".header");
        this.setA11YProperties(this.menuIsOpen);


        this.registerListeners();
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
        this.$subMenuButton.on("click", event => this.onSubMenuButtonClicked(event) );

        $(document).on("click", event => this.onDocumentClicked(event) );
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

    onMenuButtonClicked(e) {
        typeof e !== "undefined" ? e.preventDefault() : null;

        this.changeMenuState(!this.menuIsOpen);
        return false;
    }

    changeMenuState(newState) {
        this.menuIsOpen = newState;

        this.$element.toggleClass("header--open", this.menuIsOpen);

        $('html').toggleClass("menu--opened", this.menuIsOpen);

        this.setA11YProperties(this.menuIsOpen);
        this.menuToggleCallback(this.menuIsOpen);

        if (this.menuIsOpen) {
            $(document).on("keydown.header", event => this.onKeyPressed(event));
        } else {
            $(document).off("keydown.header");
        }
    }

    onSubMenuButtonClicked(e) {
        typeof e !== "undefined" ? e.preventDefault() : null;

        let subMenuIsOpen = !this.$arrow.hasClass("expand-arrow--open");

        this.$arrow.toggleClass("expand-arrow--open", subMenuIsOpen);
        this.$subMenuButton.attr("aria-expanded", subMenuIsOpen);
        this.$subMenuContent.toggleClass("navigation__group--radio-open", subMenuIsOpen);

        this.submenuToggleCallback(subMenuIsOpen);
    }

    /**
     * Multiple key events concern us:
     * - Escape if the menu's open --> close it
     * - trying to Tab out of the menu --> re-focus on the beginning
     * - Key events on any element outside of the header --> close the menu
     *
     * @param e {jQuery.Event}
     */
    onKeyPressed(e) {
        if (e.keyCode === KEYCODES.escape ) {
            this.close();
        } else if (e.keyCode === KEYCODES.tab && this.$element.find(".navigation__link").last().is(e.target)) {
            this.$logo.focus();
        } else if (!$.contains(this.$element[0], e.target)) {
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

/*

const HANDLE_CLASS = ".menu-handle";
const SUBMENU_CLASS = ".js-expand-arrow";
const DESKTOP_CLOSE_BTN_CLASS = ".navigation__link--close";
const WIN_SIZE_NOT_MOBILE = 719;

let srfSearch = null;

let menuHasFocus = false,
    $header = null,
    $handle = null,
    $infotext = null,
    $arrow = null,
    $info = null,
    $subMenuHeader = null,
    $subMenuContent = null,
    $desktopCloseBtn = null;

export function init() {
    $header = $(".header");
    $handle = $(HANDLE_CLASS);
    $infotext = $handle.find(".menu-handle__info span");
    $arrow = $(".expand-arrow");
    $info = $(".js-expand-info");
    $subMenuHeader = $(SUBMENU_CLASS);
    $subMenuContent = $(".navigation__group--radio");
    $desktopCloseBtn = $(DESKTOP_CLOSE_BTN_CLASS);

    initSearch($header, {'expandable': true, 'minSearchLength': 2, 'maxSuggestionCount': 6});
    initSearch($('.footer'), {'expandable': false, 'minSearchLength': 2, 'maxSuggestionCount': 6});


    $header.on("keydown", HANDLE_CLASS, (e) => handleKeyPress(e))
        .on("keydown", DESKTOP_CLOSE_BTN_CLASS, (e) => handleKeyPress(e))
        .on("click", HANDLE_CLASS, (e) => onMenuHandling(e))
        .on("click", DESKTOP_CLOSE_BTN_CLASS, (e) => onMenuHandling(e));

    $(document).on("click touchstart", ".body--observer", (e) => handleBodyClick(e));

    // accessibility: if menu loses focus => we close it
    $(".breadcrumbs").on("keyup", (e) => handleBreadcrumbsFocus(e));

    // radiostation navigation opening & closing
    $(".navigation").on("click", SUBMENU_CLASS, (e) => handleExpandArrowClick(e));
}
*/

function onMenuHandling(e) {
    e.preventDefault(); // chrome has a problem (bug!) with keypress!
    e.stopPropagation();

    if (menuHasFocus) {
        closeMenu(e);
    } else {
        openMenu(e);
    }
}

function closeMenu(e) {
    $("body").removeClass("body--observer");

    $handle.removeClass("menu-handle--active");

    $infotext.text($infotext.data("menu-show"));

    let finishClosingMenu = () => {
        $(".navigation").closest(".navbar").addClass("navbar--closed")
            .closest("body").removeClass("body--fixed");

        if ($arrow.hasClass("expand-arrow--open")) {
            handleExpandArrowClick();
        }

        if (e && e.type === "keydown") {
            $handle.focus();
        }
    };

    // Desktop: there are animations we have to wait for
    if (isDesktop()) {
        $desktopCloseBtn.removeClass("navigation__link--fixed");
        $(".navigation").removeClass("navigation--come-in").one("transitionend", () => {
            finishClosingMenu();
        });
    } else {
        $(".navigation").removeClass("navigation--come-in");
        finishClosingMenu();
    }

    menuHasFocus = false;
}

function openMenu(e) {
    $handle.addClass("menu-handle--active")
        .closest("body").addClass("body--fixed body--observer")
        .find(".navbar").removeClass("navbar--closed")
        .find(".navigation").addClass("navigation--come-in");

    $infotext.text($infotext.data("menu-close"));

    if (isDesktop()) {
        $(".navigation").one("transitionend", () => {
            $desktopCloseBtn.addClass("navigation__link--fixed");

            if (e && e.type === "keydown") {
                $desktopCloseBtn.focus();
            }
        });
    } else {
        srfSearch.reset();
    }

    menuHasFocus = true;
}

function handleKeyPress(e) {
    if (e.keyCode === KEYCODES.enter) {
        onMenuHandling(e);
    }
}

/**
 * Opens/Closes the submenu (radio stations). Currently only handles one submenu.
 * @param e jQuery.event
 */
function handleExpandArrowClick(e) {
    typeof e !== "undefined" ? e.preventDefault() : null;

    let subMenuIsOpen = $arrow.hasClass("expand-arrow--open");

    $arrow.toggleClass("expand-arrow--open", !subMenuIsOpen);
    $subMenuHeader.attr("aria-expanded", !subMenuIsOpen);
    $subMenuContent.toggleClass("navigation__group--radio-open", !subMenuIsOpen);

    if (subMenuIsOpen) {
        $info.text($info.data("text-open"));
    } else {
        $info.text($info.data("text-close"));
    }
}

/**
 * Tabbing to the breadcrumbs = leaving the menu = close it
 * @param e jQuery.event
 */
function handleBreadcrumbsFocus(e) {
    if (menuHasFocus && e.keyCode === KEYCODES.tab) {
        closeMenu();
    }
}

/**
 * Clicks on anything that isn't in the menu, the menu handle or the search box should close the menu.
 * @param e jQuery.event
 */
function handleBodyClick(e) {
    let $target = $(e.target);

    if (menuHasFocus && !$target.parents(".navbar").length && !$target.parents(".menu-handle").length && !$target.is(".searchbox__input, .menu-handle")) {
        closeMenu();
    }
}

function initSearch($elem, options) {
    if (!$elem[0]) {
        return;
    }

    let $searchInput = $elem.find(".searchbox__input");
    let $searchSubmit = $elem.closest(".searchbox").find("button");
    let $searchMenu = $elem.find(".searchbox__results");

    srfSearch = new SrfSearch($searchInput, $searchSubmit, $searchMenu, options);
}

function isDesktop() {
    return $(window).width() > WIN_SIZE_NOT_MOBILE;
}