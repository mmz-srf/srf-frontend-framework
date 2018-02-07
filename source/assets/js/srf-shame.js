/*
 * This file exists solely for nasty browser hacks, fallbacks and fixes.
 *
 * It is envisaged that we DELETE the code-snippets as soon as support for each targeted browser is deprecated. Therefore watch out for the «TARGETED BROWSER»-comments at the beginning of each function in this file.
 *
 */

export function init() {
    objectFitForIE();

    replaceSVGLogoForIE();
}

function objectFitForIE() {
    let copyPropertiesFromOldImage = (oldImg, fakeImg, objectFitVal) => {
            let imageSource = oldImg.src,
                imageClasses = oldImg.className;

            oldImg.style.display = 'none';

            if (imageSource.indexOf('Placeholder-16to9.svg') < 0) {
                fakeImg.style.backgroundSize = objectFitVal;
            }
            fakeImg.style.backgroundImage = 'url(' + imageSource + ')';
            fakeImg.style.backgroundPosition = 'center center';
            fakeImg.style.backgroundRepeat = 'no-repeat';
            fakeImg.className = imageClasses + ' js-fake-image-object-fit';
        },
        getObjectFitValue = elem => {
            let objectFitVal = 'contain';

            if ( elem.currentStyle ) {
                objectFitVal = elem.currentStyle.getAttribute('object-fit');
            }

            return objectFitVal;
        };


    /*
    * TARGETED BROWSER: IE 11 and Edge <= 15
    *
    * This one is a object-fit-Fallback for Browsers not supporting object-fit --> IE 11 and Edge <= 15.
    *
    * It checks what kind of object-fit is used on the img ('contain' or 'cover') and sets the appropriate alternative
    * BackgroundSize. Except in Edge, where we set the 'contain'-value per default (because we use 'contain' more often
    * than 'cover' in the RA). We do this, because Edge does not let us read out the value of the prop it does not
    * understand (object-fit) - unlike good-old IE.
    * Additionally, a load-event-listener is bound to the image. If the source is changed (e.g. in image galleries,
    * where images after the 2nd are only loaded on interaction with the gallery), we do the same procedure again.
    */

    if('objectFit' in document.documentElement.style === false) {

        const relevantClasses = [
                '.article-audio__wrapper',
                '.article-media--image',
                '.article-media--simple',
                '.article-teaser__wrapper',
                '.article-video__wrapper',
                '.carousel__item',
                '.media-still__image',
                '.poll-media--image'
            ],
            containers = document.querySelectorAll( relevantClasses.join(', ') );

        for(let i = 0; i < containers.length; i++) {
            let oldImg = containers[i].querySelector('img'),
                objectFitVal = getObjectFitValue(oldImg);

            if (objectFitVal === 'contain' || objectFitVal === 'cover') {

                let fakeImg = document.createElement('div');

                oldImg.parentNode.insertBefore(fakeImg, oldImg.parentNode.childNodes[0]);

                oldImg.addEventListener('load', event => {
                    let oldImg = event.currentTarget,
                        fakeImg = oldImg.parentElement.getElementsByClassName('js-fake-image-object-fit')[0],
                        objectFitVal = getObjectFitValue(oldImg);

                    copyPropertiesFromOldImage(oldImg, fakeImg, objectFitVal);
                });

                copyPropertiesFromOldImage(oldImg, fakeImg, objectFitVal);

            }
        }
    }
}


/*
 * TARGETED BROWSER: IE 11
 *
 * IE11 _sometimes_ has problems with scaled images with svg sources. The usual remedies (viewbox, no widths, etc.)
 * didn't help. This is the last resort - hiding the img and setting a background-image on the parent.
 */
function replaceSVGLogoForIE() {
    if (navigator.userAgent.indexOf('MSIE')!==-1 || navigator.appVersion.indexOf('Trident/') > 0) {
        let bu = document.body.getAttribute('data-bu');
        document.getElementsByClassName('header-startlink')[0].classList.add('header-startlink--fixed-for-ie');

        if (bu === 'rtr') {
            document.getElementsByClassName('header-startlink')[0].classList.add('header-startlink--fixed-for-ie-rtr');
        }
    }
}
