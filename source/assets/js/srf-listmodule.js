import { DOM_MUTATION_EVENTS } from './utils/fef-events';

export function init() {
    $(window).on(DOM_MUTATION_EVENTS, () => {
        let $listElements = $('.listing-item');

        $listElements
            .filter((_, element) => !$(element).data('listmodule-initialized'))
            .each((_, element) => {
                let $listElement = $(element),
                    $mediaCaption = $listElement.find('.media-caption__source');

                if ($mediaCaption.hasClass('media-caption__source--video') || $mediaCaption.hasClass('media-caption__source--audio')) {
                    $listElement.find('.infoline').html($mediaCaption.html());
                } else {
                    $listElement.find('.infoline-source').html($mediaCaption.html());
                }

                // mark element, so that it won't be initialized again by this module
                $listElement.data('listmodule-initialized', true);
            });
    });
}
