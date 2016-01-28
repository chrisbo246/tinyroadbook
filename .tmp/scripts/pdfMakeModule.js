/**
 * pdfMake module.
 * @external pdfMake
 * @see {@link https://github.com/bpampuch/pdfmake}
 * @module
 * @returns {Object} Public functions and variables
 */
var pdfMakeModule = function () {
	'use strict';

	var docDefinition = {
		info: {
			title: 'awesome Document',
			author: 'john doe',
			subject: 'subject of document',
			keywords: 'keywords for document'
		},
		pageSize: 'A4',
		pageOrientation: 'portrait', // portrait landscape
		pageMargins: [40, 60, 40, 60], // [l, t, r, b] or [h, v] or just a number for equal margins
		background: 'MyWaypoints',
		header: 'MyWaypoints',
		content: '',
		footer: {
			columns: ['http://www.mywaypoints.tk', {
				text: 'Right part',
				alignment: 'Happy trip!'
			}]
		}
	};

	/**
 * Update pdf definition
  * @public
  * @param {Object} [customDocDefinition] - PDF definition parameters
 */
	var init = function (customDocDefinition) {

		$.extent(docDefinition, customDocDefinition || {});
	};

	/**
 * Update pdf definition
  * @public
  * @param {Object} settings - PDF definition parameters
 */
	var update = function (settings) {

		$.extend(docDefinition, settings);
	};

	$(document).ready(function () {

		// Print button
		$('#print_pdf_roadbook').click(function () {
			pdfMake.createPdf(docDefinition).print();
		});
		// Open PDF button
		$('#open_pdf_roadbook').click(function () {
			pdfMake.createPdf(docDefinition).open();
		});
		// Save PDF button
		$('#save_pdf_roadbook').click(function () {
			pdfMake.createPdf(docDefinition).download();
		});
	});

	return {
		init: init,
		update: update
	};
}();
//# sourceMappingURL=pdfMakeModule.js.map
