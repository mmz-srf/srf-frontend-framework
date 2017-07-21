let $carousels = [];
let loadedCarousels = {};
let slidesPerScreen = 1;
let currentElement = 1; // <--- or something ...
let css = {
    'containers': '.carousel__js',
    'handles': '.carousel__link--next, .carousel__link--prev'
};

export function init() {
    $carousels = $(css.containers);

    /* $(".article-video__link").on("click", function (e) {
     e.preventDefault();
     }); */

    // prevent flicker effect on page load
    $carousels.on('init', function () {
        $(css.containers).css("visibility", "visible");
    });

    // img carousels
    $.each($carousels, function (i, carousel) {
        var $carousel = $(carousel),
            id = $carousel.attr("id");
        loadedCarousels[id] = false;

        $carousel.slick({
            speed: 300,
            slidesToShow: 1,
            infinite: false,
            appendArrows: "#" + id + " .slick-list",
            prevArrow: '<button class="carousel__link--prev"><span class="h-offscreen h-offscreen-focusable">Vorhergehendes Bild</span></button>',
            nextArrow: '<button class="carousel__link--next carousel__link--waggle"><span class="h-offscreen h-offscreen-focusable">Nächstes Bild</span></button>',
            slide: ".carousel__item"
        });
        registerListener($carousel);
    });

    // video carousels
    $(".video_carousel__js").on("init", function (slick) {
        $(this).css("visibility", "visible");
        // triggering a "recalculation of dots" (via "setPosition" below)
        $(window).trigger('resize');
    });

    // video carousel:
    $.each($('.video_carousel__js'), function (i, carousel) {
        let $carousel = $(carousel),
            id = $carousel.attr("id");

        loadedCarousels[id] = false;

        $carousel.slick({
            infinite: false,
            slide: ".carousel__item",
            slidesToShow: 1, // we need all dots - initially
            slidesToScroll: 1,
            accessibility: true, // default?
            // focusOnSelect: false, // <-- not adjustable "on the fly" :/
            appendArrows: "#" + id, //  + " .slick-list",
            dots: true,
            centerPadding: 0,
            variableWidth: true,
            prevArrow: '<button class="carousel__link--prev"><span class="h-offscreen h-offscreen-focusable">Vorhergehender Slide</span></button>',
            nextArrow: '<button class="carousel__link--next"><span class="h-offscreen h-offscreen-focusable">Nächster Slide</span></button>'
        });
    });

    // "position change" (resize page or "activate" slider in any way)
    $(".video_carousel__js").on("setPosition", function (slick) {
        slidesPerScreen = getNumberOfSlidesPerScreen(1);
        let slidesToShow = slidesPerScreen, // mobile : 1
            $carousel = $(this),
            currentSlide = $carousel.slick("slickCurrentSlide");

        // button / dot text info for screenreaders
        if ($carousel.find(".slick-dots button").first().text() == "1" || currentElement != currentSlide) {
            addTextToDots($carousel);
        }
        currentElement = currentSlide;

        // if previous num. of slides shown != the num. we'll see now (window resize)
        if ($carousel.slick("slickGetOption", "slidesToShow") != slidesToShow) {
            let screensToShow = Math.ceil($carousel.find(".carousel__item").length / slidesToShow);

            // desktop / more than one slide / arrows displayed
            if (slidesToShow > 1) {
                // slider not at initial pos.
                if (currentSlide > 0) {
                    // move it to 0 - so the "arrows" don't get "confused"
                    currentSlide = 0;
                    currentElement = currentSlide;
                    $carousel.slick("slickGoTo", currentSlide, true);
                }

                // disabling dots if arrows present (accessibility)
                disableDots($carousel);

                // no right arrow when at the rightmost position within the carousel
                handleRightArrow($carousel, currentSlide, screensToShow);

                // adjust num. of dots (after resize)
                rePaintDots($carousel, screensToShow);

                $carousel.find(".slick-dots").removeClass("h-element--hide");  // show dots (container) if more than one
            } else {
                $carousel.find(".slick-dots").addClass("h-element--hide");    // else hide the one :)
            }

            // adjust num. of slides per page
            $carousel.slick("slickSetOption", "slidesToShow", slidesToShow, false);
            $carousel.slick("slickSetOption", "slidesToScroll", slidesToShow, false);
        }

        // accessibility:
        if (slidesToShow > 1) { // desktop: only for more than one slide / dots
            // unhide the following slidesToShow - 1 from screenreaders as well:
            let maxSlideVisible = currentSlide + slidesToShow - 1;
            $carousel.find(".carousel__item").each(function (i) {
                // remove not currently visible slides from tabindex
                (i >= currentSlide && i <= maxSlideVisible)
                    ? $(this).attr("aria-hidden", false).find(".article-video__link").attr("tabindex", 0)
                    : $(this).attr("aria-hidden", true).find(".article-video__link").attr("tabindex", -1);
            });
        } // else { $carousel.find(".carousel__item").attr("aria-hidden", false); } // slick li elements
        else { // mobile: reenable buttons (dots) after video has been selected :/
            // addTextToDots($carousel);
        }

    }).on("click playIt", ".article-video__link", function (e) {
        // alert("click / playIt")
        // unfortunately $carousel.slick("slickSetOption", "focusOnSelect", ...); cannot be set "on the fly" :/
        if (e.type == "click" && slidesPerScreen === 1) {
            // alert("clicked")
            gotTo($(this)); // <------ enable selecting "barely visible next video"
        } else if (e.type == "playIt") {
            // alert("come playId")
            $(this).trigger("click"); // desktop only :/ --> mobile "goes all wrong" with this - or it's not this at all ...
        }
    }).on("keyup", ".article-video__link", function (e) {
        // someone is tabbing
        // $(".article-video__link").attr("tabindex", -1).attr("aria-hidden", true);
        // $(this).attr("tabindex", 0).attr("aria-hidden", false).css({"background": "pink"});
        console.log("keyup ...", $(this).closest(".carousel__item").data("slick-index"))
        if (e.keyCode === 13) {
            alert("keyup ...")
            $(this).closest(".video_carousel__js").find(".slick-dots li").each(function (i) {
                let $elm = $(this);
                $elm.css({"border": "1px dotted pink"});
                if ($elm.hasClass("slick-active")) {
                    $elm.css({"border": "1px dotted green"});
                }
                $elm.attr("aria-hidden", false).attr("tabindex", "0") // li
            });
            $(this).css({"border": "1px dotted pink"}).trigger("playIt");
        }
    });
}

function gotTo($selectedLink) {
    $selectedLink.closest(".video_carousel__js")
        .slick("slickGoTo", $selectedLink.closest(".carousel__item").data("slick-index"));
}

function registerListener($carousel) {
    // load all images after user starts interacting with carousel
    $carousel.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
        if (loadedCarousels[$carousel.attr("id")] === false) {
            loadedCarousels[$carousel.attr("id")] = true;
            loadLazyImages(slick.$slides.find(".image-figure__js"));
        }
    });

    $carousel.on('swipe', function (event, slick, direction) {
        // on "interacting" with the carousel => no more animation
        $(this).find(".carousel__link--next").removeClass("carousel__link--waggle");
    });

    $carousel.find(css.handles).on("touchstart mousedown mouseenter", function () {
        $(this).removeClass("untouched");
        // if the handles are clicked / touched: stop the animation
        $(this).removeClass("carousel__link--waggle");
    }).on("touchend touchcancel", function () {
        $(this).addClass("untouched");
    });
}

function loadLazyImages(images) {
    images.each(function (i, image) {
        var $image = $(image);
        if ($image.data("src")) {
            $image.attr("srcset", $image.data("srcset"));
            $image.attr("src", $image.data("src"));
        }
    });
}

function rePaintDots($carousel, screensToShow) {
    let x = screensToShow + 1;
    $carousel.find(".slick-dots li").removeClass("h-element--hide");
    // adding text to dots
    addTextToDots($carousel);
    $carousel.find(".slick-dots li:nth-child(1n + " + x + ")").addClass("h-element--hide");
}

function addTextToDots($carousel) {
    // mobile: adding text to dots
    $carousel.find(".slick-dots li").each(function (i) {
        let $elm = $(this);
        // reenabling buttons (after slick) for mobile :/
        $elm.attr("aria-hidden", false) // .attr("tabindex", "0") // li
            .find("button").text($elm.hasClass("slick-active") // and provide textual info
            ? $carousel.data("dot-current")
            : (i + 1) + $carousel.data("dot-info")
        ).attr("tabindex", "0").attr("aria-hidden", false).attr("role", "button"); // button (dot)
    }); // this is silly and not informative :/
}

function disableDots($carousel) {
    $carousel.find(".slick-dots button").attr("tabindex", "-1")
        .attr("aria-hidden", true).attr("role", "presentation");
}

function handleRightArrow($carousel, currentSlide, screensToShow) {
    if ((currentSlide + 1) == screensToShow) {
        $carousel.find(".carousel__link--next").addClass("h-element--hide").attr("aria-disabled", true);
    } else {
        $carousel.find(".carousel__link--next").removeClass("h-element--hide").attr("aria-disabled", false);
    }
}

function getNumberOfSlidesPerScreen(slidesToShow = 1) {
    // let slidesToShow = 1; // mobile

    if (matchMedia('screen and (min-width: 720px) and (max-width: 1023px)').matches) {
        slidesToShow = 2; // tablet
    } else if (matchMedia('screen and (min-width: 1024px)').matches) {
        slidesToShow = 3; // larger
    }
    return slidesToShow
}
