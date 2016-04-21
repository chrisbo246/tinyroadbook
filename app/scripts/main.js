/*eslint-env browser, jquery */
/*global Base64, bootstrapModule, ol, commonsModule, htmlEditorModule, importModule, mapControlsModule, mapLayersModule, MapModule, pickerModule, roadbookModule, styleModule, swal */
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
 * @external bootstrapModule
 * @external commonsModule
 * @external htmlEditorModule
 * @external importModule
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
var appModule = (function () {
    /*eslint-enable no-unused-vars*/
    'use strict';

    var mapMod1;

    // Start debugging
    commonsModule.debug();

    swal.setDefaults({
        //customClass: '',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-primary',
        cancelButtonClass: 'btn btn-default'
    });

    // Define map base layers
    var openCycleMapLayer = mapLayersModule.create('openCycleMap');
    var openStreetMapLayer = mapLayersModule.create('openStreetMap', {visible: true});
    var googleTerrainLayer = mapLayersModule.create('googleTerrain');
    var customBaseLayerLayer = mapLayersModule.create('customBaseLayer', {title: 'Custom tile server <small><a href="#layer_settings_modal" data-toggle="modal" data-target-section="1"><span class="glyphicon glyphicon-cog"></span></a></small>'});

    // Define map overlays
    var lonviaHikingLayer = mapLayersModule.create('lonviaHiking');
    var lonviaCyclingLayer = mapLayersModule.create('lonviaCycling');
    var googleBikeLayer = mapLayersModule.create('googleBike');
    var gpxLayer = mapLayersModule.create('gpxFile', {title: 'GPS tracks <small><a href="#gpx_reader_modal" data-toggle="modal"><span class="glyphicon glyphicon-cog"></span></a></small>'});
    var customOverlayLayer = mapLayersModule.create('customOverlay', {title: 'Custom tile server <small><a href="#layer_settings_modal" data-toggle="modal" data-target-section="2"><span class="glyphicon glyphicon-cog"></span></a></small>'});

    // Define map controls
    var attributionControl = mapControlsModule.create('attribution');
    var scaleLineControl = mapControlsModule.create('scaleLine');
    var fullScreenControl = mapControlsModule.create('fullScreen');
    var layerSwitcherControl = mapControlsModule.create('layerSwitcher');
    var zoomSliderControl = mapControlsModule.create('zoomSlider');

    // Check if the godfather mode must be enabled via URL parameters
    var godfatherMode = (parseInt($.urlParam('godfather'))) ? true : false; // || (document.domain === 'localhost')
    console.log('Godfather mode', godfatherMode);



    /**
     * Load the Addthis widget library and update parameters when the roadbook change
     * @private
     */
    var initAddthisWidget = function () {

        // Default config
        /*eslint-disable camelcase*/
        window.addthis_share = {
            url: document.URL
            , title: 'I\'m doing a tiny roadbook for my next tour'
        };
        /*eslint-enable camelcase*/

        // Load the Addthis widget library
        //$.getScript('//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-5689e8d8b9037927', function () {
        //    console.log('Addthis widget library loaded');

            // Watch roadbook editor changes
            var editor = roadbookModule.getEditor();
            editor.on('text-change', function () {

                // Update Addthis widget data attributs
                // http://support.addthis.com/customer/portal/topics/38604-customizing-addthis/articles
                var description = editor.getText();
                $.extend(addthis_share, {
                        description: description.substring(0, 100) + ((description.length > 100) ? '...' : '')
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
    var buildExport = function () {

        var htmlDoc = '';
        var roadbookEditor = roadbookModule.getEditor();
        var styleEditor = styleModule.getEditor();

        if (roadbookEditor && styleEditor) {
            htmlDoc = '<html>\n'
                + '<head>\n'
                + '<title>' + window.location.hostname + '</title>\n'
                + '<meta charset="UTF-8">\n'
                + '<style>\n'
                + styleEditor.getText() + '\n'
                + '</style>\n'
                + '</head>\n'
                + '<body>\n'
                + '<div class="roadbook">\n'
                + roadbookEditor.getHTML() + '\n'
                + '</div>\n'
                + '</body>\n'
                + '</html>';
        }

         return htmlDoc;

    };



    /**
     * Rebuild the save link URL
     * @public
     * @return {String} HTML file content
     */
    var updateSaveLink = function () {

        var htmlDoc = buildExport();
        if (htmlDoc) {
            $('#save_roadbook').attr('href', 'data:text/html;base64, ' + Base64.encode(htmlDoc));
        }

    };



    /**
     * Initialize an OL3 map
     * @private
     * @param {target} target - Map div selector
     * @return {object} - The map object
     */
    var initMap = function (target) {

        var layers;

        if (!godfatherMode) {
            layers = [
                new ol.layer.Group({
                    name: 'baseLayers',
                    title: 'Base map',
                    layers: [
                        openCycleMapLayer,
                        openStreetMapLayer
                    ]
                }),
                new ol.layer.Group({
                    name: 'overlays',
                    title: 'Overlays',
                    layers: [
                        lonviaHikingLayer,
                        lonviaCyclingLayer,
                        gpxLayer
                    ]
                })
            ];
        } else {
            layers = [
                new ol.layer.Group({
                    name: 'baseLayers',
                    title: 'Base map',
                    layers: [
                        customBaseLayerLayer,
                        googleTerrainLayer,
                        openCycleMapLayer,
                        openStreetMapLayer
                    ]
                }),
                new ol.layer.Group({
                    name: 'overlays',
                    title: 'Overlays',
                    layers: [
                        customOverlayLayer,
                        lonviaHikingLayer,
                        googleBikeLayer,
                        lonviaCyclingLayer,
                        gpxLayer
                    ]
                })
            ];
        }
        var controls = ol.control.defaults({
            attribution: false,
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                collapsible: false
            }),
            zoomOptions: {

            }
        }).extend([
            attributionControl,
            scaleLineControl,
            fullScreenControl,
            layerSwitcherControl,
            zoomSliderControl
        ]);

        return new ol.Map({
            layers: layers,
            target: target,
            view: new ol.View({
                center: [0, 0],
                zoom: 4,
                minZoom: 2,
                maxZoom: 19
            }),
            controls: controls
        });

    };



    /**
     * Document ready
     */
    $(function () {

        // Initialize mandatory modules
        console.time('Bootstrap module initialized');
        bootstrapModule.debug();
        bootstrapModule.restoreActiveTab();
        bootstrapModule.tab();
        bootstrapModule.modalTogglerAttributs();
        bootstrapModule.tooltip();
        //bootstrapModule.restoreActiveModal();
        console.timeEnd('Bootstrap module initialized');

        commonsModule.disableUnsupported();
        commonsModule.adsense();
        commonsModule.loadGoogleFonts();

        roadbookModule.init();
        htmlEditorModule.init();
        styleModule.init();
        importModule.init();

        initAddthisWidget();

        // Try to define user language at the first connection
        var $input = $('#user_language');
        if ($input) {
            $input.val(navigator.language || navigator.userLanguage);
            console.log('User language defined', $input.val());
        }
        // Then store / restore input values
        commonsModule.fixInputValues();
        commonsModule.storeForms();

        var $tabs = $('a[data-toggle="tab"]');

        // Initialize the home pane functionalities only when visible for the first time
        $tabs.filter('[href="#home_pane"]').one('shown.bs.tab', function () {

            commonsModule.parallax();

        });

        // Initialize the editor pane functionalities only when visible for the first time
        $tabs.filter('[href="#editor_pane"]').one('shown.bs.tab', function () {

            // Several links may open the pane, so this prevent initializing several maps
            if (mapMod1) {
                return false;
            }

            mapMod1 = new MapModule(initMap('map'));
            console.log('Map initialized');
            mapMod1.debug();

            // Try to restore map center and zoom from the local storage
            if (!mapMod1.restoreMapState()) {
                // Or center map on user position and set a default zoom
                mapMod1.setCenterOnPosition();
                mapMod1.map.getView().setZoom(12);
            }

            // Check map events and store changes to local storage
            mapMod1.storeMapState();

            // Initialize the picker module
            pickerModule.watchMapClick(mapMod1.map);

            // Watch GPX file input changes
            $('#gpx_file').on('change', function (inputEvent) {
                var files = inputEvent.target.files;
                bootstrapModule.inputFileList(files, '#gpx_file_list');
            });

            // Update map overlay when user click ok
            $('#gpx_reader_form').on('submit', function (e) {

                e.preventDefault();
                $('#gpx_reader_modal').modal('hide');
                var files = document.getElementById('gpx_file').files;

                var $spinner = $('#map').find('.spinner');
                $spinner.fadeIn();

                gpxLayer.getSource().clear();

                var dfd = commonsModule.reader(files, function (result) {
                    var gpxFormat = new ol.format.GPX();
                    var gpxFeatures = gpxFormat.readFeatures(result, {
                        dataProjection: 'EPSG:4326',
                        featureProjection: 'EPSG:3857'
                    });
                    gpxLayer.getSource().addFeatures(gpxFeatures);
                    gpxLayer.setProperties({
                        visible: true
                    });
                });

                dfd.done(function () {
                    $spinner.fadeOut();
                });

                // Refresh the layerswitcher control
                layerSwitcherControl.renderPanel();

                // Adjust the view to fit tracks
                //mapMod1.fitVectorLayer(gpxLayer);

            });

            // Customize modal with data attributs
            //bootstrapModule.modalTogglerAttributs(); //'#layer_settings_modal'

            // Force the Bootstrap modal API to initialize the layerswitcher links
            $('.layer-switcher').on('click', 'a[data-toggle="modal"]', function () {
                $(this).trigger('click.bs.modal.data-api');
            });

        });

        // Initialize the settings pane functionalities only when visible for the first time
        $tabs.filter('[href="#settings_pane"]').one('shown.bs.tab', function () {

            commonsModule.resetButton();
            bootstrapModule.rangeValueTooltip();

        });

        // Hide debug mode only elements
        //if (!godfatherMode) {
        //    $('.debug-only').hide();
        //} else {
        //    $('.debug-only').show();
        //}

        // Reset buttons
        $('#reset_settings').click(function () {
            commonsModule.resetInputValues();
        });

        $('#layer_settings_form').on('submit', function (e) {
            e.preventDefault();
            $('#layer_settings_modal').modal('hide');
        });

        // Update local tile url
        mapLayersModule.inputLayerSource(customBaseLayerLayer, '#base_layer_tile_server');
        mapLayersModule.inputLayerSource(customOverlayLayer, '#overlay_tile_server');

    });


    return {
        buildExport: buildExport,
        updateSaveLink: updateSaveLink
    };

})();
