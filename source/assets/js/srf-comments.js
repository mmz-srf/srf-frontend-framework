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
        }).on({
            "scroll": that.handleScroll,
            "input": that.handleInput
        });

        // todo: handle main (on top)
        $(".comment__link--reply").on("click", function (e) {
            var parent_id = $(this).parent("li").prop("id");
            $("#comment_form").removeClass("comment--hide") // <-- TODO
                .appendTo("#" + parent_id.replace("comment", "placeholder"));

            // what do we save here???
            $("#comment_reply_to").val(parent_id);
            // user id
            $("#comment_user_email").val("user@somewhere.ch"); // <-- TODO
            // which article does the comment belong to?
            $("#comment_node_id").val("123456"); // <-- TODO
            var depth = 0;
            if ($(this).closest(".comments").attr("class").indexOf("replies") > -1) {
                depth = 1;
            }
            $("#comment_reply_depth").val(depth); // <-- TODO
        });
    };

    this.countChars = function ($textarea) {
        var len = $textarea.val().length
            , $button = $(".submit-button");

        // count up available chars
        $(".js-comment-count-up").text(this.max_input - len);

        if (len > this.max_input) { // no more space available
            // disable submit button
            $button.attr("disabled", true).addClass("submit-button--inactive");
            $(".reply-info__count").addClass("reply-info__count--warn");

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
        var substring = text.substring(this.max_input - 1, length);
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