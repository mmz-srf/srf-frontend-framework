(function ($) {
    "use strict";

    var getTotalVotes,
        getTotalStars,
        resultVote = 0,
        totalVotes = 0,
        totalStars = 0;

    function getTotalVotes(data){
        for (var i = 0; i < data.length; i++) { totalVotes += data[i]; }
        return totalVotes;
    };
        
    function getTotalStars(data){
        console.log('Votes: '+data);

        $.each(data, function(i,v){
            totalStars += v*(i+1);
        });
        console.log('totalStars: '+totalStars);

        return totalStars;
    };

    $(document).ready(function () {

        var dataJSONurl = $('.devWrap').attr('data-src');

        $.getJSON(dataJSONurl, function(data) {
            getTotalVotes(data);
            getTotalStars(data);
        });

        $('.ratingstars--toVote input[type="radio"]').on('change',function(e){
            var $that = $(this),
                myVote = $that.attr('value'),
                $ratingstarsContainer = $('.ratingstars'),
                animeStarName = '@keyframes ratingAnime',
                animeStarCode = '{0% {transform:translate3d(0,0,0) scale3d(1,1,1)} 50% {transform:translate3d(0,-24px,0) scale3d(1.125,1.125,1.125) rotateY(90deg)} 80% {transform:translate3d(0,-19.2px,0) scale3d(.66,.66,.66) rotateY(144deg)} 100% {transform:translate3d(0,-12px,0) scale3d(.875,.875,.875) rotateY(180deg);',
                animeStarOrigin = '',
                animeStarOrigin1 = 'transform-origin:80% 50%;',
                animeStarOrigin2 = 'transform-origin:65% 50%;',
                animeStarOrigin3 = 'transform-origin:50% 50%;',
                animeStarOrigin4 = 'transform-origin:35% 50%;',
                animeStarOrigin5 = 'transform-origin:20% 50%;',
                animeStarActive = 'fill:rgb(34,33,29)}}',
                animeStarNeutral = 'fill:rgb(185,183,173)}}',
                newStyle = '';

            resultVote = Math.round((totalStars + myVote) / (totalVotes + 1)) / 10;
            
            for (var i = 1; i <= myVote; i++) {
                $('.ratingstars__star--'+i).addClass('is-active');
            }

            for (var i = 1; i < 6; i++) {

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

                if (i <= Math.round(resultVote)) {
                    newStyle += animeStarName+i+' '+animeStarCode+animeStarOrigin+animeStarActive;
                } else {
                    newStyle += animeStarName+i+' '+animeStarCode+animeStarOrigin+animeStarNeutral;
                }

            }

            $('<style />').text(newStyle).insertAfter($ratingstarsContainer);

            $('.resultNumber--js').text(resultVote);
            $('.myNumber--js').text(myVote);
            $ratingstarsContainer.addClass('animated');
            $('.resultWording').addClass('animated');

        });

    });

}(window.jQuery));