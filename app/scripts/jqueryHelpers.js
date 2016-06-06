/*eslint-env browser, jquery */
/*global $ */

/*eslint-disable no-unused-vars, no-use-before-define, no-extend-native*/

/**
 * Parse an URL and return query string parameters as a JSON object
 * @return {Object} Query string parameters
 */
if (typeof $.urlParam === 'undefined') {
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
}



// String ---------------------------------------------------------------------

/**
 * Convert the first letter to upper case
 */
if (typeof String.prototype.toUpperCaseFirst === 'undefined') {
    String.prototype.toUpperCaseFirst = function() {
        'use strict';
        return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
    };
}

/**
 * Convert the first letter of each words to upper case
 */
/*if (typeof(String.prototype.toUpperCaseWords) === 'undefined') {
    String.prototype.toUpperCaseWords = function (array) {
        'use strict';
        return this.replace(/([\w\p])([\W\P])/g, function (g) {
                return g[0] + g[1].toUpperCase();
            });
    };
}*/

/**
 * Convert hyphen string to camelcase
 */
if (typeof toCamel === 'undefined') {
    var toCamel = function () {
        'use strict';
        return this.toLowerCase().replace(/[^a-zA-Z0-9]([a-zA-Z0-9])?/g, function (g) {
                return (g[1]) ? g[1].toUpperCase() : '';
            });
    };
}
if (typeof String.prototype.toCamel === 'undefined') {
    String.prototype.toCamel = function (array) {
        'use strict';
        return this.toLowerCase().replace(/[^a-zA-Z0-9]([a-zA-Z0-9])?/g, function (g) {
                return (g[1]) ? g[1].toUpperCase() : '';
            });
    };
}



// ARRAY ----------------------------------------------------------------------

/**
 * Function to get the Maximum value in Array
 */
if (typeof Array.prototype.max === 'undefined') {
    Array.prototype.max = function (array) {
        'use strict';
        return Math.max.apply(Math, array);
    };
}


/**
 * Function to get the Minimum value in Array
 */
if (typeof Array.prototype.min === 'undefined') {
    Array.prototype.min = function (array) {
        'use strict';
        return Math.min.apply(Math, array);
    };
}



/**
 * Array intersection
 */

/*$.intersect = function (a, b) {
    'use strict';
    return $.grep(a, function (i) {
        return $.inArray(i, b) > -1;
    });
};*/



// MATH -----------------------------------------------------------------------

/**
 * Convert degrees to radians
 */
if (typeof degToRad === 'undefined') {
    var degToRad = function (deg) {
        'use strict';
        return deg * Math.PI * 2 / 360;
    };
}
if (typeof Number.prototype.toRad === 'undefined') {
    Number.prototype.toRad = function() {
        'use strict';
        return this * Math.PI / 180;
    };
}

/**
 * Convert radians to degrees
 */
if (typeof radToDeg === 'undefined') {
    var radToDeg = function (rad) {
        'use strict';
        return rad * 360 / (Math.PI * 2);
    };
}
if (typeof Number.prototype.toDeg === 'undefined') {
    Number.prototype.toDeg = function() {
        'use strict';
        return this * 360 / (Math.PI * 2);
    };
}


/**
 * Modulo for negative values
 */
if (typeof mod === 'undefined') {
    var mod = function (n) {
        'use strict';
        return ((n % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
    };
}
if (typeof Number.prototype.mod === 'undefined') {
    Number.prototype.mod = function() {
        'use strict';
        return ((this % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
    };
}



/**
 * Convert bytes to string size
 * @param {integer} bytes - Size in bytes
 * @param {integer} decimals - Round number to n decimals
 * @returns {string} The formatted value
 */
if (typeof formatBytes === 'undefined') {
    var formatBytes = function (bytes, decimals) {
        'use strict';
        if (bytes === 0) {
            return '0 Byte';
        }
        var k = 1000;
        var dm = decimals + 1 || 3;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
    };
}



// EVENT ----------------------------------------------------------------------

/**
 * Return all events binded on an element
 * The result
 * @return string Events list separated with a space, can be used with $(element).on(result, ...
 */
 // jQuery._data(jQuery('.chosen-select')[0], 'events')
 if (typeof getAllEvents === 'undefined') {
     var getAllEvents = function (element) {
        'use strict';
        var result = [];
        for (var key in element) {
            if (key.indexOf('on') === 0) {
                result.push(key.slice(2));
            }
        }
        return result.join(' ');
    };
}



/*eslint-enable no-unused-, no-use-before-define*/
