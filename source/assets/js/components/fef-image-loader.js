import {FefDebounceHelper} from '../classes/fef-debounce-helper';

/**
 * Gets the image from a source element and adds it as a background image to
 * a target element.
 * Reason: we use srcsets, which can't be used as background images. To
 * still be able to use the best picture, we have to resort to this solution.
 */

const IMAGE_TARGET_CLASS = 'js-image-loader';
const IMAGE_SOURCE_CLASS = 'js-image-loader-source';
const DEBOUNCETIME = 500;

export function init() {

    $(`.${IMAGE_TARGET_CLASS}`).each((_, targetComponent) => {
        const $target = $(targetComponent);
        const $source = $(`.${IMAGE_SOURCE_CLASS}`, $target);

        if (!$source) {
            return;
        }

        // re-do the image application on resize when srcsets are supported
        if ($source.prop('currentSrc')) {
            $(window).on('resize', FefDebounceHelper.debounce(() => applyBackgroundImage($source, $target), DEBOUNCETIME));
        }

        applyBackgroundImage($source, $target);
    });
}

function applyBackgroundImage($source, $target) {
    let imgSource;

    if ($source.prop('currentSrc')) {
        imgSource = $source.prop('currentSrc');
    } else {
        imgSource = $source.prop('src');
    }
    
    $target.css('background-image', `url(${imgSource})`);
}
