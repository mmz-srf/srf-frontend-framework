export function init() {
    $(".header").on("click", ".menu-handle", function (e) {
        e.preventDefault();
        let $handle = $(this);
        if ($handle.hasClass("menu-handle--active")) {
            $handle.removeClass("menu-handle--active")
                .closest(".l-main-wrapper").removeClass("wrapper--fixed")
            // .find(".header").removeClass("header--fixed")
                .find(".navbar").addClass("navbar--closed");
            $("body").removeClass("body--foggy");
            $(".navbar__menu").removeClass("navbar__menu--come-in");

        } else {
            $handle.addClass("menu-handle--active")
                .closest(".l-main-wrapper").addClass("wrapper--fixed")
            // .find(".header").addClass("header--fixed")
                .find(".navbar").removeClass("navbar--closed");
            $("body").addClass("body--foggy");
            $(".navbar__menu").addClass("navbar__menu--come-in");
        }
    });

    $(".navbar__menu").on("click", ".js-expand-arrow", function (e) {
        e.preventDefault();
        let $handle = $(this), $arrow = $handle.find(".expand-arrow");
        if ($arrow.hasClass("expand-arrow--open")) {
            $arrow.removeClass("expand-arrow--open");
            $handle.next(".navbar__group--radio").addClass("h-element--hide");
        } else {
            $arrow.addClass("expand-arrow--open");
            $handle.next(".navbar__group--radio").removeClass("h-element--hide");
        }
    })
}
