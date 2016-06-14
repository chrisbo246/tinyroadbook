/*eslint-env browser, jquery */
/*global ol */
/**
* Manage deferred queue and spinner
* @see https://jsfiddle.net/hds1ror1/2/
* @class
* @external $
* @param {Object} map - ol initialized map
* @param {Object} settings - Module settings override
* @return {Object} Public functions / variables
*/
/*eslint-disable no-unused-vars*/
var Spinner = function (settings) {
    /*eslint-enable no-unused-vars*/
    'use strict';

    var defaults = {
        selector: '.spinner'
    };

    // Merge default and custom settings
    settings = $.extend({}, defaults, settings);

    var dfd;
    var queue = [];
    var $spinner = $(settings.selector);

    $spinner.fadeOut();

    /*
    * @param {Object} deferred - A deferred or a function that return a deferred
    */
    var addJob = function (deferred) {

        // Add the deferred to the pending deferreds array
        // (but first, check if this is a deferred)
        if (typeof deferred.state !== 'undefined') {
            queue.push(deferred);
        } else {
            console.warn('Parameter shoud be a deferred');
            return false;
        }

        // Check pending deferreds state only
        // once the previous queue end
        // and if there are pending deferreds of course
        if (!dfd || dfd.state() !== 'pending') {
            $spinner.fadeIn();
            dfd = new $.Deferred();
            checkPendingDeferreds();
        }

    };

    var checkPendingDeferreds = function () {

        var array = queue;
        var unresolved = array.length;
        console.log('Checking next', unresolved);
        queue = [];

        $.each(array, function (i, d) {
            $.when(d).always(function () {

                //var objects = arguments; // The array of resolved
                //unresolved = unresolved - objects.length;

                unresolved = unresolved - 1;

                // If current queue has been treated
                if (unresolved <= 0) {
                    // Check if there are pending deferreds
                    if (queue.length > 0) {
                        checkPendingDeferreds();
                    } else {
                        // Else resolve the main deferred
                        // and hide the spinner
                        dfd.resolve();
                        $spinner.fadeOut();
                    }
                }

            });
        });

    };

    return {
        addJob: addJob
    };

};
