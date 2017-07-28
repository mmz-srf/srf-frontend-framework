export function init() {

    let MENU_EVENT = "srf_handle-menu";
    let HANDLE_CLASS = ".menu-handle";
    let SUBMENU_CLASS = ".js-expand-arrow";
    let DESKTOP_CLOSE_BTN_CLASS = ".navbar__link--close";
    let KEYCODES = {
        "enter": 13,
        "tab": 9
    };
    let WIN_SIZE_DESKTOP = 719;

    let $header = $(".header");
    let $handle = $(HANDLE_CLASS);
    let $arrow = $(".expand-arrow");
    let $info = $(".js-expand-info");
    let $subMenuHeader = $(SUBMENU_CLASS);
    let $subMenuContent = $(".navbar__group--radio");
    let $desktopCloseBtn = $(DESKTOP_CLOSE_BTN_CLASS);

    let menuHasFocus = false;

    $header.on("keydown", HANDLE_CLASS, (e) => handleKeyPress(e) )
        .on("keydown", DESKTOP_CLOSE_BTN_CLASS, (e) => handleKeyPress(e) )
        .on("click MENU_EVENT", HANDLE_CLASS, (e) => onMenuHandling(e) );

    $(document).on("click touchstart", ".body--observer", (e) => handleBodyClick(e) );

    // accessibility: if menu loses focus => we close it
    $(".breadcrumbs").on("keyup", (e) => handleBreadcrumbsFocus(e) );

    // radiostation navigation opening & closing
    $(".navbar__menu").on("click", SUBMENU_CLASS, (e) => handleExpandArrowClick(e) );

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

        let finishClosingMenu = () => {
            $(".navbar__menu").closest(".navbar").addClass("navbar--closed")
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
            $(".navbar__menu").removeClass("navbar__menu--come-in").one("transitionend", () => {
                finishClosingMenu();
                $desktopCloseBtn.removeClass("navbar__link--fixed");
            });
        } else {
            $(".navbar__menu").removeClass("navbar__menu--come-in");
            finishClosingMenu();
        }

        menuHasFocus = false;
    }

    function openMenu(e) {
        $handle.addClass("menu-handle--active")
            .closest("body").addClass("body--fixed body--observer")
            .find(".navbar").removeClass("navbar--closed")
            .find(".navbar__menu").addClass("navbar__menu--come-in");

        if (isDesktop()) {
            $(".navbar__menu").one("transitionend", () => {
                $desktopCloseBtn.addClass("navbar__link--fixed");

                if (e && e.type === "keydown") {
                    $desktopCloseBtn.focus();
                }
            });
        }

        menuHasFocus = true;
    }

    function handleKeyPress(e) {
        if (e.keyCode === KEYCODES.enter) {
            onMenuHandling(e);
        }
    }

    function handleExpandArrowClick(e) {
        typeof e !== "undefined" ? e.preventDefault() : null;

        let subMenuIsOpen = $arrow.hasClass("expand-arrow--open");

        $arrow.toggleClass("expand-arrow--open", !subMenuIsOpen);
        $subMenuHeader.attr("aria-expanded", !subMenuIsOpen);
        $subMenuContent.toggleClass("navbar__group--radio-open", !subMenuIsOpen);

        if (subMenuIsOpen) {
            $info.text($info.data("text-open"));
        } else {
            $info.text($info.data("text-close"));
        }
    }

    function handleBreadcrumbsFocus(e) {
        if (menuHasFocus && e.keyCode === KEYCODES.tab) {
            closeMenu();
        }
    }

    function handleBodyClick(e) {
        let $target = $(e.target);

        // make it possible to use search while page is dimmed and navi is visible
        if (!$target.hasClass("searchbox__input")
            && (!$target.hasClass("navbar__link") || $target.hasClass("navbar__link--close") )
            && !$target.hasClass("expand-arrow")
            && !$target.hasClass("menu-handle")
            && !$target.hasClass("menu-handle__info") ) {

            onMenuHandling(e);
        }
    }

    function isDesktop() {
        return $(window).width() > WIN_SIZE_DESKTOP;
    }
}
