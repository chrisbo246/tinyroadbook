/*eslint-env browser, jquery */
/*global  Quill, roadbookModule */
/**
 * HTML editor module.
 * @module
 * @external $
 * @external Quill
 * @external roadbookModule
 * @return {Object} Public functions / variables
 */
/*eslint-disable no-unused-vars*/
var htmlEditorModule = (function () {
    /*eslint-enable no-unused-vars*/
    'use strict';

    var editor;



    /**
     * Return editor instance
     */
    var getEditor = function () {
        return editor;
    };



    /**
     * Synchronize the HTML editor with the visual editor
     */
    var syncWithRoadbookEditor = function () {

        var roadbookEditor = roadbookModule.getEditor();

        // Populate the HTML editor with the roadbook editor content
        editor.setText(roadbookEditor.getHTML());

        // Watch HTML editor changes and update the visual editor
        editor.on('text-change', function (delta, source) {
            if (source === 'user') {
                roadbookEditor.setHTML(editor.getText());
            }
        });

        // Watch visual editor changes and update the HTML editor content
        roadbookEditor.on('text-change', function (delta, source) {
            if (source === 'user') {
                editor.setText(roadbookEditor.getHTML());
            }
        });

    };



    /**
     * Initialize the HTML editor
     */
    var init = function () {

        editor = new Quill('#roadbook_editor_html', {});

        syncWithRoadbookEditor();

    };



    // Public functions and variables
    return {
        getEditor: getEditor,
        init: init
    };

})();
