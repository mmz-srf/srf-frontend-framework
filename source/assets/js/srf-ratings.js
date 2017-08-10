export function init(){
    var srfRating = {};
    $(document).ready(function(){
        srfRating.ratingControl = new ratingController();
        srfRating.ratingControl.init();
    });
}

var ratingController = function(){
    var that = this;
    this.rating = {};

    var ratingRadioClass = '.ratingstars__checkbox',
        ratingStarClass = '.ratingstars__star',
        ratingFormClass = '.rating-wrapper',
        resultWordingClass = '.resultWording',
        resultNumbClass = '.resultNumber--js',
        myNumbClass = '.myNumber--js',
        optionClass = '.poll-option',
        halfStarClass = '.star-half',
        radioID = '#star',
        hoverClassName = 'is-hover',
        activeClassName = 'is-active',
        animatedClassName = 'is-animated',
        submittedClassName = 'is-submitted',
        errorClassName = 'poll-form-handling__errors',
        starsIDName = 'stars-ID',
        ratingsIDName = 'ratings-ID',
        animationName = 'ratingAnime',
        errMsg = 'Bitte setzen Sie überall eine Bewertung.'; // todo: translate!

    this.init = function(){
        this.loadData();
        this.initObservers();
    };

    this.loadData = function(dataJSONurl,ratingId){
        $(ratingFormClass).each(function(){ // every form
            var ratingsId = $(this).attr('id');
            $.ajax({
                url: $('#'+ratingsId).data('src'),
                type: 'GET',
                dataType: 'json',
                success: function(data){
                    that.rating[ratingsId] = new Rating(ratingsId,data);
                    that.rating[ratingsId].loadAnswers(ratingsId);
                },
                error: function(){}
            });
        });
    };

    this.initObservers = function(){
        var that = this;

        // highlight first/last star if user uses keyboard to tab to radiobuttons without choosing a rating yet
        $(ratingRadioClass).on('focusin',function(){
            $(this).siblings('label').find('svg').addClass(hoverClassName);
        }).on('focusout',function(e){
            $(this).siblings('label').find('svg').removeClass(hoverClassName);
        });

        // highlight current starX and previous stars if user hovers starX
        $(ratingStarClass).on('mouseenter',function(e){
            var $that = $(this),
                $thatParent = $that.parent(),
                $thatParentParent = $thatParent.parent(),
                $thisStarInput = $thatParent.siblings('input'),
                thisStar = $thisStarInput.attr('value'),
                index_tmp = $thisStarInput.attr('id').split('-'),
                ratings_index = index_tmp[0].slice(-1),
                answer_index = index_tmp[1],
                star_index = index_tmp[2];

            for (var i = 1; i <= thisStar; i++) {
                $(ratingStarClass+'--'+ratings_index+'-'+answer_index+'-'+i).addClass(hoverClassName);
            }
        }).on('mouseleave',function(e){
            $(ratingStarClass).removeClass(hoverClassName);
        });

        // if user clicks on the label (and therefore triggers a click on radio-button which changes it)
        $(ratingRadioClass).on('click',function(){
            var $that = $(this),
                $rating = $that.closest(ratingFormClass),
                myVote = $that.attr('value'),
                $thatParent = $that.parent(),
                index_tmp = $that.attr('id').split('-'),
                ratings_index = index_tmp[0].slice(-1),
                answer_index = index_tmp[1],
                star_index = index_tmp[2];

            that.rating[$rating.prop('id')].addVote($that.closest(optionClass).prop('id'),$that.prop('id'));

            // toggle all stars before and including the clicked one as active/inactive
            $('#'+starsIDName+ratings_index+answer_index).find(ratingStarClass).removeClass(activeClassName);

            for (var i = 1; i <= myVote; i++) {
                $(ratingStarClass+'--'+ratings_index+'-'+answer_index+'-'+i).addClass(activeClassName);
            }

        });

        // if user clicks on submit
        $(ratingFormClass).on('submit',function(e){

            var $ratings = $(this).find(optionClass);
            if ( $ratings.find('input:radio:checked').length === $ratings.length ) {

                var $that = $(this),
                    rating_id = $that.prop('id'),
                    rating_index = rating_id.slice(-1),
                    answer_index,
                    star_index = 0,
                    tmp = 0,
                    rated = 0;

                // remove err msg
                that.handleErrors($that,false);

                // First animate the button, then show the ratings/starts
                $that.find(".poll-form-handling button").text("Danke").addClass("button--success").delay(900).fadeOut(200, () => {

                    $.each(that.rating[rating_id].stars,function(){
                        // do the dance ... if possible
                        if (this.value !== undefined) {
                            tmp = this.value.split('-'); // bsp. this.value = 'star1-2-3'
                            answer_index = tmp[1];
                            star_index = tmp[2];
                            that.doTheDance(rating_index,answer_index,star_index);
                            rated++;
                        }
                    });

                    // Show the "X votes have been cast"
                    $that.find(".poll-form-handling__roundup strong").text("12");
                    $that.find(".poll-form-handling__roundup").slideDown(200);

                    if (rated === 0) { that.handleErrors($that,true); }

                });


                // ==> submit all votes!!!
                return false; // but nothing else

            } else {

                that.handleErrors($(this),true);
                return false;

            }

        });
    };

    this.doTheDance = function(ratings_index,answer_index,star_index){
        var $that = $('#'+ratingsIDName+ratings_index),
            myVote = $that.find(radioID+ratings_index+'-'+answer_index+'-'+star_index).attr('value'),
            animeStarInit1 = '.'+animatedClassName+' '+ratingStarClass+'--',
            animeStarInit2 = ' {animation-name:'+animationName,
            animeStarName = '@keyframes '+animationName,
            animeStarCode1 = '{0% {transform:translate3d(0,0,0) scale3d(1,1,1)} 33.334% {transform:translate3d(0,-12px,0) scale3d(1.125,1.125,1.125) rotateY(90deg);',
            animeStarCode2 = 'animation-timing-function:cubic-bezier(.175,.885,.3,1.75)} 100% {transform:translate3d(0,-12px,0) scale3d(.875,.875,.875) rotateY(180deg);animation-timing-function:cubic-bezier(.175,.885,.3,1.75);',
            animeStarOrigin = '',
            animeStarOrigin1 = 'transform-origin:75% 50%;',
            animeStarOrigin2 = 'transform-origin:62.5% 50%;',
            animeStarOrigin3 = 'transform-origin:50% 50%;',
            animeStarOrigin4 = 'transform-origin:37.5% 50%;',
            animeStarOrigin5 = 'transform-origin:25% 50%;',
            animeStarActive = 'fill:rgb(34,33,29);',
            animeStarNeutral = 'fill:rgb(185,183,173);',
            animeStarState = animeStarActive,
            animeStarEnd = '}}',
            newStyle = '',
            currentData = this.rating[ratingsIDName+ratings_index].stars[starsIDName+ratings_index+answer_index].data,
            total = that.getTotal(currentData),
            totalStars = total[0],
            totalVotes = total[1],
            resultVote = 0.5 * Math.round((+totalStars + +myVote) / (+totalVotes + 1) / 0.5), // calculate the rating-result (handling js + behaviour)
            $thisRating = $('#'+starsIDName+ratings_index+answer_index);

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

            var resultCorrection = 0;

            if (resultVote == 0.5 || resultVote == 1.5 || resultVote == 2.5 || resultVote == 3.5 || resultVote == 4.5 ) {

                resultCorrection = -1; // if there is a half-star, the last star (-1) should not be active but neutral

                // fill half-stars
                if (i == Math.round(resultVote*1.0)/1.0-1) {
                    $thisRating.find(ratingStarClass+'--'+i).on('animationstart',function(e){
                        var $that = $(this);
                        setTimeout(function () {
                            $that.parent().next('.ratingstars__elem').find(halfStarClass).addClass(activeClassName);
                        },183.36); // .4s animation-duration / 33.334% Keyframe + 50ms difference in animation-delay = 183.36ms
                    });
                }
            }

            // compose the css-keyframe-code for all five individual stars … active or neutral
            if (i > Math.round(resultVote)+resultCorrection) { animeStarState = animeStarNeutral; } // resultCorrection = 0 by default, or -1 if there is a half-star -> the last active star should not be filled, because there is the filled half-star
            newStyle += animeStarInit1+ratings_index+'-'+answer_index+'-'+i+animeStarInit2+ratings_index+'-'+answer_index+'-'+i+'}'+animeStarName+ratings_index+'-'+answer_index+'-'+i+' '+animeStarCode1+animeStarOrigin+animeStarState+animeStarCode2+animeStarOrigin+animeStarState+animeStarEnd;

        }
        that.animateStars(ratings_index,answer_index,myVote,resultVote,newStyle);

        // remove input-fields and label-wrapper around svg-star -> TODO
        $thisRating.addClass(submittedClassName).find('input').remove();
        $thisRating.find('label').replaceWith(function(){ return $(this).contents(); });
    };

    this.animateStars = function(ratings_index,answer_index,myVote,resultVote,newStyle){
        var $ratingstarsContainer = $('#'+ratingsIDName+ratings_index),
            $thisRating = $('#'+starsIDName+ratings_index+answer_index);

        // add the keyframe-codes into a style-element and add it to the DOM
        $('<style id="'+animationName+ratings_index+'-'+answer_index+'" />').text(newStyle).insertAfter($ratingstarsContainer);

        // include Result- and myVote-Number to the DOM
        $thisRating.find(resultWordingClass).addClass(animatedClassName); // or $(resultWordingClass+'--'+ratings_index+'-'+answer_index).addClass(animatedClassName);
        $thisRating.find(resultNumbClass).text(resultVote); // or $(resultWordingClass+'--'+ratings_index+'-'+answer_index+' '+resultNumbClass).text(resultVote);
        if (resultVote != '1') { $thisRating.find(resultNumbClass).parent().append('e'); } // or $(resultWordingClass+'--'+ratings_index+'-'+answer_index+' strong').append('e');
        $thisRating.find(myNumbClass).text(myVote); // or $(resultWordingClass+'--'+ratings_index+'-'+answer_index+' '+myNumbClass).text(myVote);
        if (resultVote != '1') { $thisRating.find(myNumbClass).parent().append('e'); } // or $(resultWordingClass+'--'+ratings_index+'-'+answer_index+' '+myNumbClass).append('e');

        // add css-classes to trigger the animations
        $ratingstarsContainer.addClass(animatedClassName);
    };

    this.getTotal = function(data){
        var totalStars = 0,
            totalVotes = 0;
        for (var i = 0; i < data.length; i++) {
            totalStars += data[i] * ( i + 1 ); // totalStars
            totalVotes += data[i]; // totalVotes
        }
        return [totalStars,totalVotes];
    };

    this.handleErrors = function($ratings,hasError){
        if (hasError) {
            $ratings.find('.'+errorClassName).addClass(errorClassName+'--onerror').text(errMsg);
            return true;
        } else {
            // remove err msg (whether it's there or not)
            $ratings.find('.'+errorClassName).removeClass(errorClassName+'--onerror').text('');
            return false;
        }
    };

    function Rating(id,data){
        this.id = id;
        this.data = data;
        this.stars = {};
        var reference = this;

        this.addVote = function(answerId,starId){
            if (reference.stars.hasOwnProperty(answerId)) {
                reference.stars[answerId].value = starId; // this should perhaps be improved a bit ...
            }
        };

        this.loadAnswers = function(ratingsId){
            var answerId = 0;
            $('#'+ratingsId+' '+optionClass).each(function(i){
                answerId = $(this).prop('id');
                reference.stars[answerId] = new Stars(answerId,data[i]);
            });
        };
    }

    function Stars(id,data){
        this.id = id;
        this.data = data;
        this.value = undefined;
    }
};