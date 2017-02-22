(function ($) {
    "use strict";

    var getResult,
        resultVote = 0;

    function getResult(data){
        console.log('Votes: '+data);
        
        var totalVotes = 0,
            totalStars = 0;

        for (var i = 0; i < data.length; i++) {
            totalVotes += data[i];
        }
        console.log('totalVotes: '+totalVotes);
        
        $.each(data, function(i,v){
            totalStars += v*(i+1);
        });
        console.log('totalStars: '+totalStars);

        resultVote = Math.round( (totalStars / totalVotes) * 10 ) / 10;
        console.log('resultVote: '+resultVote)

        $('.resultNumber--js').text(resultVote);

    };

    $(document).ready(function () {

        console.log('loaded');
        
        var dataJSONurl = $('.devWrap').attr('data-src');
        
        $.getJSON(dataJSONurl, function(data) {
            getResult(data);
        });

        $('.ratingstars--toVote input[type="radio"]').on('change',function(e){
            var $that = $(this),
                myVote = $that.attr('value'),
                $ratingstarsContainer = $('.ratingstars');

            $('<style>@keyframes ratingAnime1 {0% {transform:translate3d(0,0,0) scale3d(1,1,1)}    50% {transform:translate3d(0,-32px,0) scale3d(1.125,1.125,1.125) rotateY(90deg)}    80% {transform:translate3d(0,-10px,0) scale3d(.8,.8,.8) rotateY(144deg)}    100% {transform:translate3d(0,-16px,0) scale3d(.875,.875,.875) rotateY(180deg);transform-origin:80% 50%;fill:rgb(34,33,29)}}@keyframes ratingAnime2 {    0% {transform:translate3d(0,0,0) scale3d(1,1,1)}    50% {transform:translate3d(0,-32px,0) scale3d(1.125,1.125,1.125) rotateY(90deg)}    80% {transform:translate3d(0,-10px,0) scale3d(.8,.8,.8) rotateY(144deg)}    100% {transform:translate3d(0,-16px,0) scale3d(.875,.875,.875) rotateY(180deg);transform-origin:65% 50%;fill:rgb(34,33,29)}}@keyframes ratingAnime3 {    0% {transform:translate3d(0,0,0) scale3d(1,1,1)}    50% {transform:translate3d(0,-32px,0) scale3d(1.125,1.125,1.125) rotateY(90deg)}    80% {transform:translate3d(0,-10px,0) scale3d(.8,.8,.8) rotateY(144deg)}    100% {transform:translate3d(0,-16px,0) scale3d(.875,.875,.875) rotateY(180deg);transform-origin:50% 50%;fill:rgb(34,33,29)}}@keyframes ratingAnime4 {    0% {transform:translate3d(0,0,0) scale3d(1,1,1)}    50% {transform:translate3d(0,-32px,0) scale3d(1.125,1.125,1.125) rotateY(90deg)}    80% {transform:translate3d(0,-10px,0) scale3d(.8,.8,.8) rotateY(144deg)}    100% {transform:translate3d(0,-16px,0) scale3d(.875,.875,.875) rotateY(180deg);transform-origin:35% 50%;fill:rgb(185,183,173)}}@keyframes ratingAnime5 {    0% {transform:translate3d(0,0,0) scale3d(1,1,1)}    50% {transform:translate3d(0,-32px,0) scale3d(1.125,1.125,1.125) rotateY(90deg)}    80% {transform:translate3d(0,-10px,0) scale3d(.8,.8,.8) rotateY(144deg)}    100% {transform:translate3d(0,-16px,0) scale3d(.875,.875,.875) rotateY(180deg);transform-origin:20% 50%;fill:rgb(185,183,173)}}</style>').insertAfter($ratingstarsContainer);
            $ratingstarsContainer.addClass('animated');

        });

    });

}(window.jQuery));