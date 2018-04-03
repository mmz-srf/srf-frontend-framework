export function init() {
    let SrfStickyHeader = {};

    $(document).ready(function () {
        SrfStickyHeader.stickyHeader = new stickyHeader();
        SrfStickyHeader.stickyHeader.init();
    });
}

let stickyHeader = function () {
    let that = this;

    this.init = function () {
        $("[data-smart-affix]").affix({offset:{top: this.getCorrectOffset()}});

        var lastScrollTop = 0;
        $(window).scroll(function(event){
            var st = $(this).scrollTop();

            if (st < lastScrollTop) {
                $('.affix').css('margin-top', '0');
            } else {
                $('.affix').css('margin-top', '-120px');
            }
            lastScrollTop = st;
        });
    };

    this.getCorrectOffset = function () {
        return $("[data-smart-affix-placeholder]").offset().top + $(window).scrollTop();
    };

};
