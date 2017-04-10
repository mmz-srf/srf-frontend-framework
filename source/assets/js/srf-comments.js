export function init() {

    var SrfComments = {};
    $(document).ready(function () {
        SrfComments.commentController = new commentController();
        SrfComments.commentController.init();
    });
}

var commentController = function () {
    var that = this;
    this.max_input = 500;

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
        $(document).on('login:checked', function(){
            // hide the button
            $(".comments-header__button").addClass("comment--hide");
            // move the form
            $(".js-comment_place").removeClass("comment--hide")
                .appendTo(".comments-header__placeholder");
            // set the focus
            $(".reply__textarea").val("").focus();

            // this goes cms ... as soon ...
            $(".js-comment_user_email").val("user@somewhere.ch"); // <-- TODO
            $(".js-comment_user_name").val("Kurt Ischfurt"); // <-- TODO
            $(".js-comment_user_nickname").val("dekurtischfurt"); // <-- TODO
            $(".js-comment_user_city").val("dadaenk"); // <-- TODO

            return false;
        });

        // movable comment
        $(".comment__link--reply").on("click", function (e) {
            e.preventDefault();
            // hide main comment again (if there was one)
            $(".comments-header__button").removeClass("comment--hide");

            var parent_id = $(this).parent("li").prop("id");

            // move the form
            $(".js-comment_place").removeClass("comment--hide")
                .appendTo("#" + parent_id.replace("comment", "placeholder"));
            // set the focus
            $(".reply__textarea").val("").focus();

            parent_id = parent_id.split("_")[1];
            $(".js-comment_parent_id").val(parent_id);

            // this goes cms ... as soon ...
            $(".js-comment_user_email").val("user@somewhere.ch"); // <-- TODO
            $(".js-comment_user_name").val("Kurt Ischfurt"); // <-- TODO
            $(".js-comment_user_nickname").val("dekurtischfurt"); // <-- TODO
            $(".js-comment_user_city").val("dadaenk"); // <-- TODO

            return false;
        });
    };

    this.countChars = function ($textarea) {
        var len = $textarea.val().length
            , $button = $(".button");

        // count up available chars
        $(".js-comment-count-up").text(this.max_input - len);

        if (len === 0 || len > this.max_input) { // no more space available
            // disable submit button
            $button.attr("disabled", true).addClass("button--inactive");
            if (len > this.max_input) {
                $(".reply-info__count").addClass("reply-info__count--warn");
            }

        } else { // space available
            // reset all
            $button.attr("disabled", false).removeClass("button--inactive");
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