export function init() {
    $(".header").on("click", ".menu-handle", function (e) {
        e.preventDefault();
        let $handle = $(this);
        if ($handle.hasClass("menu-handle--active")) {
            $(".l-main-wrapper").removeClass("js-wrapper-observer");
            $handle.removeClass("menu-handle--active");
            $(".navbar__menu").removeClass("navbar__menu--come-in").one("transitionend", function () {
                $(this).closest(".navbar").addClass("navbar--closed")
                    .closest(".l-main-wrapper").removeClass("wrapper--fixed");
            });

        } else {
            e.stopPropagation();
            $handle.addClass("menu-handle--active")
                .closest(".l-main-wrapper").addClass("wrapper--fixed").addClass("js-wrapper-observer")
                .find(".navbar").removeClass("navbar--closed")
                .find(".navbar__menu").addClass("navbar__menu--come-in");
        }
    });

    $(document).on("click", ".js-wrapper-observer", function (e) {
        // make it possible to use search while page is dimmed and navi is visible
        if (!$(e.target).hasClass("searchbox__input")) {
            $(".menu-handle").trigger("click");
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
    });
}
