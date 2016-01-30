//jslint browser: true
//global window, $, ol, swal, mapModule, mapLayersModule, mapControlsModule, tabModule, adsenseModule, cityPickerModule
/**
 * @fileOverview TinyRoadbook application
 * @author Christophe Boisier
 * @version: 0.1
 */

console.time('$: HTML loaded (except images) and DOM is ready');
console.time('$(document).ready: HTML loaded (except images) and DOM is ready');
console.time('$(window).load: Page is fully loaded, including frames, objects and images');

/**
 * Main module.
 * @external jQuery
 * @external OL3
 * @external swal
 * @external mapModule
 * @external mapLayersModule
 * @external mapControlsModule
 * @external tabModule
 * @external adsenseModule
 * @external cityPickerModule
 * @module
 * @returns {Object} Public functions and variables
 */
var appModule = function () {
    'use strict';

    var map1;

    // Base layers
    var mapquestSatLayer = mapLayersModule.create('mapquestSat');
    var openCycleMapLayer = mapLayersModule.create('openCycleMap');
    var openStreetMapLayer = mapLayersModule.create('openStreetMap', { visible: true });
    var openStreetMapHumanitarianLayer = mapLayersModule.create('openStreetMapHumanitarian');
    var thunderforestTransportLayer = mapLayersModule.create('thunderforestTransport');
    var thunderforestOutdoorLayer = mapLayersModule.create('thunderforestOutdoor');

    // Overlays
    var mapquestHybLayer = mapLayersModule.create('mapquestHyb');
    var lonviaHikingLayer = mapLayersModule.create('lonviaHiking');
    var lonviaCyclingLayer = mapLayersModule.create('lonviaCycling');

    var gpxLayer = new ol.layer.Vector({
        name: 'gpsTrack',
        title: 'GPX tracks',
        visible: false,
        source: new ol.source.Vector({}),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(51, 122, 183, 0.7)',
                width: 3
            })
        })
    });

    // Controls
    var attributionControl = mapControlsModule.create('attribution');
    var scaleLineControl = mapControlsModule.create('scaleLine');
    var fullScreenControl = mapControlsModule.create('fullScreen');
    var layerSwitcherControl = mapControlsModule.create('layerSwitcher');

    /**
     * Initialize an OL3 map
     * @param {target} target - Map div selector
     * @return {object} - The map object
     */
    var _addMap = function (target) {

        var layers = [new ol.layer.Group({
            name: 'baseLayers',
            title: 'Base map',
            layers: [mapquestSatLayer, openStreetMapHumanitarianLayer, thunderforestTransportLayer, thunderforestOutdoorLayer, openCycleMapLayer, openStreetMapLayer]
        }), new ol.layer.Group({
            name: 'overlays',
            title: 'Overlays',
            layers: [gpxLayer, mapquestHybLayer, lonviaHikingLayer, lonviaCyclingLayer]
        })];

        var controls = ol.control.defaults({
            attribution: false,
            attributionOptions: /** @type {olx.control.AttributionOptions} */{
                collapsible: false
            },
            zoomOptions: {
                // zoomInTipLabel: $.t('buttons:olZoomIn.label'),
                // zoomOutTipLabel: $.t('buttons:olZoomOut.label')
            }
        }).extend([attributionControl, scaleLineControl, fullScreenControl, layerSwitcherControl]);

        return new ol.Map({
            layers: layers,
            target: target,
            view: new ol.View({
                center: [0, 0],
                zoom: 4
            }),
            controls: controls
        });
    };

    $(function () {

        // Initialize the map when pane become visible for the first time
        $('a[data-toggle="tab"]').one('shown.bs.tab', function (e) {
            var paneId = $(e.target).attr('href');
            if (paneId === '#picker') {
                map1 = _addMap('map');
                mapModule.centerOnPosition(map1);
                cityPickerModule.setMap(map1);
                $('#gpx_file_path').on('change', function () {
                    layerSwitcherControl.renderPanel();
                });
            }
        });

        if (window.File && window.FileReader && window.FileList && window.Blob) {
            mapModule.setFileSource('#gpx_file_path', gpxLayer);
        } else {
            $('#gpx_file_path').closest('.form-group').hide();
        }

        $('.start-editing').click(function () {
            $('a[href="#picker"]').tab('show');
        });

        // excluded: 'input[type="file"], input[type="hidden"], input[type="submit"], [data-persist="false"]'
        $('input[type="hidden"]').trigger('change');
        // Garlic reset buttons
        $('#reset_settings').click(function () {
            $('#settings form').garlic('destroy');
            location.reload();
        });

        /*window.update_cookieconsent_options({
            //learnMore: 'Learn more'
            theme: 'light-floating'
        });*/

        commonsModule.parallax();
        commonsModule.adsense();
        commonsModule.storeActiveTab();
        commonsModule.resetButton();
        commonsModule.loadGoogleFonts();
    });

    /*
    $(function () {
        console.timeEnd('$: HTML loaded (except images) and DOM is ready');
    });
    $(document).ready(function () {
        console.timeEnd('$(document).ready: HTML loaded (except images) and DOM is ready');
    });
    $(window).on('load', function () {
        console.timeEnd('$(window).load: Page is fully loaded, including frames, objects and images');
    });
    */

    return {
        map: map1
    };
}();
//# sourceMappingURL=main.js.map
