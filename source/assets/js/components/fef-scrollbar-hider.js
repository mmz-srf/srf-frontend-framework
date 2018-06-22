export function init() {
    function scrollbarWidth() {
        let div = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div>');
        $('body').append(div);
        let w1 = $('div', div).innerWidth();
        div.css('overflow-y', 'scroll');
        let w2 = $('div', div).innerWidth();
        $(div).remove();

        return (w1 - w2);
    }

    const value = `calc(100% + ${scrollbarWidth()}px)`;

    $('.js-hide-scrollbars').each((i, elem) => {
        let direction = $(elem).data('direction'),
            styles = {};

        if (direction === 'both' || direction === 'vertical') {
            styles.width = value;
        }
        if (direction === 'both' || direction === 'horizontal') {
            styles.height = value;
        }

        $(elem).find('.js-scroll-container').css(styles);
    });
}
