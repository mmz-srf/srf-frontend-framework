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
        // also radio!
        var that = this; // todo: click => ...

        // mark as "checked"
        $('.poll-option__radio').on('click', function(e) {
            $(".poll-option-label[for=" + $(this).attr("id") + "]").addClass("poll-option-label--selected");
        });

        // should work on submit submit - not on click!!
        $('.poll-wrapper').on('submit', function(e) {
            // formerly:
            // $('.poll-option__radio').on('click', function() { // this is probably not it
            var $poll = $(this) // .parents(".poll-wrapper")
                , pollId = $poll.attr("id")
                , optionId = $poll.find(".poll-option__radio:checked").attr("id");

            // currently err = no option chosen => future: no service available...
            if (that.hasErrors($poll, optionId)) {
                return false;
            } // else ...

            $poll.find(".poll-option__radio:checked").addClass("poll-option-label--selected");

            // this is hopefully temporary ...?
            var qIndex = 0;
            $poll.find("input[type=radio]").each(function (i) {
                // which one (nr) is it?
                if ($(this).attr("id") == optionId) {
                    qIndex = i;
                }
            });

            // tbd: send data .. :)
            // selected id was optionId / qIndex ...?

            // adjust selected vote
            that.polls[pollId].data[qIndex]++;

            // total number of votes
            var total = that.getTotalVotes(that.polls[pollId].data);
            $poll.find(".poll").removeClass("poll--setup").addClass("poll--submitted");
            $poll.find(".poll-form-handling__roundup").show().find("strong").text(total);
            $poll.find(".submit-button").remove();

            var width, percent = 0;
            $poll.find("li").each(function (i) {
                percent = that.polls[pollId].data[i] / total;
                width = parseInt(percent * 100, 10);
                var $element = $(this);

                // as wrapper in answer mode...
                $element.find(".poll-option-label").remove();
                $element.find(".poll-option-rating__bg-color")
                    .animate({
                        // "background-color": "rgba(201,16,36, " + percent + ")",
                        opacity: percent,
                        width: width + "%"
                    }, 3000, function() {
                        // Animation complete
                    });

                $element.find(".poll-option-rating__percent strong").text(width);
                // the radio is already hidden ... (accessibility???)
            });
            // on submit
            // e.stopPropagation();
            // e.preventDefault();
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
            $poll.find(".submit-button").addClass("submit-button--error");
            var errMsg = "Bitte wählen Sie eine Option aus."; // todo: translate!
            $poll.find(".poll-form-handling__errors")
                .addClass("poll-form-handling__errors--onerror")
                .text(errMsg);
            // e.preventDefault();
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

