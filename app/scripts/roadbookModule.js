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

    /* Nominatim extratags that will be stored in a data attribute */
    var allowedTags = [
        'cuisine',
        'place',
        'population',
        'religion',
        'shop'
    ];

    var disallowedTags = [
        'description',
        'denomination',
        'wikidata',
        'wikipedia', // wikipedia:
        'contact', // contact:
        'website',
        'opening_hours',
        'drive_through',
        'data-wheelchair'
        //'phone',
    ];



    if (typeof Basil === 'function') {
        var basil = new window.Basil(settings.basil);
    }



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
     * @public
     * @param {Object} json - The JSON object returned by Nominatim
     * @param {String} [options] - Nominatim result override
     */
    var insertNominatimResult = function (json, options) {

        var formats = {span: true},
            names = [],
            translation,
            text = '';

        json = $.extend(true, json || {}, options);
        console.log('json', json);

        // Add the longitude and latitude data attributes
        if (json && json.lat && json.lon) {
            formats.latitude = json.lat;
            formats.longitude = json.lon;
        }

        // Retrieve the first and smallest place
        if (json && json.address) {
            $.each(json.address, function (k, v) {
                formats.addrType = k; //k.toLowerCase()
                translation = v;
                if (k === 'house_number' && json.address.road) {
                    translation = translation + ' ' + json.address.road;
                }
                console.log('Detected type', formats.type);
                return false;
            });
        }

        if (json && json.extratags) {
            // Exponential population level
            if (json.extratags.population) {
                formats.populationLevel = (Math.log(json.extratags.population)).toFixed(0);
            }
            // Administrative place level
            if (json.extratags.capital) {
                formats.capital = json.extratags.capital;
            }
            // Place type
            //if (json.extratags.place) {
            //    formats.class = 'place';
            //    formats.type = json.extratags.place.toLowerCase();
            //}
            // Add tag values to a data attribute
            $.each(json.extratags, function (k, v) {
                // If key look like "key:value", keep only the key
                k = k.replace(/[:].*$/, ''); //k.split(':')[0];
                // Exclude some tags
                if ($.inArray(k, disallowedTags) === -1) {
                    // If editor format is not defined, create it
                    if ($.inArray(k, allowedTags) === -1) {
                        allowedTags.push(k);
                        editor.addFormat(k, {attribute: 'data-' + k});
                    }
                    formats[k] = v;
                }
            });
        }

        if (json && json.class) {
            formats.class = json.class;
        }

        if (json && json.type) {
            formats.type = json.type;
        }

        if (json && json.icon) {
            var icon = json.icon.replace(/^.*\//g, '').replace(/\.[a-z]+\.[0-9]+\.png/i, '');
            formats.icon = icon;
        }

        if (json && json.namedetails) {
            // Add the local language name
            if (json.namedetails.name) {
                var array = $.map(json.namedetails.name.split(/(?:[\/,;:]| - )+/), $.trim);
                $.merge(names, array);
            }
        }

        if (options) {
            // If a custom name was provided, don't use the translation
            if (options.namedetails && json.namedetails.name) {
                //names.push(json.namedetails.name);
                translation = null;
            }
        }

        // If no name was found, use the translation as alternative
        if (!names.length && translation) {
            names.push(translation);
            translation = null;
        }

        // Insert text
        if (names.length > 0) {

            // Delete user selected text
            deleteSelection();

            // Get cursor position
            var pos = getCaretPos();

            // Insert icon if exists
            /*url = 'http://www.sjjb.co.uk/mapicons/png/' + poiCategories[formats.type] + '_' + formats.type + '.p.12.png';
            editor.insertEmbed(pos, 'image', url, 'user');
            pos = pos + 1;
            editor.insertText(pos, separator, false, 'user');
            pos = pos + separator.length;*/
            /*$.ajax({
                url: url,
                dataType: 'text',
                type: 'GET'
            }).done(function () {
                editor.insertEmbed(pos, 'image', url, 'user');
                pos = pos + 1;
                editor.insertText(pos, separator, false, 'user');
                pos = pos + separator.length;
            });*/

            // Insert the name
            console.log('Names', names);
            text = $.unique(names).shift();
            editor.insertText(pos, text, formats, 'user');
            pos = pos + text.length;

            // Insert the translation
            if (translation && translation !== text) { //&& !customName
                text = separator;
                editor.insertText(pos, text, false, 'user');
                pos = pos + separator.length;
                text = translation;
                editor.insertText(pos, text, {span: true, class: 'translation'}, 'user');
                pos = pos + text.length;
            }

            // Insert a white space
            editor.insertText(pos, separator, false, 'user');
            pos = pos + separator.length;

            // Move cursor after insertions
            editor.setSelection(pos, pos, 'user');

            console.log('Nominatim result inserted.');
        } else {
            console.log('Nominatim result does not contain any valid place name.');
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
                title: 'Replace styles',
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

        var $buttons = $('.save_roadbook, .copy_roadbook, .print_roadbook, .new_roadbook, .erase_roadbook, [data-target="#style_edition_modal"]');
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

        appModule.buildExport().done(function(htmlDoc) {
            var printWin = window.open('', window.location.hostname, '');
            printWin.document.write(htmlDoc);
            printWin.print();
            printWin.close();
        });

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
        /*if ($('#style_edition_modal')) {
            editor.addModule('toolbar', {
                container: '#style_edition_modal'
            });
        }*/
        //var qlMultiCursorModule = editor.addModule('multi-cursor', {
        //    timeout: 10000
        //});

        //editor.addFormat('place', {attribute: '[data-type'});
        editor.addFormat('capital', {attribute: 'data-capital'});
        editor.addFormat('class', {attribute: 'data-class'});
        editor.addFormat('icon', {attribute: 'data-icon'});
        editor.addFormat('latitude', {attribute: 'data-latitude'});
        editor.addFormat('longitude', {attribute: 'data-longitude'});
        editor.addFormat('nominatimReverse', {attribute: 'data-nominatim-reverse'});
        editor.addFormat('placeType', {attribute: '[data-type-type'});
        editor.addFormat('populationLevel', {attribute: 'data-population-level'});
        editor.addFormat('span', {tag: 'span'});
        editor.addFormat('tagType', {attribute: 'data-tag-type'});
        editor.addFormat('tagValue', {attribute: 'data-tag-value'});
        editor.addFormat('type', {attribute: 'data-type'});
        editor.addFormat('addrType', {attribute: 'data-address-type'});

        $.each(allowedTags, function(i, v) {
            editor.addFormat(v, {attribute: 'data-' + v}); //.replace(/[_ ]/, '-')
        });

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
        $('.print_roadbook').click(function (e) {
            e.preventDefault();
            print();
        });

        // Watch insert road button
        $('#insert_road').click(function (e) {
            e.preventDefault();
            var $input = $('#road');
            var json = $input.data('nominatim-reverse');
            var name = $input.val();
            roadbookModule.insertNominatimResult(json, name);
        });

        // Watch the erase button
        $('.erase_roadbook, .new_roadbook').click(function (e) {
            e.preventDefault();
            swal({
                title: 'Delete roadbook',
                text: 'The current roadbook will be permanently removed.\nDo you really want to continue?',
                type: 'warning',
                confirmButtonText: 'Yes delete',
                cancelButtonText: 'No cancel',
                showCancelButton: true
                //closeOnConfirm: false,
                //closeOnCancel: false
            }, function (isConfirm) {
                if (isConfirm) {
                    editor.deleteText(0, editor.getLength() - 1, 'user');
                    if (e.currentTarget.id === 'new_roadbook') {
                        //$('#file_settings_modal').modal('show');
                    } else {
                        swal({
                            title: 'Deleted!',
                            text: 'Your roadbook has been deleted.\nLet\'s start a new one!',
                            type: 'success',
                            timer: 3000,
                            showConfirmButton: false
                        });
                    }
                }
            });
        });

        // Roadbook settings modal
        $('#file_settings_form').on('submit', function (e) {
            e.preventDefault();
            $('#file_settings_modal').modal('hide');
            appModule.updateSaveLink();
            $('.save_roadbook').first().trigger('click');
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

        // Map / editor width setting
        $('#map_width').on('change', function (e) {

            var $cols = $('#editor_pane').find('.container-fluid > .row > div');
            var width = e.target.value;

            // Remove col-md-* classes
            $cols.removeClass(function (i, css) {
                return (css.match(/(^|\s)col-md-\S+/g) || []).join(' ');
            });

            // Add the new col-md-* classes
            $cols.eq(0).addClass('col-md-' + width);
            $cols.eq(1).addClass('col-md-' + (12 - width));

            // Trigger a window resize to refresh map size
            //$(window).trigger('resize');

        }).trigger('change');

    });



    return {
        getEditor: getEditor,
        init: init,
        insertNominatimResult: insertNominatimResult,
        replaceHtmlAlert: replaceHtmlAlert
    };

})();
