var $carousels = [];
var loadedCarousels = {};
var css = {
    'containers': '.carousel__js',
    'handles': '.carousel__link--next, .carousel__link--prev'
};

export function init() {
    $carousels = $(css.containers);

    //prevent flicker effect on page load
    $carousels.on('init', function () {
        $(css.containers).css("visibility", "visible");
    });

    $.each($carousels, function (i, carousel) {
        var $carousel = $(carousel);
        loadedCarousels[$carousel.attr("id")] = false;
        $carousel.slick({
            speed: 300,
            slidesToShow: 1,
            infinite: false,
            prevArrow: '<button class="carousel__link--prev waggle"><span class="h-offscreen h-offscreen-focusable">Vorhergehendes Bild</span></button>',
            nextArrow: '<button class="carousel__link--next waggle"><span class="h-offscreen h-offscreen-focusable">Nächstes Bild</span></button>',
            slide: ".carousel__item"
        });
        registerListener($carousel);
    });

    $('.video_carousel__js').slick({
        speed: 300,
        infinite: false,
        slide: ".carousel__item",
        lazyLoad: "ondemand",
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 0,
        dots: false,
        arrows: false,
        mobileFirst: true,
        centerMode: true,
        responsive: [
            {
                breakpoint: 1024, // desktop
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    dots: true,
                    arrows: true,
                    prevArrow: '<button class="carousel__link--prev"><span class="h-offscreen h-offscreen-focusable">Vorhergehendes Bild</span></button>',
                    nextArrow: '<button class="carousel__link--next"><span class="h-offscreen h-offscreen-focusable">Nächstes Bild</span></button>',
                    centerMode: false
                }
            }, {
                breakpoint: 720, // tablet
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    dots: true,
                    arrows: true,
                    prevArrow: '<button class="carousel__link--prev"><span class="h-offscreen h-offscreen-focusable">Vorhergehendes Bild</span></button>',
                    nextArrow: '<button class="carousel__link--next"><span class="h-offscreen h-offscreen-focusable">Nächstes Bild</span></button>',
                    centerMode: false
                }
            }
        ]
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

    $carousel.on('swipe mouseover mouseenter', function (event, slick, direction) {
        // on "interacting" with the carousel
        if ($(this).find(".carousel__link--next").hasClass("waggle")) {
            // no more animation // and only do it once
            $(this).find(".carousel__link--prev").removeClass("waggle").addClass("has-waggled");
            $(this).find(".carousel__link--next").removeClass("waggle").addClass("has-waggled");
        }
    });

    $carousel.find(css.handles).on("touchstart mouseup", function () {
        $(this).removeClass("untouched");
        // if the handles are clicked / touched: stop the animation
        $(this).removeClass("waggle").addClass("has-waggled");
        $(this).removeClass("waggle").addClass("has-waggled");
    }).on("touchend touchcancel", function () {
        $(this).addClass("untouched");
    });

    /* $(window).scroll(function () {
        // as soon as the gallery is within the viewport (and handles weren't animated before)
        if (isWithinVerticalViewport($carousel) && $carousel.find(".has-waggled").attr("class") == undefined) {
            // animate them
            $carousel.find(".carousel__link--prev").addClass("waggle");
            $carousel.find(".carousel__link--next").addClass("waggle");
        }
     }); */
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

/* function isWithinVerticalViewport($element) {

    var win = $(window);

    var viewport = {
        top: win.scrollTop()// ,
        // left: win.scrollLeft()
    };
    // viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();

    var bounds = $element.offset();
    // bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + $element.outerHeight();

    // return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
    return (!(viewport.bottom < bounds.top || viewport.top > bounds.bottom));
 } */