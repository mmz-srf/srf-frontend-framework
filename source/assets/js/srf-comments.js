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
            $(this).addClass("comment--hide");
            $(".reply").removeClass("comment--hide");
            $(".reply__textarea").focus();
            $(".submit-button").removeClass("comment--hide");
        });

        // movable comment
        $(".comment__link--reply").on("click", function (e) {
            // probably: hide main comment again!
            $(".comments-header__button").removeClass("comment--hide");
            var $mainForm = $(".comments--shrink"); // todo!
            $mainForm.find(".reply").addClass("comment--hide");
            $mainForm.find(".submit-button").addClass("comment--hide");

            var parent_id = $(this).parent("li").prop("id");
            // but for now:
            var $movableForm = $(".js-comment_place");
            $movableForm.find(".reply").removeClass("comment--hide");
            $movableForm.find(".reply__textarea").trigger("focus");
            $movableForm.find(".submit-button").removeClass("comment--hide");

            $(".js-comment_place").removeClass("comment--hide")
                .appendTo("#" + parent_id.replace("comment", "placeholder"));

            // what do we save here???
            $(".js-comment_reply_to").val(parent_id);
            // user id
            $(".js-comment_user_email").val("user@somewhere.ch"); // <-- TODO
            $(".js-comment_user_name").val("Kurt Ischfurt"); // <-- TODO
            $(".js-comment_user_nickname").val("dekurtischfurt"); // <-- TODO
            // which article does the comment belong to?
            // $("#comment_node_id").val("123456"); // <-- comes from article

            // cms?
            var depth = 0;
            if ($(this).closest(".comments").attr("class").indexOf("replies") > -1) {
                depth = 1;
            }
            $(".js-comment_reply_depth").val(depth); // <-- TODO
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