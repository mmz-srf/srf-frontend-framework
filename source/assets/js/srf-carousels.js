var $carousels = [];
var loadedCarousels = {};
var css = {
    'containers': '.carousel__js',
    'handles': '.carousel__link--next, .carousel__link--prev'
};

export function init() {
    $carousels = $(css.containers);

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
            accessibility: false,
            focusOnSelect: true, // let's try this
            appendArrows: "#" + id + " .slick-list",
            dots: true,
            // focusOnSelect: true,
            centerPadding: 0,
            variableWidth: true,
            prevArrow: '<button class="carousel__link--prev"><span class="h-offscreen h-offscreen-focusable">Vorhergehender Slide</span></button>',
            nextArrow: '<button class="carousel__link--next"><span class="h-offscreen h-offscreen-focusable">Nächster Slide</span></button>'
        });
    });

    // "position change" (resize page or "activate" slider in any way)
    $('.video_carousel__js').on('setPosition', function (slick) {
        let slidesToShow = getNumberOfSlidesPerScreen(1), // mobile : 1
            $carousel = $(this),
            currentSlide = $carousel.slick("slickCurrentSlide");
        // if previous num. of slides shown != the num. we'll see now
        if ($carousel.slick("slickGetOption", "slidesToShow") != slidesToShow) {
            // if slider not at initial pos. && arrows displayed
            if (currentSlide > 0 && slidesToShow != 1) {
                // move it to 0 - so the "arrows" don't get "confused"
                currentSlide = 0;
                $carousel.slick("slickGoTo", currentSlide, true);
            }

            if (slidesToShow > 1) {
                // the following option is terrible for screen sizes showing more than 1 elm
                $carousel.slick("slickSetOption", "focusOnSelect", false);

                // unhide the following slidesToShow - 1 from screenreaders as well:
                $carousel.find(".carousel__item").each(function (i) {
                    if (i <= slidesToShow) {
                        $(this).attr("aria-hidden", false);
                    }
                    console.log($carousel, $(this), i)
                });
            }

            // and adjust num. of slides...
            $carousel.slick("slickSetOption", "slidesToShow", slidesToShow, false);
            $carousel.slick("slickSetOption", "slidesToScroll", slidesToShow, false);

            let screensToShow = Math.ceil($carousel.find(".carousel__item").length / slidesToShow);

            (slidesToShow > screensToShow) // are there more slides than elements?
                ? $(".slick-dots").removeClass(".h-element--hide")  // show dots
                : $(".slick-dots").addClass(".h-element--hide");    // else hide them

            // and adjust num. of dots
            rePaintDots($carousel, screensToShow);

            // if we're at the rightmost position within the carousel - we don't want the right arrow
            handleRightArrow($carousel, currentSlide, screensToShow);
        }
    });
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
    $carousel.find(".slick-dots li:nth-child(1n + " + x + ")").addClass("h-element--hide");
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
