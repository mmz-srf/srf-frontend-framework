import { DOM_MUTATION_EVENTS } from './utils/fef-events';

export function init() {
    $(window).on(DOM_MUTATION_EVENTS, () => {
        let $listElements = $('.listing-item');

        $listElements.each(function () {
            // only initialize each list module once
            if ($(this).data('listmodule-initialized')) {
                return;
            }

            let $mediaCaption = $(this).find('.media-caption__source');

            if ($mediaCaption.hasClass('media-caption__source--video') || $mediaCaption.hasClass('media-caption__source--audio')) {
                $(this).find('.infoline').html($mediaCaption.html());
            } else {
                $(this).find('.infoline-source').html($mediaCaption.html());
            }

            // mark element, so that it won't be initialized again by this module
            $(this).data('listmodule-initialized', true);
        });
    });
}
