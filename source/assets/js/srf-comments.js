export function init() {

    var SrfComments = {};
    $(document).ready(function () {
        SrfComments.commentController = new commentController();
        SrfComments.commentController.init();
    });
}

var commentController = function () {
    var that = this;

    this.init = function () {
        $(".reply__textarea").on("keyup", function (e) {
            that.countChars($(this));
        }).on("focus", function (e) { // initial (just in case there's already text)
            $(".reply-info__count").addClass("reply-info__count--show");
            that.countChars($(this));
        }).on("scroll", that.handleScroll);
    };

    this.countChars = function ($textarea) {
        var max = 70;
        var len = $textarea.val().length
            , $button = $(".submit-button");

        // count up available chars
        $(".js-comment-count-up").text(max - len);

        if (len > max) { // no more space available
            // disable submit button
            $button.attr("disabled", true).addClass("submit-button--inactive");
            $(".reply-info__count").addClass("reply-info__count--warn");

            // handling coloring
            that.handleInput();

        } else { // space available
            if ($button.attr("disabled")) {
                $button.attr("disabled", false);
            }
            $button.removeClass("submit-button--inactive");
            $(".reply-info__count").removeClass("reply-info__count--warn");
        }
    };

    this.handleInput = function () {
        var text = $(".reply__textarea").val();
        var highlightedText = that.applyHighlights(text, text.length);
        $(".reply__highlights").html(highlightedText);
    };

    this.applyHighlights = function (text, length) {
        var max = 70;
        var substring = text.substring(max - 1, length);
        text = text
            .replace(/\n$/g, '\n\n')
            .replace(substring, "<mark class=\"reply--overboard\">$&</mark>");
        return text;
    };

    this.handleScroll = function () {
        var scrollTop = $(".reply__textarea").scrollTop();
        $(".reply__highlights").scrollTop(scrollTop);
    };
};