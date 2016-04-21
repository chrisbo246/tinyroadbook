/*eslint-env browser, jquery */
/*global window */
/* exported numberToName, formatBytes, escapeHtml */
/**
 * Convert a number to a name according to the range of values
 * @public
 * @param {number} number - The number to convert
 * @param {number} min - The minimal value the number can have
 * @param {number} min - The minimal value the number can have
 * @param {array} values - Possible returned values sorted from the smallest to the biggest
 * @param {integer} index - Default value (array index starting from 0)
 * @return {string} One of the possible values
 */
window.numberToName = function (number, min, max, values, index) {
    'use strict';
    //if (!$.isNumeric(number)) return values[index];
    // Define the default value with the medium value if empty
    index = index || Math.ceil(values.length / 2);
    // Make sure the number is in the min-max range
    //number = Math.min(Math.max(number, min), max);
    var step = (max - min) / values.length;
    var i = (number - min) / step;
    i = Math.min(Math.max(i.toFixed(0), 0), values.length - 1);
    var name = values[i] || values[index];
    console.log('numberToFontSize(' + number + ', ' + min + ', ' + max + ') step: ' + step + ' i: ' + i + ' name: ' + name);
    return name;
};



/**
 * Convert bytes to string size
 * @public
 * @param {integer} bytes - Size in bytes
 * @param {integer} decimals - Round number to n decimals
 * @return {string} The formatted value
 */
window.formatBytes = function (bytes, decimals) {
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



/**
 * Convert a HTML string to escaped text
 * @public
 * @param {String} html - HTML code
 * @return {String} HTML code ready for display in <pre><code></code></pre>
 */
window.escapeHtml = function (html) {
    'use strict';

    var entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\x27': '&#39;',
        '/': '&#x2F;'
    };

    return String(html).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });

};
