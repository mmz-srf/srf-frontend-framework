export function init() {
    $(document).ready(function() {
        let listElements = $('.listing-item');
        listElements.each(function () {
            let mediaCaption = $(this).find('.media-caption__source');
            if (mediaCaption.hasClass('media-caption__source--video') || mediaCaption.hasClass('media-caption__source--audio')) {
                $(this).find('.infoline').html(mediaCaption.html());
            } else {
                $(this).find('.infoline-source').html(mediaCaption.html());
            }
        });
    });
}
