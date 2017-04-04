export function init() {

    var SrfComments = {};
    $(document).ready(function () {
        SrfComments.commentController = new commentController();
        SrfComments.commentController.init();
    });
}

var commentController = function () {
    var that = this;
    this.max_input = 70;

    this.init = function () {

        $(".reply__textarea").on("keyup focus", function (e) {
            that.countChars($(this));
        }).on("focusin", function () {
            $(".reply").addClass("reply--on-focus");
        }).on("focusout", function () {
            $(".reply").removeClass("reply--on-focus");
        }).on({
            "scroll": that.handleScroll,
            "input": that.handleInput
        });

        // main (top) comment
        $(".comments-header__button").on("click", function (e) {
            e.preventDefault();
            // hide the button
            $(this).addClass("comment--hide");
            // move the form
            $(".js-comment_place").removeClass("comment--hide")
                .appendTo(".comments-header__placeholder");
            // set the focus
            $(".reply__textarea").val("").focus();

            // set default ==> no reply but a comment
            $(".js-comment_reply_to").val(0);

            // animating :/
            /* $(".reply__textarea")
             .removeClass("reply--mini")
             .addClass("reply--size-up"); */
            return false;
        });

        // movable comment
        $(".comment__link--reply").on("click", function (e) {
            // hide main comment again (if there was one)
            $(".comments-header__button").removeClass("comment--hide");

            var parent_id = $(this).parent("li").prop("id");
            // move the form
            $(".js-comment_place").removeClass("comment--hide")
                .appendTo("#" + parent_id.replace("comment", "placeholder"));
            // set the focus
            $(".reply__textarea").val("").focus();

            // if it's a reply ==> reply_to has a number > 0 (default)! <== depth = 1
            $(".js-comment_reply_to").val(parent_id);

            // cms
            $(".js-comment_user_email").val("user@somewhere.ch"); // <-- TODO
            $(".js-comment_user_name").val("Kurt Ischfurt"); // <-- TODO
            $(".js-comment_user_nickname").val("dekurtischfurt"); // <-- TODO
        });
    };

    this.countChars = function ($textarea) {
        var len = $textarea.val().length
            , $button = $(".submit-button");

        // count up available chars
        $(".js-comment-count-up").text(this.max_input - len);

        if (len === 0 || len > this.max_input) { // no more space available
            // disable submit button
            $button.attr("disabled", true).addClass("submit-button--inactive");
            if (len > this.max_input) {
                $(".reply-info__count").addClass("reply-info__count--warn");
            }

        } else { // space available
            // reset all
            $button.attr("disabled", false).removeClass("submit-button--inactive");
            $(".reply-info__count").removeClass("reply-info__count--warn");
        }
    };

    this.handleInput = function () {
        var text = $(".reply__textarea").val();
        var highlightedText = that.applyHighlights(text, text.length);
        $(".reply__highlights").html(highlightedText);
    };

    this.applyHighlights = function (text, length) {
        text = text
            .replace(/\n$/g, '\n\n');
        text = text.slice(0, this.max_input) + "<mark class=\"reply--overboard\">"
            + text.slice(this.max_input) + "</mark>";
        return text;
    };

    this.handleScroll = function () {
        var scrollTop = $(".reply__textarea").scrollTop();
        $(".reply__highlights").scrollTop(scrollTop);
    };
};