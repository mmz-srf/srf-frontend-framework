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
            prevArrow: '<button class="carousel__link--prev"><span class="h-offscreen h-offscreen-focusable">Vorhergehendes Bild</span></button>',
            nextArrow: '<button class="carousel__link--next"><span class="h-offscreen h-offscreen-focusable">Nächstes Bild</span></button>',
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
        dots: true,
        arrows: false,
        appendArrows: ".slick-list",
        mobileFirst: true,
        centerMode: true,
        centerPadding: "0",
        responsive: [
            {
                breakpoint: 1024, // desktop
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    // dots: true,
                    arrows: true,
                    prevArrow: '<button class="carousel__link--prev"><span class="h-offscreen h-offscreen-focusable">Vorhergehendes Bild</span></button>',
                    nextArrow: '<button class="carousel__link--next"><span class="h-offscreen h-offscreen-focusable">Nächstes Bild</span></button>',
                    centerMode: false,
                    centerPadding: "60px"
                }
            }, {
                breakpoint: 720, // tablet
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    // dots: true,
                    arrows: true,
                    prevArrow: '<button class="carousel__link--prev"><span class="h-offscreen h-offscreen-focusable">Vorhergehendes Bild</span></button>',
                    nextArrow: '<button class="carousel__link--next"><span class="h-offscreen h-offscreen-focusable">Nächstes Bild</span></button>',
                    centerMode: false,
                    centerPadding: "60px"
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

    $(css.handles).on("touchstart", function () {
        $(this).removeClass("untouched");
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

