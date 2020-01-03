export function init() {

    // hover over image must also activate hover state of the play-button and vice versa
    $('.js-media-still').on('mouseenter mouseleave', (e) => {
        $(e.currentTarget).closest('.js-media-still').find('.play-icon').toggleClass('play-icon--hover');
    });

    $('.js-media-still .play-icon').on('mouseenter mouseleave', (e) => {
        $(e.currentTarget).closest('.js-media-still').find('.media-still__image').toggleClass('media-still__image--hover');
    });
}
