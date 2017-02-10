'use strict';

/*eslint-env browser, jquery */
/*global Base64, bootstrapHelpers, ol, commonsModule, htmlEditorModule, roadbookImportModule, mapControlsModule, mapLayersModule, MapModule, pickerModule, roadbookModule, styleModule, swal */
/**
* @fileOverview TinyRoadbook application
* @author Christophe Boisier
* @version: 0.1.9
*/

/**
* Main module.
* @module
* @external $
* @external Base64
* @external bootstrapHelpers
* @external commonsModule
* @external htmlEditorModule
* @external roadbookImportModule
* @external mapControlsModule
* @external mapLayersModule
* @external MapModule
* @external ol
* @external pickerModule
* @external roadbookModule
* @external styleModule
* @external swal
* @return {Object} Public functions / variables
*/
/*eslint-disable no-unused-vars*/
var appModule = function () {
    /*eslint-enable no-unused-vars*/
    'use strict';

    var debug = parseInt($.urlParam('debug')) ? true : false; // (document.domain === 'localhost')
    var mapMod1;
    var mapIconsStyle;
    var selectedLayer;

    // Start debugging
    commonsModule.init({
        debug: debug
    });
    mapLayersModule.settings.debug = debug;

    //commonsModule.loadWebFonts();

    swal.setDefaults({
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-primary',
        cancelButtonClass: 'btn btn-default'
    });

    // Define map base layers
    var openCycleMapLayer = mapLayersModule.create('openCycleMap');
    var openStreetMapLayer = mapLayersModule.create('openStreetMap', { visible: true });
    var mapsForFreeReliefLayer = mapLayersModule.create('mapsForFreeRelief');
    var customBaseLayerLayer = mapLayersModule.create('customBaseLayer');
    var googleMapLayer = mapLayersModule.create('googleMap');
    var googleTerrainLayer = mapLayersModule.create('googleTerrain');
    var googleSatelliteLayer = mapLayersModule.create('googleSatellite');
    //var mapquestOSMLayer = mapLayersModule.create('mapquestOSM');
    //var mapquestSatLayer = mapLayersModule.create('mapquestSat');

    // Define map overlays
    var gpxFileLayer = mapLayersModule.create('gpxFile', { zIndex: 8 });
    var googleHybridLayer = mapLayersModule.create('googleHybrid', { zIndex: 7 });
    var googleBikeLayer = mapLayersModule.create('googleBike', { zIndex: 6 });
    var lonviaCyclingLayer = mapLayersModule.create('lonviaCycling', { zIndex: 5 });
    var lonviaHikingLayer = mapLayersModule.create('lonviaHiking', { zIndex: 4 });
    //var mapquestHybLayer = mapLayersModule.create('mapquestHyb', {zIndex: 3});
    var uniHeidelbergAsterhLayer = mapLayersModule.create('uniHeidelbergAsterh', { zIndex: 2 });
    var customOverlayLayer = mapLayersModule.create('customOverlay', { zIndex: 1 });

    // Define map controls
    var attributionControl = mapControlsModule.create('attribution');
    var scaleLineControl = mapControlsModule.create('scaleLine');
    var fullScreenControl = mapControlsModule.create('fullScreen');
    var layerSwitcherControl = mapControlsModule.create('layerSwitcher');
    var zoomSliderControl = mapControlsModule.create('zoomSlider');

    // Check if the godfather mode must be enabled via URL parameters
    var godfatherMode = parseInt($.urlParam('godfather')) ? true : false; // || (document.domain === 'localhost')
    console.log('Godfather mode', godfatherMode);

    /**
    * Load the Addthis widget library and update parameters when the roadbook change
    * @private
    */
    var initAddthisWidget = function initAddthisWidget() {

        // Default config
        /*eslint-disable camelcase*/
        var addthis_share = {
            url: document.URL,
            title: 'I\'m doing a tiny roadbook for my next tour'
        };
        /*eslint-enable camelcase*/

        // Load the Addthis widget library
        //$.getScript('https://s7.addthis.com/js/300/addthis_widget.js#pubid=ra-5689e8d8b9037927', function () {
        //    console.log('Addthis widget library loaded');

        // Watch roadbook editor changes
        var editor = roadbookModule.getEditor();
        editor.on('text-change', function () {

            // Update Addthis widget data attributs
            // http://support.addthis.com/customer/portal/topics/38604-customizing-addthis/articles
            var description = editor.getText();
            $.extend(addthis_share, {
                description: description.substring(0, 100) + (description.length > 100 ? '...' : '')
                //image: (canvas ? canvas.toDataURL('image/png') : '')
            });

            //$('.addthis_sharing_toolbox')
            //    .attr('data-title', 'I\'m doing a tiny road book for my next tour')
            //    .attr('data-title', 'I\'m doing a tiny road book for my next tour');
            //$('meta[property="og:title"]').attr('content', addthis_share.title);
            //$('meta[property="og:url"]').attr('content', addthis_share.url);
            //$('meta[property="og:description"]').attr('content', editor.getHTML());
        });

        //});
    };

    /**
    * Build a valid HTML file with the editor content
    * @public
    * @return {String} HTML file content
    */
    var buildExport = function buildExport() {

        var htmlDoc = '';
        var dfd = new $.Deferred();

        var roadbookEditor = roadbookModule.getEditor();
        var styleEditor = styleModule.getEditor();

        var title = window.location.hostname;
        var $input = $('#roadbook_title');
        if ($input && $input.val()) {
            title = $input.val();
        }

        var description = '';
        $input = $('#roadbook_description');
        if ($input && $input.val()) {
            description = $input.val();
        }

        var lang = '';
        $input = $('#roadbook_language');
        if ($input && $input.val()) {
            lang = $input.val();
        }

        if (roadbookEditor && styleEditor && mapIconsStyle) {
            htmlDoc = '<!DOCTYPE html>\n' + '<html lang="' + lang + '">\n' + '<head>\n' + '<title>' + title + '</title>\n' + '<meta content="text/html; charset=UTF-8" http-equiv="content-type">\n' + '<meta name="description" content="' + description + '">\n' + '<style type="text/css">\n' + styleEditor.getText() + '\n' + mapIconsStyle + '\n' + '</style>\n' + '</head>\n' + '<body>\n' + '<div class="roadbook">\n' + roadbookEditor.getHTML() + '\n' + '</div>\n' + '</body>\n' + '</html>';

            dfd.resolve(htmlDoc);
        }

        return dfd;
    };

    /**
    * Rebuild the save link URL
    * @public
    * @return {String} HTML file content
    */
    var updateSaveLink = function updateSaveLink() {

        buildExport().done(function (htmlDoc) {
            if (htmlDoc) {
                $('.save_roadbook').attr('href', 'data:text/html;base64, ' + Base64.encode(htmlDoc));
            }
        });

        var $input = $('#roadbook_title');
        if ($input) {
            var filename = $.trim($input.val() || document.domain).replace(/\s+/gi, '_').replace(/[^a-zA-Z0-9\_-]/gi, '') + '.html';
            $('.save_roadbook').attr('download', filename);
        }
    };

    /**
    * Initialize an OL3 map
    * @private
    * @param {target} target - Map div selector
    * @return {object} - The map object
    */
    var initMap = function initMap(target) {

        var layers;

        if (!godfatherMode) {
            layers = [new ol.layer.Group({
                name: 'baseLayers',
                title: 'Base map',
                layers: [customBaseLayerLayer,
                //mapquestSatLayer,
                openCycleMapLayer,
                //mapquestOSMLayer,
                openStreetMapLayer]
            }), new ol.layer.Group({
                name: 'overlays',
                title: 'Overlays',
                layers: [customOverlayLayer,
                //mapquestHybLayer,
                lonviaHikingLayer, lonviaCyclingLayer, gpxFileLayer]
            })];
        } else {
            layers = [new ol.layer.Group({
                name: 'baseLayers',
                title: 'Base map',
                layers: [customBaseLayerLayer, googleSatelliteLayer,
                //mapquestSatLayer,
                googleTerrainLayer, mapsForFreeReliefLayer, openCycleMapLayer, googleMapLayer,
                //mapquestOSMLayer,
                openStreetMapLayer]
            }), new ol.layer.Group({
                name: 'overlays',
                title: 'Overlays',
                layers: [customOverlayLayer, uniHeidelbergAsterhLayer,
                //mapquestHybLayer,
                lonviaHikingLayer, lonviaCyclingLayer, googleBikeLayer, googleHybridLayer, gpxFileLayer]
            })];
        }
        var controls = ol.control.defaults({
            attribution: false,
            attributionOptions: /** @type {olx.control.AttributionOptions} */{
                collapsible: false
            },
            zoomOptions: {}
        }).extend([attributionControl, scaleLineControl, fullScreenControl, zoomSliderControl, layerSwitcherControl]);

        return new ol.Map({
            layers: layers,
            target: target,
            view: new ol.View({
                center: [0, 0],
                zoom: 4,
                minZoom: 2,
                maxZoom: 19
            }),
            controls: controls,
            logo: false
        });
    };

    /**
    * Document ready
    */
    $(function () {

        // Initialize mandatory modules
        console.time('Bootstrap module initialized');
        bootstrapHelpers.init({
            debug: debug
        });

        roadbookModule.init();
        htmlEditorModule.init();
        styleModule.init();
        roadbookImportModule.init();

        initAddthisWidget();

        var $input;

        var $tabs = $('a[data-toggle="tab"]');

        // Initialize the home pane functionalities only when visible for the first time
        //$tabs.filter('[href="#home_pane"]').one('shown.bs.tab', function () {
        //    commonsModule.parallax();
        //});

        // Initialize the editor pane functionalities only when visible for the first time
        $tabs.filter('[href="#editor_pane"]').one('shown.bs.tab', function () {

            // Several links may open the pane, so this prevent initializing several maps
            if (mapMod1) {
                return false;
            }

            mapMod1 = new MapModule(initMap('map'), {
                debug: debug
            });
            console.log('Map initialized');

            /*
            // Try to restore map center and zoom from the local storage
            if (!mapMod1.restoreMapProperties()) {
            // Or center map on user position and set a default zoom
            mapMod1.setCenterOnPosition();
            mapMod1.map.getView().setZoom(12);
            }
            // Check map events and store changes to local storage
            mapMod1.storeMapChanges();
            */

            // Redraw the map and update classes when the map width input value change
            $('#map_width').on('change', function () {
                $tabs.filter('[href="#editor_pane"]').one('shown.bs.tab', function () {
                    mapMod1.updateSize();
                });
            });

            // Initialize the picker module
            pickerModule.watchMapClick(mapMod1.map);

            // On layer change, adjust zoom delta depending on selected base layer
            // zoomDelta = -2;

            // Select the layer passed to the modal
            $('#layer_settings_modal').on('show.bs.modal', function (e) {
                var $modal = $(this);

                // Select the layer passed as link attribute
                var layerVarName = $(e.relatedTarget).data('layer') + 'Layer';
                if (typeof layerVarName !== 'undefined') {
                    /*eslint-disable no-eval*/
                    selectedLayer = eval(layerVarName);
                    /*eslint-enable no-eval*/
                }

                if (selectedLayer) {

                    // Populate fields with the selected layer properties
                    // hide unwanted field groups
                    // validate form and update layer values
                    mapLayersModule.initSettingsForm(selectedLayer, '#layer_settings_form', '.form-group');
                    //mapLayersModule.initSettingsForm(selectedLayer, '#layer_settings_form', '.form-group, fieldset');

                    // Change modal title
                    var title = selectedLayer.get('title');
                    $modal.find('.modal-title').html(title);

                    // Initialize tooltip for range inputs
                    bootstrapHelpers.rangeValueTooltip();
                }
            });

            // Update map overlay when user click ok
            $('#layer_settings_form').on('submit', function (e) {
                e.preventDefault();
                var $modal = $('#layer_settings_modal');
                $modal.modal('hide');
            });

            commonsModule.hideHashOnClick('#map .layer-switcher');

            // Add a link to settings beside each layer labels (layerswitcher)
            /*$('.layer-switcher').find('input').filter('[data-layer]').each(function () {
            $input = $(this);
            var layerName = $input.data('layer');
            $input.next('label').append(' <a href="#layer_settings_modal" data-toggle="modal" data-layer="' + layerName + '">'
            + '<span class="glyphicon glyphicon-cog"></span></a>');
            });*/

            // Force the Bootstrap modal API to initialize the layerswitcher links
            $('.layer-switcher').on('click', 'a[data-toggle="modal"]', function (e) {
                e.preventDefault();
                //window.location.hash = '';
                $(this).trigger('click.bs.modal.data-api');
            });
        });

        // Initialize the settings pane functionalities only when visible for the first time
        $tabs.filter('[href="#settings_pane"]').one('shown.bs.tab', function () {});

        // Initialize the style pane functionalities only when visible for the first time
        $tabs.filter('[href="#style_pane"]').one('shown.bs.tab', function () {});

        // Hide the modal when the form is submited
        /*var $modal;
        $('.modal').each(function () {
        $modal = $(this);
        $modal.find('form').on('submit', function (e) {
        e.preventDefault();
        $modal.modal('hide');
        });
        });*/

        // Load icon styles if not already
        $.get('styles/osm.css', function (data) {
            mapIconsStyle = data;
            updateSaveLink();
        });

        // Build a file list preview when input change
        $input = $('#gpx_file');
        $input.on('change', function (e) {
            var files = e.target.files;
            var output = bootstrapHelpers.buildFileList(files);
            $('#' + $input.attr('id') + '_output').html(output);
        });

        // Clone the file settings to the modal body
        //$('#file_settings_modal .modal-body').html($('#file_settings').clone(true, true));
        /*$('#file_settings_modal')
        .on('show.bs.modal', function () {
        var $modal = $(this);
        $modal.find('.modal-body').html($('#file_settings').clone(true, true));
        })
        .on('hide.bs.modal', function () {
        var $modal = $(this);
        $('#file_settings').html($modal.find('.modal-body').clone());
        });*/
    });

    return {
        mapMod1: mapMod1,
        buildExport: buildExport,
        updateSaveLink: updateSaveLink
    };
}();
//# sourceMappingURL=main.js.map
