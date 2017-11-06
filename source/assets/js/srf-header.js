import {SrfSearch} from './srf-search';

const KEYCODES = {
    "enter": 13,
    "tab": 9
};

export function init() {
    $(".header").each((i, elem) => {
        new SrfHeader(
            elem,
            true,
            () => {console.log("opening...");},
            () => {console.log("closing...");}
        );
    });
}

export class SrfHeader {

    constructor(element, initialState, callbackOnOpen, callbackOnClose) {
        this.$element = $(element);
        this.$menuButton = this.$element.find(".js-menu-button");
        this.$subMenuButton = this.$element.find(".js-expand-arrow");
        this.menuIsOpen = initialState || false;

        this.callbackOnOpen  = callbackOnOpen  && typeof callbackOnOpen  == 'function' ? callbackOnOpen  : () => {};
        this.callbackOnClose = callbackOnClose && typeof callbackOnClose == 'function' ? callbackOnClose : () => {};

        // Submenu (Radio)
        this.$subMenuContent = $(".navigation__group--radio");
        this.$arrow = $(".expand-arrow");
        this.$info = $(".js-expand-info");

        this.registerListeners();

        this.changeMenuState(this.menuIsOpen);
    }

    registerListeners() {
        this.$menuButton.on("click", event => this.onMenuButtonClicked(event) );

        $(document).on("click", event => this.onDocumentClicked(event) );

        // sub menu opening & closing
        this.$subMenuButton.on("click", event => this.onSubMenuButtonClicked(event) );
    }

    /**
     * Click on any element outside of the header should close the menu if it's open.
     *
     * @param e
     */
    onDocumentClicked(e) {
        if (this.menuIsOpen && !$.contains(this.$element[0], e.target) ) {
            this.changeMenuState(false);
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

        if (this.menuIsOpen) {
            this.callbackOnOpen();
        } else {
            this.callbackOnClose();
        }
    }

    onSubMenuButtonClicked(e) {
        typeof e !== "undefined" ? e.preventDefault() : null;

        let subMenuIsOpen = this.$arrow.hasClass("expand-arrow--open");

        this.$arrow.toggleClass("expand-arrow--open", !subMenuIsOpen);
        this.$subMenuButton.attr("aria-expanded", !subMenuIsOpen);
        this.$subMenuContent.toggleClass("navigation__group--radio-open", !subMenuIsOpen);

        if (subMenuIsOpen) {
            this.$info.text(this.$info.data("text-open"));
        } else {
            this.$info.text(this.$info.data("text-close"));
        }
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