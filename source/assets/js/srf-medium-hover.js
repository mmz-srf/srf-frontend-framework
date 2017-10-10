/*
 * This file handles the hover state of a medium molecule.
 * It can also be used on a media-still molecule if it is used as a standalone (=not a child of a medium) molecule.
 */

export function init() {
    // making sure that the binding only occurs once per molecule
    $('.js-medium-hover .js-medium-hover').removeClass('js-medium-hover');

    // hover for medium element
    $('.js-medium-hover').on('mouseenter mouseleave', function (){
        let $element = $(this);
        $element.find('.media-caption').toggleClass('media-caption--hover');
        $element.find('.play-icon-ng').toggleClass('play-icon-ng--hover');
        $element.find('.media-still__image').toggleClass('media-still__image--hover');
    });
}