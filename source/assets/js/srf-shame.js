/*
 * This file exists solely for nasty browser hacks, fallbacks and fixes.
 *
 * It is envisaged that we DELETE the code-snippets as soon as support for each targeted browser is deprecated. Therefore watch out for the «TARGETED BROWSER»-comments at the beginning of each function in this file.
 *
 */

export function init() {
    objectFitForIE();
    addFixedforIEClass();
    addBrowserClass();
}

export function polyfillObjectFit(element) {
    let copyPropertiesFromOldImage = function(oldImg, fakeImg, objectFitVal) {
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
        getObjectFitValue = function(elem) {
            let objectFitVal = 'contain';

            if (  elem.currentStyle ) {
                objectFitVal = elem.currentStyle.getAttribute('object-fit');
            }

            return objectFitVal;
        };

    // only do something if there is no objectFit
    if ('objectFit' in document.documentElement.style ) {
        return;
    }

    // only do something if there's an image.
    if (!element) {
        return;
    }

    // only do something if the image has a src
    if (!element.getAttribute('src')) {
        return;
    }

    // only do something if it hasn't been done before to this element
    if (element.classList.contains('js-polyfilled-for-objectfit-ie11')) {
        return;
    }

    let objectFitVal = getObjectFitValue(element);

    if (objectFitVal === 'contain' || objectFitVal === 'cover') {
        let fakeImg = document.createElement('div');

        element.parentNode.insertBefore(fakeImg, element.parentNode.childNodes[0]);

        element.addEventListener('load', event => {
            let oldImg = event.currentTarget,
                fakeImg = oldImg.parentElement.getElementsByClassName('js-fake-image-object-fit')[0],
                objectFitVal = getObjectFitValue(oldImg);

            copyPropertiesFromOldImage(oldImg, fakeImg, objectFitVal);
        });

        element.classList.add('js-polyfilled-for-objectfit-ie11');

        copyPropertiesFromOldImage(element, fakeImg, objectFitVal);
    }
}

/**
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
function objectFitForIE() {
    if ('objectFit' in document.documentElement.style === false) {
        const relevantClasses = [
                '.article-media--image',
                '.article-teaser__wrapper',
                '.carousel__item',
                '.poll-media--image',
                '.listing-item__media',
                '.media-still__image',
                '.teaser:not(.teaser--with-medium) .teaser__medium-wrapper', // teaser--with-medium do also contain a media-still__image!
                '.teaser__longform-medium',
                '.meteo-anchorman-image',
                '.onairnav-list__element .teaser__medium' // livestreams in onair-flyout
            ],
            containers = document.querySelectorAll( relevantClasses.join(', ') );

        for (let i = 0; i < containers.length; i++) {
            polyfillObjectFit(containers[i].querySelector('img'));
        }
    }
}


/*
 * TARGETED BROWSER: IE 11
 *
 * Adds the value of a data-attribute named "ie-fix" to the class-list of this
 * element – if the user agent is IE11.
 */

function addFixedforIEClass() {
    if (navigator.userAgent.indexOf('MSIE')!==-1 || navigator.appVersion.indexOf('Trident/') > 0) {
        const dataAttr = 'data-iefix';
        let elementsToFix = document.querySelectorAll('['+dataAttr+']');

        for(let i = 0; i < elementsToFix.length; ++i) {
            let ieFixClassName = elementsToFix[i].getAttribute(dataAttr);
            elementsToFix[i].classList.add(ieFixClassName);
        }
    }
}

/*
 * TARGETED BROWSER: IE 11
 *
 * polyfill for findIndex.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
 */
if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
        value: function(predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            let o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            let len = o.length >>> 0;

            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            let thisArg = arguments[1];

            // 5. Let k be 0.
            let k = 0;

            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return k.
                let kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return k;
                }
                // e. Increase k by 1.
                k++;
            }

            // 7. Return -1.
            return -1;
        },
        configurable: true,
        writable: true
    });
}

/*
 * TARGETED BROWSER: Safari Mobile in iOS 12
 * Our implementation of the swipeable-area causes Safari in iOS 12
 * curiously to flicker when scrolling. Probably this is specifically
 * a bug in WebKit in re-painting an element (nav-arrows) on top of an
 * element that has the scroll snapping behaviour.
 */

function addBrowserClass() {
    let browser = (function() {
        let check = function(regexp) {
            return regexp.test(window.navigator.userAgent);
        }
        switch (true) {
            case check(/iPhone OS 12/i): return 'safari-ios-12';
            default: return;
        }
    })();

    if (browser) {document.body.classList.add(browser);};

    /* Bug-Fixes and Stylings via `_shame.scss` */
}
