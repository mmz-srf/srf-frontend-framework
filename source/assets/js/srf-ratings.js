(function ($) {
    "use strict";

    // set global variables
    var getTotalVotes,
        getTotalStars,
        resultVote = 0,
        totalVotes = 0,
        totalStars = 0;

    // process data to get total of votes
    function getTotalVotes(data){
        for (var i = 0; i < data.length; i++) { totalVotes += data[i]; }
        return totalVotes;
    };

    // process data to get total stars
    function getTotalStars(data){
        for (var i = 0; i < data.length; i++) { totalStars += data[i] * ( i + 1 ); }
        return totalStars;
    };

    $(document).ready(function () {

        // load ratings-results and process data
        var dataJSONurl = $('.devWrap').attr('data-src');
        $.getJSON(dataJSONurl, function(data) {
            getTotalVotes(data);
            getTotalStars(data);
        });

        // if user hovers stars
        $('.ratingstars__star').on('mouseenter',function(e){
            var $that = $(this),
                thisStar = $that.parent().siblings('input').attr('value');

            for (var i = 1; i <= thisStar; i++) {
                $('.ratingstars__star--'+i).addClass('is-hover');
            }
        });

        $('.ratingstars__star').on('mouseleave',function(e){
            $('.ratingstars__star').removeClass('is-hover');
        });

        // if user votes
        $('.ratingstars--toVote input[type="radio"]').on('change',function(e){
            var $that = $(this),
                myVote = $that.attr('value'),
                $ratingstarsContainer = $('.devWrap'),
                animeStarName = '@keyframes ratingAnime',
                animeStarCode = '{0% {transform:translate3d(0,0,0) scale3d(1,1,1)} 33.334% {transform:translate3d(0,-12px,0) scale3d(1.125,1.125,1.125) rotateY(90deg);',
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

            // calculate the rating-result
            resultVote = Math.round((totalStars + myVote) / (totalVotes + 1)) / 10;

            // mark all stars before (and including) the clicked one as active
            for (var i = 1; i <= myVote; i++) {
                $('.ratingstars__star--'+i).addClass('is-active');
            }

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
                if (i <= Math.round(resultVote)) {
                    newStyle += animeStarName+i+' '+animeStarCode+animeStarOrigin+animeStarActive+animeStarCode2+animeStarOrigin+animeStarActive+animeStarEnd;
                } else {
                    newStyle += animeStarName+i+' '+animeStarCode+animeStarOrigin+animeStarNeutral+animeStarCode2+animeStarOrigin+animeStarNeutral+animeStarEnd;
                }

            }

            // add the keyframe-codes into a style-element and add it to the DOM
            $('<style />').text(newStyle).insertAfter($ratingstarsContainer);

            // include Result- and myVote-Number to the DOM
            $('.resultNumber--js').text(resultVote);
            $('.myNumber--js').text(myVote);

            // add css-classes to trigger the animations
            $ratingstarsContainer.addClass('animated');

        });

    });

}(window.jQuery));