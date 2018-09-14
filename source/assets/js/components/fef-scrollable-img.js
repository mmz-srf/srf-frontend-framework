export function init() {
    $('.js-scrollable-img').each((index, elem) => {
        new FefScrollableImg($(elem));
    });
}

export class FefScrollableImg {
    constructor($element) {
        $element.on('scroll', () => {
            $element.addClass('scrollable-img--scrolled');
            $element.off('scroll');
        });
    }
}
