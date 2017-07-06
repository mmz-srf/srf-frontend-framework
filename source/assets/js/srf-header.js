export function init() {

    let menuHasFocus = false;

    $(".header").on("keydown", ".menu-handle", function (e) {
        // on tabbing into [Menu] + <enter>
        if (e.keyCode === 13) {
            // focus on [x]
            setTimeout(function () { // accessibility: menu is hidden for everyone
                $(".navbar__link--close").focus();
            }, 10); // we need to wait ... until "things" are available :/
            menuHasFocus = true;
        }
    }).on("keydown", ".navbar__link--close", function (e) {
        // on tabbing into [x] + <enter>
        if (e.keyCode === 13) {
            // focus on [menu]
            $(".menu-handle").trigger("click");
            $(".menu-handle").focus();
            // menuHasFocus = false;
        }
    }).on("click", ".menu-handle", function (e) { // hamburger clicking management
        e.preventDefault();
        let $handle = $(this);
        if ($handle.hasClass("menu-handle--active")) { // the menu is open => close it
            $("body").removeClass("body--observer").find(".navbar__link--close")
                .removeClass("navbar__link--fixed");
            $handle.removeClass("menu-handle--active");

            if ($(window).width() > 719) { // there are animations we have to wait for....
                $(".navbar__menu").removeClass("navbar__menu--come-in").one("transitionend", function () {
                    $(this).closest(".navbar").addClass("navbar--closed")
                        .closest("body").removeClass("body--fixed")
                });
            } else { // on mobile: no animations
                $(".navbar__menu").removeClass("navbar__menu--come-in") // slide menu back
                    .closest(".navbar").addClass("navbar--closed")  // set
                    .closest("body").removeClass("body--fixed");
            }
            menuHasFocus = false;

        } else { // the menu is closed => open it
            e.stopPropagation();
            $handle.addClass("menu-handle--active")
                .closest("body").addClass("body--fixed").addClass("body--observer")
                .find(".navbar").removeClass("navbar--closed")
                .find(".navbar__menu").addClass("navbar__menu--come-in");

            if ($(window).width() > 719) { // there are animations we have to wait for....
                $(".navbar__menu").one("transitionend", function () {
                    $(this).find(".navbar__link--close").addClass("navbar__link--fixed");
                    menuHasFocus = true;
                });
            }
        }
    });

    $(document).on("click", ".body--observer", function (e) {
        let $target = $(e.target);
        // make it possible to use search while page is dimmed and navi is visible
        if (!$target.hasClass("searchbox__input") && (!$target.hasClass("navbar__link") || $target.hasClass("navbar__link--close") ) && !$target.hasClass("expand-arrow")) {
            $(".menu-handle").trigger("click");
        }
    });

    // accessibility: if menu loses focus => we close it
    $(".article").on("keyup", function (e) {
        // we tabbed "into article"
        if (e.keyCode === 9 && menuHasFocus) { // and the menu was open
            $(".menu-handle").trigger("click");
            // menuHasFocus = false;
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
