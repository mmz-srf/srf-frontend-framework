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
                    prevArrow: '<a href="#" class="carousel__link--prev" />',
                    nextArrow: '<a href="#" class="carousel__link--next" />',
                    centerMode: false
                }
            }, {
                breakpoint: 720, // tablet
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    dots: true,
                    arrows: true,
                    prevArrow: '<a href="#" class="carousel__link--prev" />',
                    nextArrow: '<a href="#" class="carousel__link--next" />',
                    centerMode: false
                }
            }
        ]
    });
}

