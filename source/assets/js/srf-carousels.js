import { KEYCODES } from './utils/fef-keycodes';

let $carousels = [];
let loadedCarousels = {};
let slidesPerScreen = 1;
let currentElement = null;

let css = {
    'containers': '.js-carousel',
    'handles': '.carousel__link--next, .carousel__link--prev'
};

export function init() {
    $carousels = $(css.containers);

    // prevent flicker effect on page load
    $carousels.on('init', function () {
        $(this).closest('.carousel-container').addClass('carousel-container--initialized');
        $(css.containers).css('visibility', 'visible');
    });

    // img carousels
    $.each($carousels, function (i, carousel) {
        let $carousel = $(carousel),
            id = $carousel.attr('id'),
            textNextImage = $carousel.data('i18n-text-next-images') || 'Nächstes Bild',
            textPreviousImage = $carousel.data('i18n-text-next-images') || 'Vorhergehendes Bild';

        loadedCarousels[id] = false;

        $carousel.slick({
            speed: 300,
            slidesToShow: 1,
            infinite: false,
            accessibility: false,
            focusOnChange: false,
            appendArrows: `#${id} .slick-list`,
            prevArrow: `<button class="carousel__link--prev"><span class="h-offscreen h-offscreen-focusable">${textPreviousImage}</span></button>`,
            nextArrow: `<button class="carousel__link--next carousel__link--waggle"><span class="h-offscreen h-offscreen-focusable">${textNextImage}</span></button>`,
            slide: '.js-carousel-item'
        });
        registerListener($carousel);
    });

    // video carousels
    $('.js-video-gallery').on('init', function (slick) {
        $(this).css('visibility', 'visible');
        // triggering a "recalculation of dots" (via "setPosition" below)
        $(window).trigger('resize');
    });

    // video carousel:
    $.each($('.js-video-gallery'), function (i, carousel) {
        let $carousel = $(carousel),
            id = $carousel.attr('id'),
            textNextSlide = $carousel.data('i18n-text-next-slide') || 'Nächster Slide',
            textPreviousSlide = $carousel.data('i18n-text-next-slide') || 'Vorhergehender Slide';

        loadedCarousels[id] = false;

        $carousel.slick({
            infinite: false,
            slide: '.js-carousel-item',
            slidesToShow: 1, // we need all dots - initially
            slidesToScroll: 1,
            accessibility: false,
            focusOnChange: false,
            appendArrows: '#' + id,
            dots: true,
            centerPadding: 0,
            variableWidth: true,
            prevArrow: `<button class="carousel__link--prev"><span class="h-offscreen h-offscreen-focusable">${textPreviousSlide}</span></button>`,
            nextArrow: `<button class="carousel__link--next"><span class="h-offscreen h-offscreen-focusable">${textNextSlide}</span></button>`
        });
    });

    // "position change" (resize page or "activate" slider in any way)
    $('.js-video-gallery').on('setPosition', function (slick) {
        slidesPerScreen = getNumberOfSlidesPerScreen();
        let slidesToShow = slidesPerScreen,
            $carousel = $(this),
            currentSlide = $carousel.slick('slickCurrentSlide');

        // button / dot text info for screenreaders, initial & on slide change
        if ($carousel.find('.slick-dots button').first().text() == '1' || currentElement != currentSlide) {
            addTextToDots($carousel);
            currentElement = currentSlide;
        }

        // if previous num. of slides shown != the num. we'll see now (window resize)
        if ($carousel.slick('slickGetOption', 'slidesToShow') != slidesToShow) {
            let screensToShow = Math.ceil($carousel.find('.js-carousel-item').length / slidesToShow);

            // desktop / more than one slide / arrows displayed
            if (slidesToShow > 1) {
                // slider not at initial pos.
                if (currentSlide > 0) {
                    // move it to 0 - so the "arrows" don't get "confused"
                    currentSlide = 0;
                    currentElement = currentSlide;
                    $carousel.slick('slickGoTo', currentSlide, true);
                }

                // disabling dots if arrows present (accessibility)
                hideDotsFromScreenReader($carousel);

                // no right arrow when at the rightmost position within the carousel
                handleRightArrow($carousel, currentSlide, screensToShow);
            }

            // adjust num. of dots (after resize)
            rePaintDots($carousel, screensToShow);

            // adjust num. of slides per page
            $carousel.slick('slickSetOption', 'slidesToShow', slidesToShow, false);
            $carousel.slick('slickSetOption', 'slidesToScroll', slidesToShow, false);
        }

        // remove not currently visible slides from tabindex
        changeTabIndexIfNotVisible($carousel, slidesPerScreen, currentElement);

    }).on('afterChange', function (slick, currentSlide) {
        // as soon as slick's ready, we put the focus on the current elm
        if (slidesPerScreen > 1) {
            $(this).find('.slick-current > a').focus();
        }
    }).on('click', 'a', function (e) {
        // unfortunately $carousel.slick('slickSetOption', 'focusOnSelect', ...); cannot be set 'on the fly' :/

        if (e.type == 'click' && slidesPerScreen === 1) {
            /// vo has a crazy problem: it fires click for the video left to the 'selected' one - from the 3rd on
            gotTo($(this)); // enable selecting 'barely visible next video'
        }
    }).on('keyup', 'a', function (e) {
        // someone is tabbing => clicked <enter> (desktop)
        if (e.keyCode === KEYCODES.enter) {
            $(this).trigger('click');
        }
    }).on('keyup', '.carousel__link--next', function (e) { // this is too late!
        // someone is tabbing => clicked <enter> on the arrow going to the next page
        if (e.keyCode === KEYCODES.enter) {
            // we select the first video-link available on the page
            $(this).closest('.js-video-gallery').find('.slick-current > a').focus();
        }
    });
}

function changeTabIndexIfNotVisible($carousel, slidesPerScreen, currentElement) {
    // unhide the following slidesToShow - 1 from screenreaders as well:
    let currentPage = Math.floor(currentElement / slidesPerScreen) + 1,
        to = (slidesPerScreen * currentPage) - 1, // zero indexed
        from = to - (slidesPerScreen - 1);

    $carousel.find('.js-carousel-item').each((i, carouselItem) => {
        let isVisible = i >= from && i <= to;

        $(carouselItem).attr('aria-hidden', !isVisible).find('a').attr('tabindex', isVisible ? 0 : -1);
    });
}

function gotTo($selectedLink) {
    $selectedLink.closest('.js-video-gallery')
        .slick('slickGoTo', $selectedLink.closest('.js-carousel-item').data('slick-index'));
}

function registerListener($carousel) {
    // load all images after user starts interacting with carousel
    $carousel.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
        if (loadedCarousels[$carousel.attr('id')] === false) {
            loadedCarousels[$carousel.attr('id')] = true;
            loadLazyImages(slick.$slides.find('.image-figure__js'));
        }
    }).on('swipe', function (event, slick, direction) {
        // on 'interacting' with the carousel => no more animation
        $(this).find('.carousel__link--next').removeClass('carousel__link--waggle');
    });

    $carousel.find(css.handles).on('touchstart mousedown mouseenter', function (e) {
        // if the handles are clicked / touched: stop the animation
        $(this).removeClass('carousel__link--waggle');
        $(e.target).removeClass('untouched');
        console.log($(e.target));
    }).on('touchend touchcancel', function (e) {
        console.log('is untouched');
        console.log($(e.target));
        $(e.target).addClass('untouched');
    });
}

function loadLazyImages($images) {
    $images.each((i, image) => {
        let $image = $(image);

        if ($image.data('src')) {
            $image.attr({
                'srcset':  $image.data('srcset'),
                'sizes': $image.data('sizes'),
                'src': $image.data('src')
            });
        }
    });
}

function rePaintDots($carousel, screensToShow) {
    if (screensToShow > 1) {
        $carousel.find('.slick-dots').removeClass('h-element--hide');
        let x = screensToShow + 1;
        $carousel.find('.slick-dots li').removeClass('h-element--hide');
        // adding text to dots
        addTextToDots($carousel);
        $carousel.find('.slick-dots li:nth-child(1n + ' + x + ')').addClass('h-element--hide');
    } else {
        $carousel.find('.slick-dots').addClass('h-element--hide');
    }
}

function addTextToDots($carousel) {
    $carousel.find('.slick-dots li').each(function (i) {
        let $elm = $(this),
            dotText = $elm.hasClass('slick-active') ? $carousel.data('dot-current') : `${i+1}. ${$carousel.data('dot-info')}`;

        $elm.find('button').text(dotText);

        // reenabling dots for mobile
        if (slidesPerScreen === 1) {
            showDotsToScreenReader($elm);
        }
    });
}

function showDotsToScreenReader($list) {
    $list.attr('aria-hidden', false).find('button').attr({
        'tabindex': '0',
        'aria-hidden': false,
        'role': 'button'
    });
}

function hideDotsFromScreenReader($carousel) {
    $carousel.find('.slick-dots button').attr({
        'tabindex': '-1',
        'aria-hidden': true,
        'role': 'presentation'
    });
}

/**
 * The right arrow (>) of the carousel should be hidden if the last "page" was reached.
 *
 * @param $carousel
 * @param currentSlide
 * @param screensToShow
 */
function handleRightArrow($carousel, currentSlide, screensToShow) {
    let hideRightArrow = (currentSlide + 1) === screensToShow;

    $carousel.find('.carousel__link--next')
        .toggleClass('h-element--hide', hideRightArrow)
        .attr('aria-disabled', hideRightArrow);
}

function getNumberOfSlidesPerScreen() {
    let slidesToShow = 1; // mobile

    if (matchMedia('screen and (min-width: 720px) and (max-width: 1023px)').matches) {
        slidesToShow = 2; // tablet
    } else if (matchMedia('screen and (min-width: 1024px)').matches) {
        slidesToShow = 3; // larger
    }
    return slidesToShow;
}
