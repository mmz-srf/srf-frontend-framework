/*!
 * jQuery-TOC
 * Table of Contents Generator Plugin for (non-)jQuery
 *
 * @author Dolphin Wood <dolphin.w.e@gmail.com>
 * @version 0.0.5
 * Copyright 2015. MIT licensed.
 *
 * https://github.com/idiotWu/jQuery-TOC
 *
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    /**
     * get header level
     * @param {String} header: header's tag name
     *
     * @return {Number}
     */
    let getLevel = function (header) {
        if (typeof header !== 'string') {
            return 0;
        }

        let decs = header.match(/\d/g);
        return decs ? Math.min.apply(null, decs) : 1;
    };

    /**
     * create ordered list
     * @param {jQuert} $wrapper
     * @param {Number} count
     *
     * @return {jQuery} list
     */
    let createList = function ($wrapper, count) {
        while (count--) {
            $wrapper = $('<ol/>').appendTo($wrapper);

            if (count) {
                $wrapper = $('<li/>').appendTo($wrapper);
            }
        }

        return $wrapper;
    };

    /**
     * insert position jump back
     * @param {jQuery} $currentWrapper: current insert point
     * @param {Number} offset: distance between current's and target's depth
     *
     * @return {jQuery} insert point
     */
    let jumpBack = function ($currentWrapper, offset) {
        while (offset--) {
            $currentWrapper = $currentWrapper.parent();
        }

        return $currentWrapper;
    };

    /**
     * set element href/id and content
     * @param {Boolean} overwrite: whether overwrite source element existed id
     * @param {String} prefix: prefix to prepend to href/id
     *
     * @return {Function}
     */
    let setAttrs = function (overwrite, prefix) {
        return function ($src, $target, index) {
            let content = $src.text();
            let pre = prefix + '-' + index;
            $target.text(content);

            let src = $src[0];
            let target = $target[0];
            let id = overwrite ? pre : (src.id || pre);

            id = encodeURIComponent(id);

            src.id = id;
            target.href = '#' + id;
        };
    };

    /**
     * build table of contents
     * @param {Object} options
     *
     * @return {jQuery} list
     */
    let buildTOC = function (options) {
        let selector = options.selector;
        let scope = options.scope;

        let $ret = $('<ol/>');
        let $wrapper = $ret;
        let $lastLi = null;

        let prevDepth = getLevel(selector);
        let _setAttrs = setAttrs(options.overwrite, options.prefix);

        $(scope)
            .find(selector)
            .each(function (index, elem) {
                let currentDepth = getLevel(elem.tagName);
                let offset = currentDepth - prevDepth;

                if (offset > 0) {
                    $wrapper = createList($lastLi, offset);
                }

                if (offset < 0) {
                    // should be once more level to jump back
                    // eg: h2 + h3 + h2, offset = h2 - h3 = -1
                    //
                    // ol <------+ target
                    //   li      |
                    //     ol ---+ current
                    //       li
                    //
                    // jumpback = target - current = 2
                    $wrapper = jumpBack($wrapper, -offset * 2);
                }

                if (!$wrapper.length) {
                    $wrapper = $ret;
                }

                let $li = $('<li/>');
                let $a = $('<a/>');

                _setAttrs($(elem), $a, index);

                $li.append($a).appendTo($wrapper);

                $lastLi = $li;
                prevDepth = currentDepth;
            });

        return $ret;
    };

    /**
     * init table of contents
     * @param {Object} [option]: TOC options, available props:
     *                              {String} [selector]: headers selector, default is 'h1, h2, h3, h4, h5, h6'
     *                              {String} [scope]: selector to specify elements search scope, default is 'body'
     *                              {Boolean} [overwrite]: whether to overwrite existed headers' id, default is false
     *                              {String} [prefix]: string to prepend to id/href prop, default is 'toc'
     *
     * @return {jQuery} $this
     */
    $.fn.initTOC = function (options) {
        let defaultOpts = {
            selector: 'h1, h2, h3, h4, h5, h6',
            scope: 'body',
            overwrite: false,
            prefix: 'toc'
        };

        options = $.extend(defaultOpts, options);

        let selector = options.selector;

        if (typeof selector !== 'string') {
            throw new TypeError('selector must be a string');
        }

        if (!selector.match(/^(?:h[1-6],?\s*)+$/g)) {
            throw new TypeError('selector must contains only h1-6');
        }

        $(this).append(buildTOC(options));

        let currentHash = location.hash;

        if (currentHash) {
            // fix hash
            setTimeout(function () {
                location.hash = '';
                location.hash = currentHash;
            }, 0);
        }

        return $(this);
    };
}));

$( document ).ready(function() {
    $('.js-demo-toc').initTOC({
        selector: 'h2, h3, h4, h5, h6',
        scope: 'body',
        overwrite: true,
        prefix: 'toc'
    });
    $('.js-demo-toc ol').addClass('text-list').addClass('text-list--ordered');
});
