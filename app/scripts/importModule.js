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
     * Import a roadbook
     * @private
     * @param {Object} files - File(s) returned by input type="file"
     */
    var importFile = function (files) {

        commonsModule.reader(files, function (result) {

            swal({
                title: 'Replace roadbook',
                text: 'Current roadbook and / or style will be replaced.\nDo you really want to continue?',
                type: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes replace',
                cancelButtonText: 'No cancel',
                closeOnConfirm: false
            }, function(isConfirm) {
                if (isConfirm) {

                    var html = $('<div>').append(result);
                    var content;

                    if ($('#import_html').is(':checked')) {

                        content = html.find('.roadbook').html();
                        var roadbookEditor = roadbookModule.getEditor();
                        roadbookEditor.setHTML(content);

                        content = html.find('title').text();
                        $('#roadbook_title').val(content).trigger('change');

                        content = html.find('meta[name="description"]').attr('content');
                        $('#roadbook_description').val(content).trigger('change');

                        //roadbookModule.replaceHtmlAlert(html);
                    }

                    if ($('#import_style').is(':checked')) {
                        //var text = extractStyle(result);
                        content = html.find('style').html();
                        var styleEditor = styleModule.getEditor();
                        styleEditor.setText(content);
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
