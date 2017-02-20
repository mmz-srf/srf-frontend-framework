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
        $('.poll-option__radio').on('click', function() { // canton select navigation
            // mark as "clicked"
            $(".poll-option-label[for=" + $(this).attr("id") + "]").addClass("poll-option-label--selected")
            var $poll = $(this).parents(".poll-wrapper");
            var pollId = $poll.attr("id");
            var optionId = $(this).attr("id");

            // this is hopefully temporary ...?
            var qIndex = 0;
            $poll.find("input[type=radio]").each(function (i) {
                // which (nr) one is it?
                if ($(this).attr("id") == optionId) {
                    qIndex = i;
                }
            });
            // tbd: send data .. :)

            // adjust selected vote
            that.polls[pollId].data[qIndex]++;

            // total number of votes
            var total = that.getTotalVotes(that.polls[pollId].data);

            // percent = that.polls[pollId].data[i] * 100 / total;
            var width, percent = 0;
            $poll.find("li").each(function (i) {
                percent = that.polls[pollId].data[i] / total;
                width = parseInt(percent * 100, 10);
                $(this).find(".poll-option-rating").show();
                $(this).find(".poll-option-rating__bg-color").css({
                    "width": width + "%",
                    "background-color": "rgba(201,16,36, " + percent + ")"
                }); // .addClass("poll-option-rating__bg-color--animate"); 

                $(this).find(".poll-option-rating__percent strong").text(width);
                // the radio is already hidden ... (accessibility???)
                $(this).find(".poll-option-label").hide();
            });

            // var $data = that.loadData(pollId);
            // console.log("data...",$data)
        });
    };

    this.getTotalVotes = function (data) {
        var total = 0;
        $.each( data, function( index, value ) {
            total = total + value;
        });
        return total;
    };

    function Poll(id, data) {
        this.id = id;
        this.data = data;
    }
};

