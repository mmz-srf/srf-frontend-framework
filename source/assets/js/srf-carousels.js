export function init() {
    $('.carousel__js').slick({
        speed: 300,
        slidesToShow: 1,
        prevArrow: '<a href="#" class="carousel__link--prev" />', // slick does this the wrong way around!
        nextArrow: '<a href="#" class="carousel__link--next" />',
        slide: ".carousel__item",
        lazyLoad: "ondemand"
    });

}

