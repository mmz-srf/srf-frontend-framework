export function init() {
    $(".header").on("click", ".menu-handle", function (e) {
        e.preventDefault();
        let $handle = $(this);
        if ($handle.hasClass("menu-handle--active")) {
            $handle.removeClass("menu-handle--active")
                .closest(".header").removeClass("header--fixed")
                .find(".navbar").addClass("navbar--closed");
        } else {
            $handle.addClass("menu-handle--active")
                .closest(".header").addClass("header--fixed")
                .find(".navbar").removeClass("navbar--closed");
        }
    });

    $(".navbar__menu").on("click", ".js-menu-expand", function (e) {
        e.preventDefault();
        let $handle = $(this), $arrow = $handle.find(".menu-expand-arrow");
        if ($arrow.hasClass("menu-expand-arrow--open")) {
            $arrow.removeClass("menu-expand-arrow--open");
            $handle.next("ul").addClass("h-element--hide");
        } else {
            $arrow.addClass("menu-expand-arrow--open");
            $handle.next("ul").removeClass("h-element--hide");
        }
    })
}
