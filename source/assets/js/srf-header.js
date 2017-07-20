export function init() {

    let menuHasFocus = false;

    $(".header").on("keydown", ".menu-handle", function (e) {
        e.stopPropagation();
        // on tabbing into [x] + <enter>
        if (e.keyCode === 13) {
            // focus on [menu]
            $(".menu-handle").trigger("srf_handle-menu");
            return false;
        }
    }).on("keydown", ".navbar__link--close", function (e) {
        // e.stopPropagation();
        // on tabbing into [x] + <enter>
        if (e.keyCode === 13) {
            // focus on [menu]
            $(".menu-handle").trigger("srf_handle-menu");
            $(".menu-handle").focus();
            return false;
        }
    }).on("click srf_handle-menu", ".menu-handle", function (e) { // hamburger clicking management
        e.preventDefault(); // chrome has "a problem" (bug!) with keypress!
        e.stopPropagation();
        let $handle = $(this);
        if (menuHasFocus) { // the menu is open => close it
            $("body").removeClass("body--observer").find(".navbar__link--close")
                .removeClass("navbar__link--fixed");
            $handle.removeClass("menu-handle--active");

            if ($(window).width() > 719) { // there are animations we have to wait for....
                $(".navbar__menu").removeClass("navbar__menu--come-in").one("transitionend", function () {
                    $(this).closest(".navbar").addClass("navbar--closed")
                        .closest("body").removeClass("body--fixed");
                    if ($(".expand-arrow").hasClass("expand-arrow--open")) {
                        $(".js-expand-arrow").trigger("click");
                    }
                });
            } else { // on mobile: no animations
                $(".navbar__menu").removeClass("navbar__menu--come-in") // slide menu back
                    .closest(".navbar").addClass("navbar--closed")
                    .closest("body").removeClass("body--fixed");
                if ($(".expand-arrow").hasClass("expand-arrow--open")) {
                    $(".js-expand-arrow").trigger("click");
                }
            }
            menuHasFocus = false;

        } else { // the menu is closed => open it
            $handle.addClass("menu-handle--active")
                .closest("body").addClass("body--fixed").addClass("body--observer")
                .find(".navbar").removeClass("navbar--closed")
                .find(".navbar__menu").addClass("navbar__menu--come-in");

            if ($(window).width() > 719) { // there are animations we have to wait for....
                $(".navbar__menu").one("transitionend", function () {
                    $(this).find(".navbar__link--close").addClass("navbar__link--fixed");
                });
            }
            menuHasFocus = true;

            if (e.type === "srf_handle-menu") {
                // focus on [x]
                $(".navbar__link--close").focus();
            }
        }
    });

    $(document).on("click touchstart", ".body--observer", function (e) {
        let $target = $(e.target);
        // make it possible to use search while page is dimmed and navi is visible
        if (!$target.hasClass("searchbox__input") && (!$target.hasClass("navbar__link") || $target.hasClass("navbar__link--close") ) && !$target.hasClass("expand-arrow")) {
            $(".menu-handle").trigger("click");
        }
    });

    // accessibility: if menu loses focus => we close it
    $(".breadcrumbs").on("keyup", function (e) {
        // we tabbed "into article"
        if (menuHasFocus && e.keyCode === 9) { // and the menu was open
            $(".menu-handle").trigger("click");
        }
    });

    // radiostation navigation opening & closing
    $(".navbar__menu").on("click", ".js-expand-arrow", function (e) {
        e.preventDefault();
        let $handle = $(this),
            $arrow = $handle.find(".expand-arrow"),
            $info = $(".js-expand-info");
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
    });
    
    // no touch highlight - but css :active-styles for links
    document.addEventListener("touchstart", function () {
    }, false);
}
