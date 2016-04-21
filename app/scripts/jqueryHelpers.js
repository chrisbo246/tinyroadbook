/*eslint-env browser, jquery */
/*global $ */
/**
 * Parse an URL and return query string parameters as a JSON object
 * @return {Object} Query string parameters
 */
$.urlParam = function (name) {
    'use strict';
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results === null) {
       return null;
    }
    else{
       return results[1] || 0;
    }
};
