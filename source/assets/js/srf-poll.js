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
                    // alert('Error occured');
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
            var $form = $(this).parents(".poll-wrapper")
                ,radioId = $(this).attr("id");
            if ($form.hasClass("poll--with-radios")) {
                // unmark the "radio"
                $form.find(".poll-option-label--selected")
                    .removeClass("poll-option-label--selected");

                var $errButton = $form.find(".submit-button--error");
                var $err = $form.find(".poll-form-handling__errors--onerror");
                // if there was a previous err
                if ($err.length) {
                    // remove err colour from button
                    // $errButton.removeClass("submit-button--error");
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
            var $poll = $(this)
                , pollId = $poll.attr("id")
                , optionId = $poll.find(".poll-option__radio:checked").attr("id");

            // currently err = no option chosen
            if (that.hasErrors($poll, optionId)) {
                return false;
            } // else ...

            // find the selected button index
            var radioIndex = 0 // this is hopefully temporary ...?
                , winner, mostVotes = 0;
            $poll.find("input[type=radio]").each(function (i) {
                // which one (nr) is it?
                if ($(this).attr("id") == optionId) {
                    radioIndex = i;
                    // adjust selected vote
                    that.polls[pollId].data[radioIndex]++
                }
                // find the current winner
                /* if (mostVotes < that.polls[pollId].data[i]) {
                    mostVotes = that.polls[pollId].data[i];
                    winner = i;
                } */
            });

            mostVotes = Math.max.apply( null, that.polls[pollId].data );

            // tbd: send data .. :)
            // selected id was optionId / radioIndex ...?

            // total number of votes
            var total = that.getTotalVotes(that.polls[pollId].data);
            // some visual trickery ...
            $poll.find(".poll").removeClass("poll--setup").addClass("poll--submitted");
            // ??
            if ($poll.find(".poll").hasClass("poll--with-media")) {
                $poll.find(".article-media--image").removeClass("article-media--image");
            }
            $poll.find(".poll-form-handling__roundup").show()
                .find("strong").text(total);
            $poll.find(".submit-button").remove();

            var width, percent, opacity = 0;
            $poll.find("li").each(function (i) {
                percent = that.polls[pollId].data[i] / total;
                width = parseInt(percent * 100, 10);
                opacity = (that.polls[pollId].data[i] === mostVotes) ? .7 : .4;

                var $element = $(this);
                $element.find(".poll-option__radio").remove();
                $element.find(".poll-option-label").remove();
                $element.find(".poll-option-rating__bg-color")
                    .animate({
                        // "background-color": "rgba(201,16,36, " + percent + ")",
                        opacity: opacity, // percent,
                        width: width + "%"
                    }, 3000, function() {
                        // Animation complete
                    });

                $element.find(".poll-option-rating__percent strong").text(width);
            });
            return false;
        });
    };

    this.getTotalVotes = function (data) {
        var total = 0;
        $.each( data, function( index, value ) {
            total = total + value;
        });
        return total;
    };

    this.hasErrors = function ($poll, optionId) {
        if (optionId === undefined) {
            // $poll.find(".submit-button").addClass("submit-button--error");
            var errMsg = "Bitte wählen Sie eine Option aus."; // todo: translate!
            $poll.find(".poll-form-handling__errors")
                .addClass("poll-form-handling__errors--onerror")
                .text(errMsg);
            return true;
            // anything else?
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

