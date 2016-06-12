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
    settings = $.extend(true, {}, defaults, settings);

    var dfd;
    var queue = [];
    var $spinner = $(settings.selector);

    $spinner.fadeOut();



    /**
     * Add a deferred task to the pending list and show the spinner (if not already)
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
            checkQueue();
        }

    };



    /**
     * Check the pending list and hide the spinner when everything is resolved
     */
    var checkQueue = function () {

        // Reset the main queue and check pending deferreds
        var currentQueue = queue;
        var unresolved = currentQueue.length;
        queue = [];

        $.each(currentQueue, function (i, d) {
            $.when(d).always(function () {

                unresolved = unresolved - arguments.length;

                // If the current queue has been treated
                if (unresolved === 0) {
                    // If the main queue is not empty, check it
                    if (queue.length > 0) {
                        checkQueue();
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
