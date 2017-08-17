export function init() {
    var srfPoll = {};
    $(document).ready(function() {
        srfPoll.pollControl = new pollController();
        srfPoll.pollControl.init();
    });
}

var pollController = function() {
    var that = this;
    this.polls = {};

    this.init = function() {
        this.loadData();
        this.initObservers();
    };

    this.loadData = function() {
        $('.poll-wrapper').each(function() { // every form
            var pollId = $(this).attr("id");
            $.ajax({
                url: $("#" + pollId).data('src'),
                type: "GET",
                dataType: "json",
                success: function(data) {
                    that.polls[pollId] = new Poll(pollId, data);
                },
                error: function() {
                }
            });
        });
    };

    this.initObservers = function() {
        var that = this;

        // tabbing for desktop
        $(".poll-option__radio").on("keypress", function(e) {
            // enable checking radios by tabbing in + <enter>
            if (e.keyCode === 13) {
                $(this).prop('checked', true).trigger("poll_radio_check");
                return false;
            }

        }).on("change poll_radio_check", function(e) {
            var $form = $(this).parents(".poll-wrapper"),
                radioId = $(this).attr("id");

            if ($form.hasClass("poll--with-radios")) {
                // unmark the "radio"
                $form.find(".poll-option-label--selected")
                    .removeClass("poll-option-label--selected");

                var $err = $form.find(".poll-form-handling__errors--onerror");
                // if there was a previous err
                if ($err.length) {
                    // remove err msg
                    $err.removeClass("poll-form-handling__errors--onerror")
                        .text("");
                }
                // mark (visually) selected "radio"
                $form.find(".poll-option-label[for=" + radioId + "]")
                    .addClass("poll-option-label--selected");
            } else { // polls without radios submit form immediately
                $form.submit();
            }
        });

        $(".poll-wrapper").on("submit", function(e) {
            let $poll = $(this),
                pollId = $poll.attr("id"),
                selectedOptionId = $poll.find(".poll-option__radio:checked").attr("id");

            // currently err = no option chosen
            if (that.hasErrors($poll, selectedOptionId)) {
                return false;
            }

            // find the selected button index
            let radioIndex = 0,
                winner,
                mostVotes = 0;

            $poll.find("input[type=radio]").each(function (i) {
                // which one (nr) is it?
                if ($(this).attr("id") == selectedOptionId) {
                    radioIndex = i;
                    // adjust selected vote
                    that.polls[pollId].data[radioIndex]++
                }

                // find the current winner
                if (mostVotes < that.polls[pollId].data[i]) {
                    mostVotes = that.polls[pollId].data[i];
                    winner = i;
                }
            });

            // mark selected option
            $poll.find(".poll-option-label[for=" + selectedOptionId + "]")
                .parent().find(".poll-option-rating")
                .addClass("poll-option-rating--selected");

            // total number of votes
            let total = that.getTotalVotes(that.polls[pollId].data);
            let widths = that.calcWidths($poll, total);

            if ($poll.hasClass("poll--with-radios")) {
                $poll.find(".button").val("✔")
                    .text("Danke")
                    .addClass("button--success")
                    .delay(900)
                    .fadeOut(375, () => {
                        $poll.fadeOut(200, () => {
                            that.prepareBars($poll, widths, winner);
                            that.visualTrickery($poll);
                        }).fadeIn(100, () => {
                            that.animateBars($poll, widths);
                            that.showVoteTotal($poll, total);
                        });
                    });
            } else {

                that.prepareBars($poll, widths, winner);
                that.visualTrickery($poll);
                that.animateBars($poll, widths);
                that.showVoteTotal($poll, total);
            }
            return false;
        });
    };

    this.visualTrickery = function($poll) {
        // some visual trickery ...
        $poll.removeClass("poll--setup").addClass("poll--submitted");

        if ($poll.hasClass("poll--with-media")) {
            $poll.find(".article-media--image").removeClass("article-media--image");
        }
    };


    this.calcWidths = function($poll, total) {
        let widths = [];
        let pollId = $poll.attr("id");

        $poll.find("li").each((i) => {
            widths[i] = Math.round(that.polls[pollId].data[i] * 100 / total);
        });

        return widths;
    };

    this.prepareBars = function($poll, widths, winner) {

        $poll.find("li").each(function (i) {
            let $element = $(this);

            $element.find(".poll-option__radio").remove();
            $element.find(".poll-option-label").remove();

            if (i === winner) {
                $element.find(".poll-option-rating__bg-color").addClass("poll-option-rating__bg-color--winner");
            }

            $element.find(".poll-option-rating__percent strong").text(widths[i]);
        });
    };

    this.showVoteTotal = function($poll, total) {
        let $roundUp = $poll.find(".poll-form-handling__roundup");

        $roundUp.find("strong").text(total);
        $roundUp.slideDown(200);
    };

    this.animateBars = function ($poll, widths) {
        let delay = 0;
        let animationDuration = 375;
        let delayIncrease = 225;

        $poll.find(".poll-option-rating__bg-color").each(function(i) {
            $(this).delay(delay).animate({
                width: widths[i] + "%"
            }, animationDuration);

            // move to the left & make invisible, show and after a delay (sync with bar-animation) show + slide to the right.
            $(this).closest(".poll-option-rating").find(".poll-option-rating__percent").css({
                opacity: 0,
                right: "+=20px"
            }).show().delay(delay).animate({
                opacity: 1,
                right: "-=20px"
            }, animationDuration);

            delay += delayIncrease;
        });
    };

    this.getTotalVotes = function (data) {
        let total = 0;
        $.each( data, function( index, value ) {
            total += value;
        });
        return total;
    };

    this.hasErrors = function ($poll, optionId) {
        if (optionId === undefined) {
            // $poll.find(".button").addClass("button--error");
            let errMsg = "Bitte wählen Sie eine Option aus."; // todo: translate!

            $poll.find(".poll-form-handling__errors")
                .addClass("poll-form-handling__errors--onerror")
                .text(errMsg);
            return true;
        } else {
            // remove err msg (whether it's there or not)
            $poll.find(".poll-form-handling__errors")
                .removeClass("poll-form-handling__errors--onerror")
                .text("");
            return false;
        }
    };

    function Poll(id, data) {
        this.id = id;
        this.data = data;
    }
};

