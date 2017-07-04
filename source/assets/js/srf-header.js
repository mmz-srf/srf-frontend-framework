export function init() {

    $(".header").on("keypress", ".menu-handle", function (e) {
        // on tabbing in [Menu] + <enter>
        if (e.keyCode === 13) {
            // focus on [x]
            $(".navbar__link--close").focus();
            // return false;
        }
    });

    $(".header").on("keypress", ".navbar__link--close", function (e) {
        // on tabbing in [x] + <enter>
        if (e.keyCode === 13) {
            // focus on [menu]
            $(".menu-handle").focus();
            // return false;
        }
    });

    $(".header").on("click", ".menu-handle", function (e) {
        e.preventDefault();
        let $handle = $(this);
        if ($handle.hasClass("menu-handle--active")) {
            $("body").removeClass("body--observer").find(".navbar__link--close").removeClass("navbar__link--fixed");
            $handle.removeClass("menu-handle--active");

            if ($(window).width() > 719) { // there are animations we have to wait for....
                $(".navbar__menu").removeClass("navbar__menu--come-in").one("transitionend", function () {
                    $(this).closest(".navbar").addClass("navbar--closed")
                        .closest("body").removeClass("body--fixed")
                    // .find(".navbar__link--close").removeClass("navbar__link--fixed");
                });
            } else { // on mobile
                /* $handle.closest(".l-main-wrapper").removeClass("wrapper--fixed")
                 .find(".navbar").one("transitionend", function () {
                 // $(".navbar__menu").removeClass("navbar__menu--come-in").one("transitionend", function () {
                 $(this).addClass("navbar--closed").find(".navbar__menu").removeClass("navbar__menu--come-in")
                 // .closest(".l-main-wrapper").removeClass("wrapper--fixed");
                 }); */ // <-- this looks shite!
                $(".navbar__menu").removeClass("navbar__menu--come-in")
                    .closest(".navbar").addClass("navbar--closed")
                    .closest("body").removeClass("body--fixed");
            }

        } else {
            e.stopPropagation();
            $handle.addClass("menu-handle--active")
                .closest("body").addClass("body--fixed").addClass("body--observer")
                .find(".navbar").removeClass("navbar--closed") // .addClass("navbar--come-in")
                .find(".navbar__menu").addClass("navbar__menu--come-in");
            // .find(".navbar__link--close").addClass("navbar__link--fixed");

            if ($(window).width() > 719) { // there are animations we have to wait for....
                $(".navbar__menu").one("transitionend", function () {
                    $(this).find(".navbar__link--close").addClass("navbar__link--fixed");
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

    $(".navbar__menu").on("click", ".js-expand-arrow", function (e) {
        e.preventDefault();
        let $handle = $(this), $arrow = $handle.find(".expand-arrow");
        if ($arrow.hasClass("expand-arrow--open")) { // radio menu is open
            $arrow.removeClass("expand-arrow--open");
            $handle.next(".navbar__group--radio").removeClass("navbar__group--radio-open"); // .addClass("h-element--hide");
        } else { // it's closed
            $arrow.addClass("expand-arrow--open");
            $handle.next(".navbar__group--radio").addClass("navbar__group--radio-open"); // .removeClass("h-element--hide");
        }
    });
    
    // no touch highlight - but css :active-styles for links
    document.addEventListener("touchstart", function () {
    }, false);
}
