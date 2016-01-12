/**
 * Bootstrap tab module.
 * @external jQuery
 * @external Bootstrap
 * @module
 * @returns {Object} Public functions and variables
 */
var tabModule = (function () {
    'use strict';

    /**
     * Show the last displayed tab  using local storage
     * Usage: tabModule.rememberTab('#main-nav', !localStorage);
     * @public
     * @param {string} tabSelector - Tabs selector
     * @param {boolean} useHash - Restore tab from URL hash or not?
     */
    var rememberTab = function (tabSelector, useHash) {

        var key = 'selectedTabFor' + tabSelector;

        if (get(key)) {
            $(tabSelector).find('a[href="' + get(key) + '"]').tab('show');
        }
        
        $(tabSelector).on('click', 'a[data-toggle]', function (event) {
            set(key, this.getAttribute('href'));
        });

        function get(key) {
            return useHash ? location.hash: localStorage.getItem(key);
        }

        function set(key, value) {
            if (useHash) {
                location.hash = value;
            } else {
                localStorage.setItem(key, value);
            }
        }

    };



    return {
        rememberTab: rememberTab
    };

})();