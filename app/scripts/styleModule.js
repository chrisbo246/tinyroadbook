/*eslint-env browser, jquery */
/*global appModule, Quill, swal */
/**
 * Custom style edition.
 * @module
 * @external $
 * @external appModule
 * @external Basil
 * @external Quill
 * @external swal
 * @return {Object} Public functions / variables
 */
/*eslint-disable no-unused-vars*/
var styleModule = (function () {
    /*eslint-enable no-unused-vars*/
    'use strict';

    var settings = {
        style: {
            containerSelector: '#roadbook_style'
        },
        basil: {
            namespace: 'roadbook_style_editor'
        },
        quill: {
            containerSelector: '#roadbook_style_editor',
            styles: false,
            formats: []
        }
    };



    // Global variables
    var editor,
        basil = new window.Basil(settings.basil);



    /**
     * Extract styles from imported HTML, populate the style tag and update the editor
     * @param {String} htmlDoc - Imported file content
     */
    /*var importStyle = function (htmlDoc) {

        //var style = extractStyle();
        editor.setText(style);
        updateStyle();

    };*/



    /**
     * Ask a confirmation before overwriting styles
     * @public
     * @param {String} text - The new style
     */
    var replaceTextAlert = function (text) {

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
                    editor.setText(text);
                    updateStyle();
                }
            });
        } else {
            editor.setText(text);
            updateStyle();
        }

    };



    /**
     * Return the style tag content
     */
    var getStyle = function () {

        //return $(settings.style.containerSelector).html();
        return editor.getText();

    };



    /**
     * Apply editor changes
     * @private
     */
    var updateStyle = function () {

        // Retrieve editor content
        var style = editor.getText();

        // Save style in the style tag
        $(settings.style.containerSelector).html(style);

        // Store editor content with native format
        basil.set('contents', editor.getContents());

        console.log('Style updated');

    };



    /**
     * Initialize the style editor
     */
    var initEditor = function () {

        // Initialize the style editor
        editor = new Quill(settings.quill.containerSelector, settings.quill);

        // When editor content change
        editor.on('text-change', function (delta, source) {

            // Changes made by user only
            if (source === 'user') {
                updateStyle();
            }

            // Update the save button URL
            appModule.updateSaveLink();

        });

        // Save the tag content in a data attribut (for reset function)
        var style = $(settings.style.containerSelector).html();
        $(settings.style.containerSelector).attr('data-default-value', style);

        // If local storage exists
        var contents = basil.get('contents');
        if (contents) {
            // Restore editor content from local storage
            editor.setContents(contents);
            updateStyle();
        } else {
            // Else populate editor with the style tag content
            editor.setText(style);
        }

        // Reset style button
        $('#reset_style').click(function () {
            //var style = $(settings.style.containerSelector).html();
            style = $(settings.style.containerSelector).data('default-value');
            editor.setText(style);
            updateStyle();
            swal({
                title: 'Done!',
                text: 'Styles have been reset with the default values.',
                type: 'success',
                timer: 3000,
                showConfirmButton: false
            });
        });

    };



    /**
     * Return editor instance
     */
    var getEditor = function () {
        return editor;
    };



    /**
     * Initialization
     * @public
     */
    var init = function () {
        initEditor();
    };



    $(function () {


    });


    // Public functions and variables
    return {
        getEditor: getEditor,
        init: init,
        getStyle: getStyle,
        updateStyle: updateStyle,
        replaceTextAlert: replaceTextAlert
    };

})();
