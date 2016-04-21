//jslint browser: true
//global window, $

var styleEditorModule = (function () {
    'use strict';
    
    var editorSelector = '#editor_style_input';
    var styleSelector = '#editor_style';

	$(function () {
	
        var $style = $(editorSelector);
        $style.on('input', function (e) {
            //var style = '@media screen, print {\n.ql-container {\n' + $(this).val() + '\n}\n}';
            var style = '@media screen, print {\n'
                + 'body {\nfont-family: "Helvetica Neue",Helvetica,Arial,sans-serif;\nfont-size: 14px;\nline-height: 1.428571429;\n}\n'
                + $(this).val()
                + '\n}\n';
            //var style = '@media screen, print and (color) {\n* {\n-webkit-print-color-adjust: exact;\nprint-color-adjust: exact;\n}\n' + $(this).val() + '\n}\n';
            //var style = $(this).val();
            $('#editor_style').html(style);
            console.log('Style changed', style);
        }).trigger('input');
		
    });
    
});