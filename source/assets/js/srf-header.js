export function init() {

    let HANDLE_CLASS = ".menu-handle";
    let ARROW_CLASS = ".expand-arrow";

    let KEYCODES = {
        "enter": 13,
        "tab": 9
    };

    let $header = $(".header");
    let $handle = $(HANDLE_CLASS);
    let $arrow = $handle.find(ARROW_CLASS);

    let menuHasFocus = false;

    $header.on("keydown", HANDLE_CLASS, (e) => handleKeyPress)
           .on("keydown", ".navbar__link--close", (e) => handleKeyPress)
           .on("click srf_handle-menu", HANDLE_CLASS, (e) => onMenuHandling);

    $(document).on("click touchstart", ".body--observer", (e) => handleClick);

    // accessibility: if menu loses focus => we close it
    $(".breadcrumbs").on("keyup", (e) => handleBreadcrumbsFocus);

    // radiostation navigation opening & closing
    $(".navbar__menu").on("click", ".js-expand-arrow", (e) => handleExpandArrowClick);
    
    // no touch highlight - but css :active-styles for links
    document.addEventListener("touchstart", () => {}, false);

    function closeMenu() {
        $("body").removeClass("body--observer")
                 .find(".navbar__link--close")
                 .removeClass("navbar__link--fixed");

        $handle.removeClass("menu-handle--active");

        if ($(window).width() > 719) { // there are animations we have to wait for....

            $(".navbar__menu").removeClass("navbar__menu--come-in").one("transitionend", () => {

                $(this).closest(".navbar").addClass("navbar--closed")
                       .closest("body").removeClass("body--fixed");

                if ($arrow.hasClass("expand-arrow--open")) {
                    $(".js-expand-arrow").trigger("click");
                }
            });

        } else { // on mobile: no animations

            $(".navbar__menu").removeClass("navbar__menu--come-in") // slide menu back
                              .closest(".navbar").addClass("navbar--closed")
                              .closest("body").removeClass("body--fixed");

            if ($arrow.hasClass("expand-arrow--open")) {
                $(".js-expand-arrow").trigger("click");
            }
        }
        menuHasFocus = false;
    }

    function openMenu() {
        $handle.addClass("menu-handle--active")
               .closest("body").addClass("body--fixed").addClass("body--observer")
               .find(".navbar").removeClass("navbar--closed")
               .find(".navbar__menu").addClass("navbar__menu--come-in");

        if ($(window).width() > 719) { // there are animations we have to wait for....
            $(".navbar__menu").one("transitionend", () => {
                $(this).find(".navbar__link--close").addClass("navbar__link--fixed");
            });
        }
        menuHasFocus = true;
    }

    function handleKeyPress(e) {
        if (e.keyCode === KEYCODES.enter) {
            // focus on [menu]
            $handle.trigger("srf_handle-menu");
            $handle.focus();

            return false;
        }
    }

    function onMenuHandling(e) {
        e.preventDefault(); // chrome has a problem (bug!) with keypress!
        e.stopPropagation();

        if (menuHasFocus) {
            closeMenu(e);
        } else {
            openMenu();

            if (e.type === "srf_handle-menu") {
                $(".navbar__link--close").focus();
            }
        }
    }

    function handleExpandArrowClick(e) {
        e.preventDefault();

        let $info = $(".js-expand-info");

        if ($arrow.hasClass("expand-arrow--open")) { // radio menu is open => close it

            $arrow.removeClass("expand-arrow--open");
            $handle.attr("aria-expanded", false).next(".navbar__group--radio")
                   .removeClass("navbar__group--radio-open");

            $info.text($info.data("text-open"));
        } else { // it's closed => open it
            $arrow.addClass("expand-arrow--open");

            $handle.attr("aria-expanded", true).next(".navbar__group--radio")
                   .addClass("navbar__group--radio-open");

            $info.text($info.data("text-close"));
        }
    }

    function handleBreadcrumbsFocus(e) {
        // we tabbed "into article"
        if (menuHasFocus && e.keyCode === KEYCODES.tab) {
            $handle.trigger("click");
        }
    }

    function handleClick(e) {
        let $target = $(e.target);

        // make it possible to use search while page is dimmed and navi is visible
        if (!$target.hasClass("searchbox__input") && (!$target.hasClass("navbar__link") || $target.hasClass("navbar__link--close") ) && !$target.hasClass("expand-arrow")) {
            $handle.trigger("click");
        }
    }
}
