export function init() {
    $('.srf-carousel').slick({
        speed: 300,
        slidesToShow: 1,
        prevArrow: '<a href="#" class="gallery__link--prev" />', // slick does this the wrong way around!
        nextArrow: '<a href="#" class="gallery__link--next" />',
        slide: ".gallery__item",
        lazyLoad: "ondemand"
    });

}

