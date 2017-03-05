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
        totalVotes = 0;
        for (var i = 0; i < data.length; i++) { totalVotes += data[i]; }
        console.log(totalVotes);
        return totalVotes;
    };

    // process data to get total stars
    function getTotalStars(data){
        totalStars = 0;
        for (var i = 0; i < data.length; i++) { totalStars += data[i] * ( i + 1 ); }
        console.log(totalStars);
        return totalStars;
    };

    $(document).ready(function () {

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
        });

        $('.ratingstars__star').on('mouseleave',function(e){
            $('.ratingstars__star').removeClass('is-hover');
        });

        // if user clicks on radio-button
        $('.ratingstars-list input[type="radio"]').on('change',function(e){
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

        // THIS IS NOT YET WORKING!!!
        // It's still the old version where the initial function was $('.ratingstars-list input[type="radio"]').on('change',function(e){…
        // Therefore here $that is still the changed radio-button, not the .submit-button
        $('.submit-button').on('click',function(e){
            var $that = $(this),
                myVote = $that.attr('value'),
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
                ratings_index = $that.parent().attr('data-ratings_index'),
                answer_index = $that.parent().attr('data-answer_index'),
                star_index = $that.parent().attr('data-star_index'),
                $ratingstarsContainer = $('#ratings-ID'+ratings_index),
                dataJSONurl = $that.closest('.poll-option').attr('data-src');;

            // load ratings-results and process data
            $.getJSON(dataJSONurl, function(data) {
                console.log(data);
                getTotalVotes(data);
                getTotalStars(data);
            });
    
            // calculate the rating-result
            resultVote = Math.round((totalStars + myVote) / (totalVotes + 1)) / 10;

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
                    newStyle += animeStarInit1+ratings_index+'-'+answer_index+'-'+i+animeStarInit2+ratings_index+'-'+answer_index+'-'+i+'}'+animeStarName+ratings_index+'-'+answer_index+'-'+i+' '+animeStarCode1+animeStarOrigin+animeStarActive+animeStarCode2+animeStarOrigin+animeStarActive+animeStarEnd;
                } else {
                    newStyle += animeStarInit1+ratings_index+'-'+answer_index+'-'+i+animeStarInit2+ratings_index+'-'+answer_index+'-'+i+'}'+animeStarName+ratings_index+'-'+answer_index+'-'+i+' '+animeStarCode1+animeStarOrigin+animeStarNeutral+animeStarCode2+animeStarOrigin+animeStarNeutral+animeStarEnd;
                }

            }

            // add the keyframe-codes into a style-element and add it to the DOM
            $('<style id="ratingAnime'+ratings_index+'-'+answer_index+'" />').text(newStyle).insertAfter($ratingstarsContainer);

            // include Result- and myVote-Number to the DOM
            $('.resultWording--'+ratings_index+'-'+answer_index).addClass('animated');
            $('.resultWording--'+ratings_index+'-'+answer_index+' .resultNumber--js').text(resultVote);
            $('.resultWording--'+ratings_index+'-'+answer_index+' .myNumber--js').text(myVote);

            // add css-classes to trigger the animations
            $ratingstarsContainer.addClass('animated');

        });

    });

}(window.jQuery));