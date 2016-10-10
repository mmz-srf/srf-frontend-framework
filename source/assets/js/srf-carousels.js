export function init() {
    $('.carousel__js').slick({
        speed: 300,
        slidesToShow: 1,
        infinite: false,
        prevArrow: '<a href="#" class="carousel__link--prev" />', // slick does this the wrong way around!
        nextArrow: '<a href="#" class="carousel__link--next" />',
        slide: ".carousel__item",
        lazyLoad: "ondemand"
    });

    $('.video_carousel__js').slick({
        speed: 300,
        slidesToShow: 1,
        infinite: false,
        slide: ".carousel__item",
        lazyLoad: "ondemand",
        slidesToScroll: 1,
        dots: false,
        arrows: false,
        mobileFirst: true,
        centerMode: true,
        responsive: [
            {
                breakpoint: 974, // desktop
                settings: {
                    slidesToShow: 3, // 10min: ~50px
                    dots: true,
                    arrows: true,
                    prevArrow: '<a href="#" class="carousel__link--prev" />', // slick does this the wrong way around!
                    nextArrow: '<a href="#" class="carousel__link--next" />'
                }
            }, {
                breakpoint: 640, // tablet
                settings: {
                    slidesToShow: 2, // 10min: ~37px
                    dots: true,
                    arrows: true,
                    prevArrow: '<a href="#" class="carousel__link--prev" />', // slick does this the wrong way around!
                    nextArrow: '<a href="#" class="carousel__link--next" />'
                }
            }
        ]
    });
}

