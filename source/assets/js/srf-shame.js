/*
 * This file exists solely for nasty browser hacks, fallbacks and fixes.
 * 
 * Is it envisaged that we DELETE the code-snippets as soon as support for each targeted browser is deprecated. Therefore watch out for the «TARGETED BROWSER»-comments at the beginning of each function in this file.
 * 
 */

export function init() {
  objectFitForIE();
}

function objectFitForIE() {

  /*
   * TARGETED BROWSER: IE 11 and Edge <= 15
   * 
   * This one is a object-fit-Fallback for Browsers not supporting object-fit --> IE 11 and Edge <= 15.
   *
   * It looks what kind of object-fit is used on the img ('contain' or 'cover') and sets the appropriate alternative BackgroundSize.
   * Except in Edge, where we set the 'cover'-value per default (because we use 'cover' more often than 'contain'). We do this, because Edge does not let us read out the value of the prop it does not understand (object-fit) - unlike good-old IE :-O.
   */

  if('objectFit' in document.documentElement.style === false) {

    var containers = document.querySelectorAll('.article-teaser__wrapper, .article-audio__wrapper, .carousel__item, .article-video__wrapper, .article-media--simple, .article-media--image');

    for(var i = 0; i < containers.length; i++) {

      if ( containers[i].querySelector('img').currentStyle ) {
        var objectFitVal = containers[i].querySelector('img').currentStyle.getAttribute('object-fit');
      } else {
        var objectFitVal = 'cover'
      }

      if (objectFitVal == 'contain' || objectFitVal == 'cover') {

        var oldImg = containers[i].querySelector('img'),
            imageSource = oldImg.src,
            imageClass = oldImg.classList,
            fakeImg = document.createElement('div');

        oldImg.style.display = 'none';
        fakeImg.style.backgroundSize = objectFitVal;
        fakeImg.style.backgroundImage = 'url(' + imageSource + ')';
        fakeImg.style.backgroundPosition = 'center center';
        fakeImg.style.backgroundRepeat = 'no-repeat';
        fakeImg.classList.add(imageClass);
        oldImg.parentNode.insertBefore(fakeImg, oldImg.parentNode.childNodes[0]);

      }

    }

  }

};