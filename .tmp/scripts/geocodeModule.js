'use strict';

/*eslint-env browser, jquery */
/*global $ */
//
// http://wiki.openstreetmap.org/wiki/Nominatim_usage_policy
// http://wiki.openstreetmap.org/wiki/Nominatim
//
/**
 * OL3 geocode module.
 * @module
 * @external $
 * @return {Object} Public functions / variables
 */
/*eslint-disable no-unused-vars*/
var geocodeModule = function () {
    /*eslint-enable no-unused-vars*/
    'use strict';

    /**
     * Geocode search using Openstreetmap Nominatim
     * @public
     * @param {object} params - Request parameters
     * @param {string} query - Formated address
     * @return {Object} jqHXR
     */

    var nominatimSearch = function nominatimSearch(params, query) {
        var url = 'http://nominatim.openstreetmap.org/search/' + encodeURI(query) + '?' + $.param(params);
        console.log(url);
        return $.ajax({
            url: url,
            error: function error(jqxhr, status, _error) {
                console.warn(status, _error);
            }
        });
    };

    /**
     * Reverse geocode using Openstreetmap Nominatim
     * @public
     * @param {Object} params - Request parameters
     * @return {Object} jqXHR
     */
    var nominatimReverse = function nominatimReverse(params) {

        console.time('Nominatim reverse geocoding complete');

        var url = 'http://nominatim.openstreetmap.org/reverse?' + $.param(params);
        console.log('Nominatim reverse geocoding request', url);

        return $.ajax({
            url: url
        }).done(function (json) {
            console.log('Nominatim reverse geocoding result', JSON.stringify(json));
        }).fail(function () {
            console.warn('Nominatim reverse geocoding failed');
        }).always(function () {
            console.timeEnd('Nominatim reverse geocoding complete');
        });
    };

    return {
        nominatimSearch: nominatimSearch,
        nominatimReverse: nominatimReverse
    };
}();
//# sourceMappingURL=geocodeModule.js.map
