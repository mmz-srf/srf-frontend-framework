import {FefDebounceHelper} from '../classes/fef-debounce-helper';

const DEBOUNCETIME = 500;

export function init() {

    let DURATION = 150;

    let ringElem = null;
    let prevFocused = null;
    let keyDownTime = 0;

    let win = window;
    let doc = document;
    let docElem = doc.documentElement;
    let body = doc.body;


    docElem.addEventListener('keydown', function (event) {
        let code = event.which;
        // Show animation only upon Tab or Arrow keys press.
        if (code === 9 || (code > 36 && code < 41)) {
            keyDownTime = Date.now();
        }
    }, false);

    win.addEventListener('resize',
        FefDebounceHelper.debounce(() => placeFlyingFocus(doc.activeElement), DEBOUNCETIME),
        false
    );

    docElem.addEventListener('focus', function (event) {
        let target = event.target;
        placeFlyingFocus(target);
    }, true);


    docElem.addEventListener('blur', function () {
        onEnd();
    }, true);

    /**
     * In some cases it is needed to adjust the flying focus position,
     * because the focused element moves (e.g. swipe module, janrain modal)
     */
    $(document).on('flyingfocus:move', function() {
        placeFlyingFocus(doc.activeElement);
    });

    function placeFlyingFocus(target) {
        if (target.id === 'flying-focus') {
            return;
        }

        if (!ringElem) {
            initialize();
        }

        let offset = offsetOf(target);
        ringElem.style.left = offset.left + 'px';
        ringElem.style.top = offset.top + 'px';
        ringElem.style.width = target.offsetWidth + 'px';
        ringElem.style.height = target.offsetHeight + 'px';

        // Special handling for hidden input fields
        if ($(target).is('input') && $(target).hasClass('h-offscreen')) {
            ringElem.style.width = Math.round($(target).parent().outerWidth()) + 'px';
            ringElem.style.height = Math.round($(target).parent().outerHeight()) + 'px';
        }

        // Fallback with and height (best guess and better then zero...)
        if(target.offsetWidth === 0 && target.offsetHeight === 0) {
            ringElem.style.width = Math.round(target.getBoundingClientRect().width) + 'px';
            ringElem.style.height = Math.round(target.getBoundingClientRect().height) + 'px';
        }

        if (!isJustPressed()) {
            return;
        }

        target.classList.add('flying-focus_target');
        ringElem.classList.add('flying-focus_visible');
        prevFocused = target;
    }

    function initialize() {
        ringElem = doc.createElement('flying-focus');
        ringElem.id = 'flying-focus';
        ringElem.style.transitionDuration = ringElem.style.WebkitTransitionDuration = DURATION / 1000 + 's';
        body.appendChild(ringElem);
    }


    function onEnd() {
        if (ringElem) {
            ringElem.classList.remove('flying-focus_visible');
        }
        if (prevFocused) {
            prevFocused.classList.remove('flying-focus_target');
        }
        prevFocused = null;
    }


    function isJustPressed() {
        return Date.now() - keyDownTime < 100;
    }


    function offsetOf(elem) {
        let rect = elem.getBoundingClientRect();
        let clientLeft = docElem.clientLeft || body.clientLeft;
        let clientTop = docElem.clientTop || body.clientTop;
        let scrollLeft = win.pageXOffset || docElem.scrollLeft || body.scrollLeft;
        let scrollTop = win.pageYOffset || docElem.scrollTop || body.scrollTop;
        let left = rect.left + scrollLeft - clientLeft;
        let top = rect.top + scrollTop - clientTop;

        /*
        * Makes Flying Focus working in scrollable divs (overflow-x = hidden)
        */
        $('#flying-focus').appendTo('body');
        let height = $(elem).height();
        $(elem).parents().each(function( ) {
            if ($(this).height() < height && $(this).css('overflow-x') == 'hidden') {
                // workaround for wrong FF positioning problem: use standard behaviour
                // (positioned absolutely on the page, not in the scroll container) if
                // not easily fixable.
                if ($(this).data('flying-focus-info') === 'ignore-scrollable-container') {
                    return false;
                }

                $('#flying-focus').appendTo($(this));
                top  = rect.top - ($(this).parent().offset().top - scrollTop) + $(this).scrollTop();
                left = rect.left - $(this).parent().offset().left;
                // stop trying it with other parents
                return false;
            }
            height = $(this).height();
        });

        return {
            top: top || 0,
            left: left || 0
        };
    }


    let style = doc.createElement('style');
    style.textContent = `#flying-focus {
        position: absolute;
        margin: 0;
        background: transparent;
        -webkit-transition-property: left, top, width, height;
        transition-property: left, top, width, height;
        -webkit-transition-timing-function: cubic-bezier(0,1,0,1);
        transition-timing-function: cubic-bezier(0,1,0,1);
        visibility: hidden;
        pointer-events: none;
        box-shadow: 0 0 2px 3px #78aeda, 0 0 2px #78aeda inset; border-radius: 2px;
    }
    #flying-focus.flying-focus_visible {
        visibility: visible;
        z-index: 100003;
    }
    .flying-focus_target {
        outline: none !important; /* Doesn't work in Firefox :( */
    }
    /* http://stackoverflow.com/questions/71074/how-to-remove-firefoxs-dotted-outline-on-buttons-as-well-as-links/199319 */
    .flying-focus_target::-moz-focus-inner {
        border: 0 !important;
    }
    /* Replace it with @supports rule when browsers catch up */
    @media screen and (-webkit-min-device-pixel-ratio: 0) {
        #flying-focus {
            box-shadow: none;
        }
    }`;

    body.appendChild(style);
}

/**
 * Simply using .focus() doesn't suffice.
 *
 * @param $element jQuery.Element
 */
export function setFocus($element) {
    $element.attr('tabindex', -1).on('blur focusout', () => {
        $element.removeAttr('tabindex');
    }).focus();
}
