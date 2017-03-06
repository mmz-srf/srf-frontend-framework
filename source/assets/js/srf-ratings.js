export function init() {
    var srfRating = {};
    $(document).ready(function() {
        srfRating.ratingControl = new ratingController();
        srfRating.ratingControl.init();
    });
}

var ratingController = function() {
    var that = this;
    this.rating = {};

    /*
     // set global variables
     var getTotalVotes,
     getTotalStars,
     resultVote = 0,
     totalVotes = 0,
     totalStars = 0;
     */

    this.init = function() {
        this.loadData();
        this.initObservers();
    };

    this.loadData = function(dataJSONurl, ratingId) {
        // load ratings-results and process data
        /* $.getJSON(dataJSONurl, function(data) {
            console.log(data);
            that.rating[ratingId] = new Rating(ratingId, data);

            // getTotalVotes(data);
            // getTotalStars(data);
        });
        return that.rating; */
        // it's asynchronous !!

        $('.rating-wrapper').each(function() { // every form
            var ratingsId = $(this).attr("id");
            $.ajax({
                url: $("#" + ratingsId).data('src'),
                type: "GET",
                dataType: "json",
                success: function(data) {
                    that.rating[ratingsId] = new Rating(ratingsId, data);
                    that.rating[ratingsId].loadAnswers(ratingsId);
                },
                error: function() {
                    // alert('Error occured');
                }
            });
        });
    };

    this.initObservers = function() {
        var that = this;

        // if user hovers stars
        $('.ratingstars__star').on('mouseenter',function(e){
            var $that = $(this),
                thisStar = $that.parent().siblings('input').attr('value'),
                ratings_index = $that.parent().parent().attr('data-ratings_index'),
                answer_index = $that.parent().parent().attr('data-answer_index'),
                star_index = $that.parent().parent().attr('data-star_index');

            for (var i = 1; i <= thisStar; i++) {
                $('[data-ratings_index='+ratings_index+'][data-answer_index='+answer_index+'][data-star_index='+i+']').find('.ratingstars__star--'+ratings_index+'-'+answer_index+'-'+i).addClass('is-hover');
            }
        }).on('mouseleave',function(e){
            $('.ratingstars__star').removeClass('is-hover');
        });

        // if user clicks on radio-button
        $('.ratingstars-list input[type="radio"]').on('change', function(e) {
            /* var $that = $(this),
                myVote = $that.attr('value'),
                ratings_index = $that.parent().attr('data-ratings_index'),
                answer_index = $that.parent().attr('data-answer_index'),
                star_index = $that.parent().attr('data-star_index');

            // toggle all stars before and including the clicked one as active/inactive
            $('[data-ratings_index='+ratings_index+'][data-answer_index='+answer_index+']').find('.ratingstars__star').removeClass('is-active');
            for (var i = 1; i <= myVote; i++) {
                $('.ratingstars__star--'+ratings_index+'-'+answer_index+'-'+i).addClass('is-active');
            } */

        });

        // THIS IS NOT YET WORKING!!!
        // It's still the old version where the initial function was $('.ratingstars-list input[type="radio"]').on('change',function(e){…
        // Therefore here $that is still the changed radio-button, not the .submit-button
        // $('.submit-button').on('click', function(e) {
        $(".rating-wrapper").on("submit", function(e) {
            var $ratingContainer = $(this).closest(".rating-wrapper");
            // remove err msg
            that.handleErrors($ratingContainer, false);

            var rating_id = $ratingContainer.prop("id");
            var rating_index = rating_id.slice(-1)
                , answer_index, star_index = 0
                , tmp = 0
                , rated = 0;
            $.each(that.rating[rating_id].stars, function () {
                // do the dance ... if possible
                if (this.value !== undefined) {
                    tmp = this.value.split("-"); // bsp. this.value = "star1-2-3"
                    answer_index = tmp[1];
                    star_index = tmp[2];
                    that.doTheDance(rating_index, answer_index, star_index);
                    rated++;
                }
            });

            if (rated === 0) { //
                that.handleErrors($ratingContainer, true);
            }

            // ==> submit all votes!!!
            return false; // but nothing else

        });

        // on choosing a star
        $(".ratingstars__checkbox").on("click", function () {
            var $star = $(this);
            var $rating = $star.closest('.rating-wrapper');
            that.rating[$rating.prop("id")]
                .addVote($star.closest(".poll-option").prop("id"), $star.prop("id"));

            // moved from ... $('.ratingstars-list input[type="radio"]').on('change', function(e) { // !!!
            var $that = $(this),
                myVote = $that.attr('value'),
                ratings_index = $that.parent().attr('data-ratings_index'),
                answer_index = $that.parent().attr('data-answer_index'),
                star_index = $that.parent().attr('data-star_index');

            // toggle all stars before and including the clicked one as active/inactive
            $('[data-ratings_index='+ratings_index+'][data-answer_index='+answer_index+']').find('.ratingstars__star').removeClass('is-active');
            for (var i = 1; i <= myVote; i++) {
                $('.ratingstars__star--'+ratings_index+'-'+answer_index+'-'+i).addClass('is-active');
            }

        });
    };

    // contains submit... content ...
    this.doTheDance = function (ratings_index, answer_index, star_index) { // (ratingId) {
        // improvisation ...
        var $that = $("#ratings-ID" + ratings_index);
        var myVote = $that.find("#star" + ratings_index + "-" + answer_index + "-" + star_index).attr('value');
        var animeStarInit1 = '.animated .ratingstars__star--',
            animeStarInit2 = ' {animation-name:ratingAnime',
            animeStarName = '@keyframes ratingAnime',
            animeStarCode1 = '{0% {transform:translate3d(0,0,0) scale3d(1,1,1)} 33.334% {transform:translate3d(0,-12px,0) scale3d(1.125,1.125,1.125) rotateY(90deg);',
            animeStarCode2 = ' animation-timing-function:cubic-bezier(.175,.885,.3,1.75)} 100% {transform:translate3d(0,-12px,0) scale3d(.875,.875,.875) rotateY(180deg);animation-timing-function:cubic-bezier(.175,.885,.3,1.75);',
            animeStarOrigin = '',
            animeStarOrigin1 = 'transform-origin:75% 50%;',
            animeStarOrigin2 = 'transform-origin:62.5% 50%;',
            animeStarOrigin3 = 'transform-origin:50% 50%;',
            animeStarOrigin4 = 'transform-origin:37.5% 50%;',
            animeStarOrigin5 = 'transform-origin:25% 50%;',
            animeStarActive = 'fill:rgb(34,33,29);',
            animeStarNeutral = 'fill:rgb(185,183,173);',
            animeStarEnd = '}}',
            newStyle = '';

        var currentData = this.rating["ratings-ID" + ratings_index].stars["stars-ID" + ratings_index + answer_index].data;

        var total = that.getTotal(currentData);
        var totalStars = total[0]; // that.getTotalStars(currentData);
        var totalVotes = total[1]; // that.getTotalVotes(currentData);
        // calculate the rating-result (handling js + behaviour)
        var resultVote = 0.5 * Math.round((+totalStars + +myVote) / (+totalVotes + 1) / 0.5);

        // compose the keyframes
        for (var i = 1; i < 6; i++) {

            // set the transform-origin to the appropriate value for each star
            if (i == 1) {
                animeStarOrigin = animeStarOrigin1;
            } else if (i == 2) {
                animeStarOrigin = animeStarOrigin2;
            } else if (i == 3) {
                animeStarOrigin = animeStarOrigin3;
            } else if (i == 4) {
                animeStarOrigin = animeStarOrigin4;
            } else if (i == 5) {
                animeStarOrigin = animeStarOrigin5;
            }

            // compose the css-keyframe-code for all five individual stars … active or neutral
            // if (i <= Math.round(resultVote)) {
            if (i <= Math.round(resultVote)) {
                newStyle += animeStarInit1+ratings_index+'-'+answer_index+'-'+i+animeStarInit2+ratings_index+'-'+answer_index+'-'+i+'}'+animeStarName+ratings_index+'-'+answer_index+'-'+i+' '+animeStarCode1+animeStarOrigin+animeStarActive+animeStarCode2+animeStarOrigin+animeStarActive+animeStarEnd;
            } else {
                newStyle += animeStarInit1+ratings_index+'-'+answer_index+'-'+i+animeStarInit2+ratings_index+'-'+answer_index+'-'+i+'}'+animeStarName+ratings_index+'-'+answer_index+'-'+i+' '+animeStarCode1+animeStarOrigin+animeStarNeutral+animeStarCode2+animeStarOrigin+animeStarNeutral+animeStarEnd;
            }
        }
        that.animateStars(ratings_index, answer_index, myVote, resultVote, newStyle);
    };

    this.animateStars = function (ratings_index, answer_index, myVote, resultVote, newStyle) {
        var $ratingstarsContainer = $('#ratings-ID' + ratings_index);

        // add the keyframe-codes into a style-element and add it to the DOM
        $('<style id="ratingAnime'+ratings_index+'-'+answer_index+'" />').text(newStyle).insertAfter($ratingstarsContainer);

        // include Result- and myVote-Number to the DOM
        $('.resultWording--'+ratings_index+'-'+answer_index).addClass('animated');
        $('.resultWording--'+ratings_index+'-'+answer_index+' .resultNumber--js').text(resultVote);
        $('.resultWording--'+ratings_index+'-'+answer_index+' .myNumber--js').text(myVote);

        // add css-classes to trigger the animations
        $ratingstarsContainer.addClass('animated');
    };

    // process data to get total of votes
    this.getTotalVotes = function (data) {
        var totalVotes = 0;
        for (var i = 0; i < data.length; i++) { totalVotes += data[i]; }
        return totalVotes;
    };

    // process data to get total stars
    this.getTotalStars = function (data){
        var totalStars = 0;
        for (var i = 0; i < data.length; i++) { totalStars += data[i] * ( i + 1 ); }
        return totalStars;
    };

    this.getTotal = function (data) {
        var totalStars = 0
            , totalVotes = 0;
        for (var i = 0; i < data.length; i++) {
            totalStars += data[i] * ( i + 1 ); // totalStars
            totalVotes += data[i]; // totalVotes
        }
        return [totalStars, totalVotes];
    };

    this.handleErrors = function ($poll, hasError) {
        if (hasError) {
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

    function Rating(id, data) {
        this.id = id;
        this.data = data;
        this.stars = {};
        var reference = this;

        this.addVote = function(answerId, starId) {
            if (reference.stars.hasOwnProperty(answerId)) {
                reference.stars[answerId].value = starId; // this should perhaps be improved a bit ...
            }
        };

        this.loadAnswers = function(ratingsId) {
            var answerId = 0;
            $("#" + ratingsId + " .poll-option").each(function(i) {
                answerId = $(this).prop("id");
                reference.stars[answerId] = new Stars(answerId, data[i]);
            });
        };
    }

    function Stars(id, data) {
        this.id = id;
        this.data = data;
        this.value = undefined;
    }
};