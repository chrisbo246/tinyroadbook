/*eslint-env browser, jquery */
/*global commonsModule, Quill, roadbookModule, styleModule, swal */
/**
 * Roadbook import.
 * @module
 * @external $
 * @external commonsModule
 * @external Quill
 * @external roadbookModule
 * @external styleModule
 * @external swal
 * @return {Object} Public functions / variables
 */
/*eslint-disable no-unused-vars*/
var importModule = (function () {
    /*eslint-enable no-unused-vars*/
    'use strict';



    /**
     * Extract the body from an imported HTML roadbook and populate the editor
     * @private
     * @param {String} htmlDoc - HTML document content
     */
    /*var importRoadbook = function (htmlDoc) {

        var html = $('<div>').append(htmlDoc).find('.roadbook').html();
        var roadbookEditor = roadbookModule.getEditor();
        roadbookEditor.setHTML(html);

    };*/



    /**
     * Extract the body from an imported HTML roadbook
     * @public
     * @return {String} HTML roadbook
     */
    var extractRoadbook = function (htmlDoc) {

        return $('<div>').append(htmlDoc).find('.roadbook').html();

    };



    /**
     * Extract styles from imported HTML
     * @param {String} htmlDoc - Imported file content
     * @return {String} CSS style
     */
    var extractStyle = function (htmlDoc) {

        return $('<div>').append(htmlDoc).find('style').html();

    };



    /**
     * Import a roadbook
     * @private
     * @param {Object} files - File(s) returned by input type="file"
     */
    var importFile = function (files) {

        commonsModule.reader(files, function (result) {

            swal({
                title: 'Are you sure?',
                text: 'Current roadbook and / or style will be replaced.\nDo you really want to continue?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes replace',
                cancelButtonText: 'No cancel',
                closeOnConfirm: false
            }, function(isConfirm) {
                if (isConfirm) {

                    if ($('#import_html').is(':checked')) {
                        var html = extractRoadbook(result);
                        var roadbookEditor = roadbookModule.getEditor();
                        roadbookEditor.setHTML(html);
                        //roadbookModule.replaceHtmlAlert(html);
                    }

                    if ($('#import_style').is(':checked')) {
                        var text = extractStyle(result);
                        var styleEditor = styleModule.getEditor();
                        styleEditor.setText(text);
                        styleModule.updateStyle();
                        //styleModule.replaceTextAlert(text);
                    }

                    swal({
                        title: 'Imported!',
                        text: 'Your file has been imported.\nLet\'s start editing!',
                        type: 'success',
                        timer: 3000,
                        showConfirmButton: false
                    });

                }
            });

        });

    };



    /**
     * Start Watching the import form submition
     * @public
     */
    var init = function () {

        $('#import_form').on('submit', function (e) {

            e.preventDefault();
            $('#import_modal').modal('hide');
            var files = document.getElementById('html_file').files;

            importFile(files);

        });

    };


    $(function () {

    });


    // Public functions and variables
    return {
        init: init
    };

})();
