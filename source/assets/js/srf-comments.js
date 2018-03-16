export function init() {

    let SrfComments = {};
    $(document).ready(function () {
        SrfComments.commentController = new commentController();
        SrfComments.commentController.init();
    });
}

let commentController = function () {
    let that = this;
    this.max_input = 500;

    this.init = function () {

        $('.js-article-comments').on('keyup focus input', '.reply__textarea', function (e) {
            that.countChars($(this));
        }).on('focusin', '.reply__textarea', function () {
            $('.reply').addClass('reply--on-focus');
        }).on('focusout', '.reply__textarea', function () {
            $('.reply').removeClass('reply--on-focus');
        }).on('input', '.reply__textarea', that.handleInput);

        $('.reply__textarea').on({
            'scroll': that.handleScroll
        });
    };

    this.countChars = function ($textarea) {
        let len = $textarea.val().length,
            $button = $('.js-article-comments .button');

        // count up available chars
        $('.js-comment-count-up').text(this.max_input - len);

        if (len === 0 || len > this.max_input) { // no more space available
            // disable submit button
            $button.attr('disabled', true).addClass('button--inactive');
            if (len > this.max_input) {
                $('.reply-info__count').addClass('reply-info__count--warn');
            }

        } else { // space available
            // reset all
            $button.attr('disabled', false).removeClass('button--inactive');
            $('.reply-info__count').removeClass('reply-info__count--warn');
        }
    };

    this.handleInput = function () {
        let text = $('.reply__textarea').val();
        let highlightedText = that.applyHighlights(text, text.length);
        $('.reply__highlights').html(highlightedText);
    };

    this.applyHighlights = function (text, length) {
        text = text
            .replace(/\n$/g, '\n\n');
        text = text.slice(0, this.max_input) + '<mark class="reply--overboard">'
            + text.slice(this.max_input) + '</mark>';
        return text;
    };

    this.handleScroll = function () {
        let scrollTop = $('.reply__textarea').scrollTop();
        $('.reply__highlights').scrollTop(scrollTop);
    };
};
