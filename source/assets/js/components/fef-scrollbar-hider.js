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

    let sbWidth = scrollbarWidth();

    $('.js-hide-scrollbars').each((i, elem) => {
        $(elem).find('.js-scroll-container').css({
            'height': `calc(100% + ${sbWidth}px)`,
            'width' : `calc(100% + ${sbWidth}px)`
        });
    });
}
