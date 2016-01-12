
/**
 * Adsense module.
 * @external jQuery
 * @external Adsense
 * @module
 * @returns {Object} Public functions and variables
 */
var adsenseModule = (function () {
    'use strict';

    var settings = {
        containers: '.adsbygoogle',
        adClient: 'ca-pub-8495719252049968', // Client id used when attribut is missing
        adSlot: '3723415549', // Default ad slot when attribut is missing
        adFormat: 'auto' // Default ad format when attribut is missing
    };



    /**
     * Search ad containers in given block and insert ad
     * @param {string} selector - Div selector from where to start ad block search
     */
    var _insertAds = function (selector) {

        var $block = (selector) ? $(selector) : $('body');
        if (!$block) {
            return;
        }

        $block.find(settings.containers).filter(':visible').each(function (i, container) {

            var $container = $(container);

            if (!$container.attr('data-adsbygoogle-status')) {

                // Inset missing attributs
                if (!$container.attr('data-ad-client')) {
                    $container.attr('data-ad-client', settings.adClient);
                }
                if (!$container.attr('data-ad-slot')) {
                    $container.attr('data-ad-slot', settings.adSlot);
                }
                if (!$container.attr('data-ad-format')) {
                    $container.attr('data-ad-format', settings.adFormat);
                }

                // Initialize ad
                (adsbygoogle = window.adsbygoogle || []).push({});
            }

        });
    };



    /**
     * Search Bootstrap hidden tabs
     * @param {string} selector - Div selector from where to start ad block search 
     */
    var _findHiddenAds = function (selector) {

        var $block = (selector) ? $(selector) : $('body');
        if (!$block) return;

        $block.find('a[data-toggle="tab"]').filter(':not(.active)').each(function (i, tab) {
            $(tab).one('shown.bs.tab', function (e) {
                var paneId = $(e.target).attr('href');
                _insertAds(paneId);
                _findHiddenAds(paneId);
            });
        });

    };



    /**
     * Find ad blocks, add missing attributs and initialise ads
     * @public
     * @param {object} [customSettings] - Adsense parameters
     */
    var init = function (customSettings) {

        $.extend(settings, customSettings || {});

        $(window).on('load', function () {
            // Initialize visible ads
            _insertAds();
            // Delay ad initialisation in hidden tabs
            _findHiddenAds();
        });

    };



    /**
     * Auto insert Adsense script when document is ready
     */
    $(document).ready(function () {
        $('body').append('<!-- Google Adsense -->'
            + '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>');
    });



    return {
        init: init
    };

})();