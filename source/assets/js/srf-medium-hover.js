/*
 * This file handles the hover state of a medium molecule.
 * It can also be used on a media-still molecule if it is used as a standalone (=not a child of a medium) molecule.
 */

export function init() {
    // making sure that the binding only occurs once per molecule
    $('.js-medium-hover .js-medium-hover').removeClass('js-medium-hover');

    // hover for medium element
    $('.js-medium-hover').on('mouseenter', function (){
        let $element = $(this);
        $element.find('.media-caption').addClass('media-caption--hover');
        $element.find('.play-icon-ng').addClass('play-icon-ng--hover');
        $element.find('.media-still__image').addClass('media-still__image--hover');
    });
    $('.js-medium-hover').on('mouseleave', function (){
        let $element = $(this);
        $element.find('.media-caption').removeClass('media-caption--hover');
        $element.find('.play-icon-ng').removeClass('play-icon-ng--hover');
        $element.find('.media-still__image').removeClass('media-still__image--hover');
    });
}