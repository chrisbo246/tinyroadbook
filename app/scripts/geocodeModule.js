//jslint browser: true, devel: true
//global window, console, $
//
// http://wiki.openstreetmap.org/wiki/Nominatim_usage_policy
//

/**
 * OL3 geocode module.
 * @external jQuery
 * @module
 * @returns {Object} Public functions and variables
 */
var geocodeModule = (function () {
    'use strict';


    /**
     * Geocode search using Openstreetmap Nominatim
     * @public
     * @param {object} params - Request parameters
     * @param {string} query - Formated address
     * @returns {Object} jqHXR
     */
    var nominatimSearch = function (params, query) {

        var url = 'http://nominatim.openstreetmap.org/search/' + encodeURI(query) + '?' + $.param(params);
        console.log(url);

        return $.ajax({
            url: url,
            error: function (jqxhr, status, error) {
                console.warn(status);
            }

        });
    };



    /**
     * Reverse geocode using Openstreetmap Nominatim
     * @public
     * @param {Object} params - Request parameters
     * @returns {Object} jqXHR
     */
    var nominatimReverse = function (params) {

        var url = 'http://nominatim.openstreetmap.org/reverse?' + $.param(params);
        console.log(url);

        return $.ajax({
            url: url,
            error: function (jqxhr, status, error) {
                console.warn(status);
            }
        });

    };


    return {
        nominatimSearch: nominatimSearch,
        nominatimReverse: nominatimReverse
    };

})();