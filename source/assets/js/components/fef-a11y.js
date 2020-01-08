export function init() {
    enableSkiplinks();
}


/**
 * Some browsers do not fully support in-page links. While they may visually shift focus to the location
 * of the target or named anchor for the “skip” link, they do not actually set keyboard focus to this location.
 *
 * https://www.bignerdranch.com/blog/web-accessibility-skip-navigation-links/
 */
export function enableSkiplinks() {
    $('.js-skiplink')
        .filter((_, element) => !$(element).data('skiplink'))
        .each((_, element) => {
            let $skiplink = $(element);

            // flag link to inform about manipulation of the link
            // and so that it won't be initialized again
            $skiplink.attr('data-skiplink', 'true');
        
            $skiplink.on('click', function() {
                let skipTo = '#' + this.href.split('#')[1];
                setFocus($(skipTo));
            });
        });
}

/**
 * Sets the focus correct to the location of the target (not only visually).
 *
 * @param $element jQuery.Element
 */
export function setFocus($element) {
    $element.attr('tabindex', -1).on('blur focusout', () => {
        $element.removeAttr('tabindex');
    }).get(0).focus({preventScroll: true});
}
