//jslint browser: true
//global window, console, $, ol, swal, Quill, geocodeModule

/**
 * City picker module.
 * @external jQuery
 * @external OL3
 * @external swal
 * @external Quill
 * @external geocodeModule
 * @module
 * @returns {Object} Public functions and variables
 */
var cityPickerModule = (function () {
    'use strict';

    var editor;

    var settings = {
        quill: {
            //readOnly: false,
            //theme: 'snow',
            styles: false,
            formats: ['bold', 'italic', 'strike', 'underline',
                    'font', 'size', 'align', 'color', 'background'] //'bullet', 'list', 'image', 'link'
        }
    };

    

    /**
     * Convert a number to a name according to the range of values
     * @param {number} number - The number to convert
     * @param {number} min - The minimal value the number can have
     * @param {number} min - The minimal value the number can have
     * @param {array} values - Possible returned values sorted from the smallest to the biggest
     * @param {integer} index - Default value (array index starting from 0)
     * @returns {string} One of the possible values
     */
    var numberToName = function (number, min, max, values, index) {
        //if (!$.isNumeric(number)) return values[index];

        // Define the default value with the medium value if empty
        index = index || Math.ceil(values.length / 2);
        // Make sure the number is in the min-max range
        number = Math.min(Math.max(number, min), max);

        var step = (max - min) / values.length;
        var i = (number - min) / step;
        i = i.toFixed(0);
        var name = values[i] || values[index];
        console.log('numberToFontSize(' + number + ', ' + min + ', ' + max + ') step:' + step + ' i:' + i + ' name:' + name);
        return name;
    };



    /**
     * Convert a number to a valid font size-name
     * @param {number} number - Value to convert
     * @param {number} min - The smallest value accepted
     * @param {number} max - The biggest value accepted
     * @returns {string} A valid font size-name from xx-small to xx-large
     */
    var _numberToFontSizeName = function (number, min, max) {
        var array = ['xx-small', 'x-small', 'smaller', 'small', 'normal',
                'large', 'larger', 'x-large', 'xx-large'];
        return numberToName(number, min, max, array, 4);
    };


    /**
     * Convert a number to a valid color name
     * @param {number} number - Value to convert
     * @param {number} min - The smallest value accepted
     * @param {number} max - The biggest value accepted
     * @returns {string} A valid color name
     */
    var _numberToColorName = function (number, min, max) {
        var array = ['lightgray', 'gray', 'black']; // 'whitesmock', 'silver',
        return numberToName(number, min, max, array, 1);
    };



    /**
     * Prepare cursor for insertion
     * - Delete selected text
     * - Move to the end if position cannot be found
     * - Set position to 0 if editor is empty (pos 1)
     * @returns {integer} Cursor position
     */
    var _posBeforeInsert = function () {

        var pos;
        var length = editor.getLength();
        // Focus editor prior to get selection
        if (length > 1) {
            editor.focus();
        }
        var range = editor.getSelection();

        if (range) {
            pos = range.start; //+ 1
            if (range.start !== range.end) {
                editor.deleteText(range.start, range.end);
            }
            console.log('Cursor ready for insertion at pos ' + pos);
        } else {
            pos = length - 1;
            console.log('Cursor is ready for insertion at the last pos ' + pos);
        }
        //if (pos === 1) pos = 0;

        return pos;

    };



    /**
     * Add city name to the editor
     * @param {Object} json - The JSON object returned by Nominatim
     */
    var _insertCity = function (json) {

        var size,
            color,
            names = [],
            types = ['country', 'state', 'county',
                    'city', 'town', 'village', 'hamlet']; //'state_district', 'city_district',
        //var smallestAreaType = $('#smallest_area_type').val() || 'village';

        if (!json) {
            return;
        }

        if (json.address) {
            var name;
            types.forEach(function (value) {
                if (json.address[value]) {
                    name = json.address[value];
                    //console.log(value + '/' + smallestAreaType);
                    //if (value === smallestAreaType) {
                    //    return false;
                    //}
                }
            });
            names.push(name);
        }

        if (json.extratags) {
            // Define font size depending on population
            if (json.extratags.population && $('#font_size_proportional').is(':checked')) {
                //var size = (Math.log(json.extratags.population) / 15 + 0.4).toFixed(2) + 'em';
                size = _numberToFontSizeName(Math.log(json.extratags.population) || 0, 0, Math.log(25000000));
            }
            if (json.extratags.population && $('#font_color_proportional').is(':checked')) {
                //var val = (255 - Math.log(json.extratags.population) * 15).toFixed(0);
                //var color = 'rgb(' + val + ', ' + val + ', ' + val + ')';
                color = _numberToColorName(Math.log(json.extratags.population) || 0, 0, Math.log(25000000));
            }
        }

        if (json.namedetails) {
            // Add also the local language name
            if ($('#insert_local_name').is(':checked') && json.namedetails.name) {
                names.push(json.namedetails.name);
            }
        }

        // Insert text
        if (names.length > 0) {
            var pos = _posBeforeInsert();
            var text;

            // Insert icon
            if (json.icon && $('#insert_icon') && $('#insert_icon').is(':checked')) {
                text = json.icon;
                console.log('pos:' + pos + ' text:' + text);
                editor.insertEmbed(pos, 'image', text);
                pos = pos + 1;//text.length;
                //console.log('Cursor positioned at pos:' + pos + '/' + editor.getLength() - 1);
            }

            // Insert city name
            text = $.unique(names).join(' / ');
            editor.insertText(pos, text, {
                'size': size || '1em',
                'color': color || 'black'
            });
            pos = pos + text.length;
            //console.log('Cursor positioned at pos:' + pos + '/' + editor.getLength() - 1);

            // Insert a separator
            var $separator = $('#separator');
            text = ($separator) ? $separator.val() : '\n';
            editor.insertText(pos, text);
            pos = pos + text.length;
            //console.log('Cursor positioned at pos:' + pos + '/' + editor.getLength() - 1);

            // Move cursor after insertions
            editor.setSelection(pos, pos);

            console.log('Cursor positioned at pos:' + pos + '/' + editor.getLength() - 1);


        } else {
            console.log('Extracted data does not contain a city name.');
        }



    };



    /**
     * Use reverse geocode to define the name of the city at a given position
     * @param {object} json - The JSON object returned by Nominatim reverse geocode
     */
    var _getCityDetails = function (json) {

        if (!json || !json.address) {
            return;
        }

        var params = {
            format: 'json',
            limit: 1,
            polygon_svg: 0,
            addressdetails: 1,
            extratags: 1,
            namedetails: 1
            //'accept-language': 'en'
        };

        // Build query
        var query = [];
        // , 'city_district', 'state_district'
        ['village', 'town', 'city', 'county', 'state', 'country'].forEach(function (value) {
            if (json.address[value]) {
                query.push(json.address[value]);
                //console.log(json.address[value]);
                return false;
            }
        });

        // Build params
        $.each({city: 'city', county: 'county', state: 'state', country: 'country',
                'postal_code': 'postalcode', 'country_code': 'countrycodes'}, function (key, value) {
            if (json.address[key]) {
                params[value] = json.address[key];
            }
        });

        geocodeModule.nominatimSearch(params, query).success(function (json) {
            console.log(JSON.stringify(json));
            _insertCity(json[0]);
        });

    };



    /**
     * Use reverse geocode to define the name of the city at a given position
     * @param {object} position - Longitude, latitude at EPSG:4326 projection
     * @param {integer} zoom - Zoom level used for extraction
     */
    var _getCity = function (position, zoom) {

        if (!position || !zoom) {
            return false;
        }

        //console.log('Zoom: ' + zoom);
        zoom = Math.min(Math.max((zoom || 10), 0), 18);
        //console.log('Extraction level: ' + zoom);

        var params = {
            format: 'json',
            lon: position[0],
            lat: position[1],
            zoom: zoom, //$('#zoom_level_extraction').val() || 10
            osm_type: 'N',
            addressdetails: 1,
            extratags: 0,
            namedetails: 0,
            'accept-language': 'en'
        };

        geocodeModule.nominatimReverse(params).success(function (json) {
            //console.log(JSON.stringify(json));

            setTimeout(function () {
                _getCityDetails(json);
            }, 1000);
            /*
            if ($('#font_color_proportional, #font_size_proportional, #insert_local_name, #insert_icon').is(':checked')) {
                // Wait 1s to respect the Nominatim policy
                // and make a seconde request to get more details
                setTimeout(function () {
                    _getCityDetails(json);
                }, 1000);
            } else {
                // Else insert the city name in editor
                _insertCity(json);
            }
            */

        });

    };


    /**
     * Print editor content
     * @param {Object} data - Formated text
     */
    var _print = function (data) {

        console.log(data);

        console.log($('#export_direction').val());
        var $el = $('#export_direction');
        if ($el && $el.val() === 'inline') {
            data = data.replace(/<div>/g, ', ');
            console.log(data);
        }

        var printWin = window.open('', window.location.hostname, ''); //height=600,width=800
        printWin.document.write('<html>'
                + '<head><title>' + window.location.hostname + '</title></head>'
                + '<body>' + data + '</body></html>');
        printWin.print();
        printWin.close();

        return true;
    };



    /**
     * Start listening clicks on the map
     * @public
     * @param {Object} map - OL3 map
     */
    var setMap = function (map) {

        map.on('click', function (evt) {

            var view = map.getView();
            var zoom = view.getZoom();
            var position = evt.coordinate;
            var projection = view.getProjection();

            position = ol.proj.transform(position, projection.getCode(), 'EPSG:4326');
            console.time('Reverse geocoding');
            _getCity(position, zoom);
            console.timeEnd('Reverse geocoding');

        });

    };



    /**
     * Toggle buttons visibility when editor is empty or not
     */
    var _toggleButtonStatusEmptyEditor = function () {

        var $buttons = $('#copy_editor, #print_editor, #erase_editor');
        if (editor.getLength() === 1) {
            $buttons
                .attr('disabled', true)
                .closest('li').addClass('disabled');
            //$('#get_started_alert').fadeIn();
        } else {
            $buttons
                .attr('disabled', false)
                .closest('li').removeClass('disabled');
            //$('#get_started_alert').fadeOut();
        }

    };



    $(document).ready(function () {

        var $editor = $('#editor');

        editor = new Quill('#editor', settings.quill);
        editor.addModule('toolbar', {
            container: '#editor_toolbar'
        });
        var qlMultiCursorModule = editor.addModule('multi-cursor', {
            timeout: 10000
        });

        editor.on('selection-change', function (range) {

            var $buttons = $('#editor_toolbar').find('.ql-bold, .ql-italic, .ql-strike, .ql-underline, .ql-size, .ql-color, .ql-background'); // .ql-font .ql-align .ql-bullet .ql-list .ql-image .ql-link
            
            if (range) {
                if (range.start === range.end) {
                    qlMultiCursorModule.setCursor('selectionStart', range.start, 'Insertion point', '#337ab7');
                    $buttons.attr('disabled', true).closest('li').addClass('disabled');
                    console.log('Cursor is on', range.start);
                } else {
                    //var text = editor.getText(range.start, range.end);
                    $buttons.attr('disabled', false).closest('li').removeClass('disabled');
                    //console.log('User has highlighted', text);
                }
            } else {
                console.log('Cursor not in the editor');
            }
        });

        editor.on('text-change', function (delta, source) {

            // Copy editor content to hidden textarea (for garlic autosave)
            $('#stored_roadbook').val(editor.getHTML()).trigger('change');

            _toggleButtonStatusEmptyEditor();

            // Auto-scroll the textarea to keep the last city visible
            $editor.scrollTop($editor[0].scrollHeight);

        });

        // Populate editor with hidden textarea data
        // once garlic has restored this field
        // then move the cursor to the end
        $('#stored_roadbook').garlic({
            excluded: '',
            onRetrieve: function (elem, retrievedValue) {
                editor.setHTML(retrievedValue);
                //var pos = editor.getLength() - 1;
                //editor.setSelection(pos, pos);
                //console.log('Cursor moved to position ' + pos);
            }
        });

        _toggleButtonStatusEmptyEditor();

        // Print button
        $('#print_editor').click(function (e) {
            e.preventDefault();
            _print(editor.getHTML());
        });

        // Erase button
        $('#erase_editor').click(function (e) {
            e.preventDefault();

            swal({
                title: 'Are you sure?',
                text: 'Your roadbook will be permanently deleted. You will not be able to recover it.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes delete it',
                cancelButtonText: 'No stop !',
                closeOnConfirm: false,
                closeOnCancel: false
            }, function (isConfirm) {
                if (isConfirm) {
                    editor.setText('');
                    swal({
                        title: 'Deleted!',
                        text: 'Your roadbook has been deleted. Let\'s start a new one!',
                        type: 'success',
                        timer: 2500,
                        showConfirmButton: false
                    });
                } else {
                    swal({
                        title: 'Cancelled',
                        text: 'Whew... you narrow escape! ^_^',
                        type: 'error',
                        timer: 2500,
                        showConfirmButton: false
                    });
                }
            });

        });

        // Copy to clipboard button
        /*
        var client = new ZeroClipboard(document.getElementById('copy_editor'));//editor
        client.on('ready', function (readyEvent) {
            console.log('ZeroClipboard ready');
        });
        client.on('copy', function (event) {
            event.clipboardData.setData('text/plain', event.relatedTarget.innerHTML
                //.replace(/[<&>'"]/g, function (c) {
                //    return "&#" + c.charCodeAt() + ";";
                //})
            );
            client.on('aftercopy', function (event) {
                swal({title: 'Good job!', text: 'Your roadbook has been copied to the clipboard.', type: 'success', timer: 2500, showConfirmButton: true});
            });
        });
        client.on('error', function (event) {
            swal({title: 'Oups!', text: 'ZeroClipboard error of type "' + event.name + '": ' + event.message, type: 'warning', timer: 10000, showConfirmButton: true});
            ZeroClipboard.destroy();
        });
        */

        // Show / hide editor toolbar switch
        /*var $el = $('#editor_toolbar_visibility');
        $el.change(function () {
            if ($el.is(':checked')) {
                $('#editor_toolbar').show();
            } else {
                $('#editor_toolbar').hide();
            }
        });//.trigger('change');*/

    });

    return {
        setMap: setMap
        //getCityDetails: getCityDetails,
        //insertCity: insertCity
    };

})();