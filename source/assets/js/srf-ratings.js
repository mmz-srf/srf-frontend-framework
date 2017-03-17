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

    this.init = function() {
        this.loadData();
        this.initObservers();
    };

    this.loadData = function(dataJSONurl, ratingId) {
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
                $thatParent = $that.parent(),
                $thatParentParent = $thatParent.parent(),
                $thisStarInput = $thatParent.siblings('input'),
                thisStar = $thisStarInput.attr('value'),
                index_tmp = $thisStarInput.attr('id').split('-'),
                ratings_index = index_tmp[0].slice(-1),// $thatParentParent.attr('data-ratings_index'),
                answer_index = index_tmp[1],// $thatParentParent.attr('data-answer_index'),
                star_index = index_tmp[2];// $thatParentParent.attr('data-star_index');

            for (var i = 1; i <= thisStar; i++) {
                $('#star' + ratings_index + '-' + answer_index + '-' + i).siblings('label').find('.ratingstars__star--'+ratings_index+'-'+answer_index+'-'+i).addClass('is-hover');
            }
        }).on('mouseleave',function(e){
            $('.ratingstars__star').removeClass('is-hover');
        });

        // if user clicks on submit
        $(".rating-wrapper").on("submit", function(e) {
            var $that = $(this),
                rating_id = $that.prop("id"),
                rating_index = rating_id.slice(-1),
                answer_index,
                star_index = 0,
                tmp = 0,
                rated = 0;

            // remove err msg
            that.handleErrors($that, false);
            
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
                that.handleErrors($that, true);
            }

            // ==> submit all votes!!!
            return false; // but nothing else

        });

        // if user clicks on the label (and therefore triggers a click on radio-button which changes it)
        $(".ratingstars__checkbox").on("click", function () {
            var $that = $(this),
                $rating = $that.closest('.rating-wrapper'),
                myVote = $that.attr('value'),
                $thatParent = $that.parent(),
                index_tmp = $that.attr('id').split('-'),
                ratings_index = index_tmp[0].slice(-1),
                answer_index = index_tmp[1],
                star_index = index_tmp[2];

            that.rating[$rating.prop("id")].addVote($that.closest(".poll-option").prop("id"), $that.prop("id"));

            // toggle all stars before and including the clicked one as active/inactive
            $('[data-ratings_index='+ratings_index+'][data-answer_index='+answer_index+']').find('.ratingstars__star').removeClass('is-active');

            for (var i = 1; i <= myVote; i++) {
                $('.ratingstars__star--'+ratings_index+'-'+answer_index+'-'+i).addClass('is-active');
            }

        });
    };

    // contains submit... content ...
    this.doTheDance = function (ratings_index, answer_index, star_index) { // (ratingId) {
        var $that = $("#ratings-ID" + ratings_index),
            myVote = $that.find("#star" + ratings_index + "-" + answer_index + "-" + star_index).attr('value'),
            animeStarInit1 = '.animated .ratingstars__star--',
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
            newStyle = '',
            currentData = this.rating["ratings-ID" + ratings_index].stars["stars-ID" + ratings_index + answer_index].data,
            total = that.getTotal(currentData),
            totalStars = total[0],
            totalVotes = total[1],
            resultVote = 0.5 * Math.round((+totalStars + +myVote) / (+totalVotes + 1) / 0.5); // calculate the rating-result (handling js + behaviour)

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
            var animeStarState = animeStarActive;
            if (i > Math.round(resultVote)) {
                animeStarState = animeStarNeutral;
            }
            newStyle += animeStarInit1+ratings_index+'-'+answer_index+'-'+i+animeStarInit2+ratings_index+'-'+answer_index+'-'+i+'}'+animeStarName+ratings_index+'-'+answer_index+'-'+i+' '+animeStarCode1+animeStarOrigin+animeStarState+animeStarCode2+animeStarOrigin+animeStarState+animeStarEnd;
        }
        that.animateStars(ratings_index, answer_index, myVote, resultVote, newStyle);
    };

    this.animateStars = function (ratings_index, answer_index, myVote, resultVote, newStyle) {
        var $ratingstarsContainer = $('#ratings-ID' + ratings_index);

        // add the keyframe-codes into a style-element and add it to the DOM
        $('<style id="ratingAnime'+ratings_index+'-'+answer_index+'" />').text(newStyle).insertAfter($ratingstarsContainer);

        // include Result- and myVote-Number to the DOM
        $('#stars-ID'+ratings_index+answer_index).find('.resultWording').addClass('animated'); // or $('.resultWording--'+ratings_index+'-'+answer_index).addClass('animated');
        $('#stars-ID'+ratings_index+answer_index).find('.resultNumber--js').text(resultVote); // or $('.resultWording--'+ratings_index+'-'+answer_index+' .resultNumber--js').text(resultVote);
        if (resultVote != '1') { $('#stars-ID'+ratings_index+answer_index).find('.resultNumber--js').parent().append('e'); } // or $('.resultWording--'+ratings_index+'-'+answer_index+' strong').append('e');
        $('#stars-ID'+ratings_index+answer_index).find('.myNumber--js').text(myVote); // or $('.resultWording--'+ratings_index+'-'+answer_index+' .myNumber--js').text(myVote);
        if (resultVote != '1') { $('#stars-ID'+ratings_index+answer_index).find('.myNumber--js').parent().append('e'); } // or $('.resultWording--'+ratings_index+'-'+answer_index+' .myNumber--js').append('e');

        // add css-classes to trigger the animations
        $ratingstarsContainer.addClass('animated');
    };

    this.getTotal = function (data) {
        var totalStars = 0,
            totalVotes = 0;
        for (var i = 0; i < data.length; i++) {
            totalStars += data[i] * ( i + 1 ); // totalStars
            totalVotes += data[i]; // totalVotes
        }
        return [totalStars, totalVotes];
    };

    this.handleErrors = function ($ratings, hasError) {
        if (hasError) {
            var errMsg = "Bitte wählen Sie eine Option aus."; // todo: translate!
            $ratings.find(".poll-form-handling__errors").addClass("poll-form-handling__errors--onerror").text(errMsg);
            return true;
        } else {
            // remove err msg (whether it's there or not)
            $ratings.find(".poll-form-handling__errors").removeClass("poll-form-handling__errors--onerror").text("");
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