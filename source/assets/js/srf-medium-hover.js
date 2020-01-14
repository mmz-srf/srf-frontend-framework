/*
 * This file handles the hover state of a medium molecule.
 * It can also be used on a media-still molecule if it is used as a standalone (=not a child of a medium) molecule.
 */

const HOOK_SELECTOR_CLASS = 'js-medium-hover',
    HOOK_SELECTOR = '.' + HOOK_SELECTOR_CLASS;

export function init() {
    // making sure that the binding only occurs once per molecule
    $(HOOK_SELECTOR + ' ' + HOOK_SELECTOR).removeClass(HOOK_SELECTOR_CLASS);

    // no hover on 'medium--no-hover' elements
    // (HOOK_SELECTOR_CLASS and medium--no-hover shouldn't be used on the same element anyway
    //  but sometimes its too cumbersome to implement in FEF/patternlab)
    $(HOOK_SELECTOR + '.medium--no-hover').removeClass(HOOK_SELECTOR_CLASS);

    // hover for medium element
    $(document).on('mouseenter', HOOK_SELECTOR, (event) => {
        let $element = $(event.target).closest(HOOK_SELECTOR);
        $element.find('.media-caption').addClass('media-caption--hover');
        $element.find('.play-icon').addClass('play-icon--hover');

        // option to disable the hover state of the media still
        let disableStillHover = $element.data('disable-still-hover') || false;

        if(disableStillHover) {
            $element.find('.media-still__image').addClass('media-still__image--no-hover');
        }
        else {
            $element.find('.media-still__image').addClass('media-still__image--hover');
        }
    });

    $(document).on('mouseleave', HOOK_SELECTOR, (event) => {
        let $element = $(event.target).closest(HOOK_SELECTOR);
        $element.find('.media-caption').removeClass('media-caption--hover');
        $element.find('.play-icon').removeClass('play-icon--hover');
        $element.find('.media-still__image').removeClass('media-still__image--hover');
    });
}
