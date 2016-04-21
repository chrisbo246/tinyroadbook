/*eslint-env browser, jquery */
/*global appModule, commonsModule, Quill, styleModule, swal, addthis_share */
/**
 * City picker module.
 * @module
 * @external $
 * @external appModule
 * @external commonsModule
 * @external Quill
 * @external styleModule
 * @external swal
 * @external addthis_share
 * @return {Object} Public functions / variables
 */
/*eslint-disable no-unused-vars*/
var roadbookModule = (function () {
    /*eslint-enable no-unused-vars*/
    'use strict';

    var editor,
        separator = ' ';

    var settings = {
        basil: {
            namespace: 'roadbook'
        },
        quill: {
            styles: false
        }
    };

    if (typeof Basil === 'function') {
        var basil = new window.Basil(settings.basil);
    }



    /**
     * Extract and filter the smallest place from the Nominatim result
     * @private
     * @param {Object} json - The Nominatim result
     * @return {Object} Place data
     */
    /*var getNominatimPlace = function (json) {

        var place = {
            type: null,
            name: {
                local: null,
                translated: null
            }
        };

        if (json.address) {
            $.each(json.address, function (k, v) {
                place.type = k;
                place.name.translated = v;
                return false;
            });
        }

        if (json.extratags) {
            if (json.extratags.place) {
                place.name.local = json.extratags.place;
            }
        }

        return place;

    };*/



    /**
     * Return the caret position
     * @private
     * @return {integer} Cursor position
     */
    var getCaretPos = function () {

        var pos = 0;
        editor.focus();
        var range = editor.getSelection();
        if (range) {
            pos = range.start;
        } else {
            pos = editor.getLength() - 1;
        }
        console.log('getCaretPos', pos);
        return pos;

    };



    /**
     * Delete selected text
     * @private
     * @return {integer} Cursor position
     */
    var deleteSelection = function () {

        editor.focus();
        var range = editor.getSelection();
        if (range && range.start !== range.end) {
            editor.deleteText(range.start, range.end);
            console.log('Selection deleted from ', range.start + ' to ' + range.end);
        }

    };



    /**
     * Add city name to the editor
     * @private
     * @param {Object} json - The JSON object returned by Nominatim
     */
    var insertCity = function (json) {

        var formats = {span: true}, //, type: 'place'
            names = [],
            translation,
            details = [];

        if (!json) {
            return false;
        }


        // Insert json as data attribut
        //formats.nominatimReverse = JSON.stringify(json);

        formats.latitude = json.lat;
        formats.longitude = json.lon;

        // Retrieve the first and smallest place
        if (json.address) {
            $.each(json.address, function (k, v) {
                formats.place = k;
                translation = v;
                console.log('Smallest place', formats.place);
                return false;
            });
        }

        if (json.extratags) {
            // Exponential population level
            if (json.extratags.population) {
                formats.population = (Math.log(json.extratags.population)).toFixed(0);
            }
            // Administrative place level
            if (json.extratags.capital) {
                formats.capital = json.extratags.capital;
            }
            // Place type
            if (json.extratags.place) {
                formats.place = json.extratags.place;
            }
        }

        if (json.namedetails) {

            // Add the local language name
            if (json.namedetails.name) {
                var array = $.map(json.namedetails.name.split('/'), $.trim);
                $.merge(names, array);
            }

        }

        // Insert text
        if (names.length > 0) {

            deleteSelection();

            var pos = getCaretPos(),
                text = '';

            // Insert city name
            text = $.unique(names).shift();
            editor.insertText(pos, text, formats, 'user');
            pos = pos + text.length;

            // Insert translations
            if (translation && translation !== text) {
                text = separator;
                editor.insertText(pos, text, false, 'user');
                pos = pos + separator.length;
                text = translation;
                editor.insertText(pos, text, {span: true, type: 'translation'}, 'user');
                pos = pos + text.length;
            }

            // Insert city details
            if (details.length > 0) {
                text = separator;
                editor.insertText(pos, text, false, 'user');
                pos = pos + separator.length;
                text = ' ' + ($.unique(details).join(', '));
                editor.insertText(pos, text, {
                    'class': 'details'
                }, 'user');
                pos = pos + text.length;
            }

            editor.insertText(pos, separator, false, 'user');
            pos = pos + separator.length;

            // Move cursor after insertions
            editor.setSelection(pos, pos, 'user');
        } else {
            console.log('Extracted data does not contain a city name.');
        }

    };



    /**
     * Add roqd name to the editor
     * @public
     * @param {Object} json - The JSON object returned by Nominatim
     */
    var insertRoad = function (json) {

        var formats = {span: true, place: 'road'}, //, type: 'road'
            $road = $('#road'),
            name,
            translation;

        //if (json) {
        //    return false;
        //} else if ($road) {
        if (!json && $road) {
            // Use input value as default
            name = $road.val();
            // And also try to retrieve the json data stored in the data-nominatim-reverse attribut
            json = $road.data('nominatim-reverse');
            console.log('Restored road data', json);
            //if (str) {
            //    json = $.parseJSON(str);
            //}
        } //else {
        //    return false;
        //}

        if (json) {

            // Insert json as data attribut
            //formats.nominatimReverse = JSON.stringify(json);

            formats.latitude = json.lat;
            formats.longitude = json.lon;

            if (json.address) {
                // Retrieve the first and smallest place
                $.each(json.address, function (k, v) {
                    formats.place = k;
                    translation = v;
                    console.log('Smallest place', formats.place);
                    return false;
                });
            }

            if (json.namedetails) {
                name = name || json.namedetails.ref || json.namedetails.int_ref || json.namedetails.name || translation;
            }

        }


        if (name) {

            // Delete user selected text
            deleteSelection();

            // Get caret position
            var pos = getCaretPos(),
                text = '';

            // Insert the road name
            text = name;
            editor.insertText(pos, text, formats, 'user');
            pos = pos + text.length;

            // Insert a white space
            editor.insertText(pos, separator, false, 'user');
            pos = pos + separator.length;

            // Move cursor after insertions
            editor.setSelection(pos, pos, 'user');

        }

    };


    /**
     * Add a poi to the editor
     * @private
     * @param {Object} json - The JSON object returned by Nominatim
     */
    var insertPOI = function (json) {

        var formats = {span: true}, //, type: 'poi'
            name,
            translation,
            placeType;

        if (!json) {
            return false;
        }

        // Insert json as data attribut
        //formats.nominatimReverse = JSON.stringify(json);

        formats.latitude = json.lat;
        formats.longitude = json.lon;

        if (json.address) {
            // Retrieve the first and smallest place
            $.each(json.address, function (k, v) {
                formats.place = k;
                translation = v;
                placeType = k;
                if (k === 'road') {
                    console.log('Place type refused', k);
                    return false;
                }
                console.log('Smallest place', formats.place);
                return false;
            });
        }

        if (json.address) {
            // Retrieve the first and smallest place
            $.each(json.address, function (k, v) {
                formats.place = k;
                translation = v;
                console.log('Smallest place', formats.place);
                return false;
            });
        }

        if (json.namedetails) {

            // Add the local language name
            if (json.namedetails.name) {
                name = json.namedetails.name;
            }

        }

        // Insert text
        if (name && placeType) {

            deleteSelection();

            var pos = getCaretPos(),
                text = '';

            // Insert POI name
            text = name;
            editor.insertText(pos, text, formats, 'user');
            pos = pos + text.length;

            // Insert translations
            if (translation && translation !== text) {
                text = separator;
                editor.insertText(pos, text, false, 'user');
                pos = pos + separator.length;
                text = translation;
                editor.insertText(pos, text, {span: true, type: 'translation'}, 'user');
                pos = pos + text.length;
            }

            // Add a space
            editor.insertText(pos, separator, false, 'user');
            pos = pos + separator.length;

            // Move cursor after insertions
            editor.setSelection(pos, pos, 'user');
        } else {
            console.log('Extracted data does not contain a name.');
        }

    };


    /**
     * Ask a confirmation before overwriting editor HTML
     * @private
     * @param {String} html - Roadbook HTML
     */
    var replaceHtmlAlert = function (html) {

        if (editor.getLength()) {
            swal({
                title: 'Replace styles ?',
                text: 'The current styles will be overwritten.\nDo you really want to continue?',
                type: 'warning',
                confirmButtonText: 'Yes replace',
                cancelButtonText: 'No stop !',
                showCancelButton: true,
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-warning',
                cancelButtonClass: 'btn btn-warning'
            }, function (isConfirm) {
                if (isConfirm) {
                    editor.setHTML(html);
                }
            });
        } else {
            editor.setHTML(html);
        }

    };



    /**
     * Toggle buttons visibility when editor is empty or not
     */
    var toggleButtonStatusEmptyEditor = function () {

        var $buttons = $('#save_roadbook, #copy_roadbook, #print_roadbook, #new_roadbook, #erase_roadbook, [data-target="#style_edition_modal"]');
        var state = (editor.getLength() > 1);
        $buttons
            .attr('disabled', !state)
            .closest('li').toggleClass('disabled', !state);

    };




    /**
     * Print editor content
     * @private
     * @param {Object} data - Formated text
     */
    var print = function () {

        var htmlDoc = appModule.buildExport();
        if (htmlDoc) {
            var printWin = window.open('', window.location.hostname, '');
            printWin.document.write(htmlDoc);
            printWin.print();
            printWin.close();
        }

    };



    /**
     * Return editor instance
     */
    var getEditor = function () {
        return editor;
    };



    /**
     * Initialize the visual editor
     */
    var initEditor = function () {

        var $editor = $('#editor');

        // Initialize the Quill editor with the toolbar module and custom formats
        editor = new Quill('#editor', settings.quill);

        $('#editor').find('.ql-editor').addClass('roadbook');
        editor.addModule('toolbar', {
            container: '#style_edition_modal'
        });
        //var qlMultiCursorModule = editor.addModule('multi-cursor', {
        //    timeout: 10000
        //});

        editor.addFormat('span', {tag: 'span'});
        editor.addFormat('type', {attribute: 'data-type'});
        editor.addFormat('place', {attribute: 'data-place'});
        editor.addFormat('population', {attribute: 'data-population'});
        editor.addFormat('capital', {attribute: 'data-capital'});
        editor.addFormat('placeType', {attribute: 'data-place-type'});
        editor.addFormat('latitude', {attribute: 'data-latitude'});
        editor.addFormat('longitude', {attribute: 'data-longitude'});
        editor.addFormat('nominatimReverse', {attribute: 'data-nominatim-reverse'});

        // Watch text changes
        // @param delta, source
        editor.on('text-change', function () {

            // Enable / disable the print / Erase buttons
            toggleButtonStatusEmptyEditor();

            // Update the save button URL
            appModule.updateSaveLink();

            // Auto-scroll the textarea to keep the last city visible
            $editor.scrollTop($editor[0].scrollHeight);

            // Update the code preview
            $('#roadbook_editor_contents').html(JSON.stringify(editor.getContents()));

            // Store roadbook
            if (basil) {
                basil.set('roadbook_editor_contents', editor.getContents());
            }

        });

        // Watch text selection
        editor.on('selection-change', function (range, source) {

            var $buttons = $('#editor_toolbar').find('[data-target="#style_edition_modal"], .ql-bold, .ql-italic, .ql-strike, .ql-underline, .ql-size, .ql-color, .ql-background'); // .ql-font .ql-align .ql-bullet .ql-list .ql-image .ql-link

            if (range) {
                if (range.start === range.end) {
                    $buttons.attr('disabled', true).closest('li').addClass('disabled');
                    console.log('Caret moved by ' + source, range.start);
                } else {
                    $buttons.attr('disabled', false).closest('li').removeClass('disabled');
                    console.log('Text selected by ' + source, range.start + ' to ' + range.end);
                }
            } else {
                console.log('Editor lost focus');
            }
        });

        // Restore editor content from the local storage
        // then move the cursor to the end of the text
        if (basil) {
            var contents = basil.get('roadbook_editor_contents');
            if (contents) {
                editor.getSelection();
                editor.setContents(contents);
                console.log('Roadbook content restored');
                var pos = editor.getLength() - 1;
                editor.setSelection(pos, pos, 'user');
            }
        }

    };



    /**
     * Manage buttons
     * @private
     */
    var initToolbar = function () {

        // Disable some buttons when the editor is empty
        toggleButtonStatusEmptyEditor();

        // Watch the print button
        $('#print_roadbook').click(function (e) {
            e.preventDefault();
            print(editor.getHTML());
        });

        // Watch insert road button
        $('#insert_road').click(function (e) {
            e.preventDefault();
            insertRoad();
        });

        // Watch the erase button
        $('#erase_roadbook, #new_roadbook').click(function (e) {
            e.preventDefault();
            swal({
                title: 'Delete roadbook ?',
                text: 'The current roadbook will be permanently removed.\nDo you really want to continue?',
                type: 'warning',
                confirmButtonText: 'Yes delete',
                cancelButtonText: 'No cancel',
                showCancelButton: true,
                closeOnConfirm: false
                //closeOnCancel: false
            }, function (isConfirm) {
                if (isConfirm) {
                    editor.deleteText(0, editor.getLength() - 1, 'user');
                    swal({
                        title: 'Deleted!',
                        text: 'Your roadbook has been deleted.\nLet\'s start a new one!',
                        type: 'success',
                        timer: 3000,
                        showConfirmButton: false
                    });
                }/* else {
                    swal({
                        title: 'Cancelled',
                        text: 'Whew... you narrow escape!',
                        type: 'error',
                        timer: 3000,
                        showConfirmButton: false
                    });
                }*/
            });
        });

    };



    /**
     * Initialize editor and toolbar
     * @public
     */
    var init = function () {

        initEditor();
        initToolbar();

        // Focus editor when the style modal is open
        //$('#style_edition_modal').on('shown.bs.modal', function () {
        //    editor.focus();
        //    console.log('Editor focused');
        //});

    };



    /**
     * Document ready
     */
    $(function () {

        var $modal = $('#style_edition_modal');
        $modal.find('.modal-footer .btn-primary').on('click', function () {
            $modal.modal('hide');
        });


    });



    return {
        getEditor: getEditor,
        init: init,
        insertCity: insertCity,
        insertRoad: insertRoad,
        insertPOI: insertPOI,
        replaceHtmlAlert: replaceHtmlAlert
    };

})();
