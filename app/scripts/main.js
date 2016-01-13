//jslint browser: true
//global window, $, ol, swal, mapModule, mapLayersModule, mapControlsModule, tabModule, adsenseModule, cityPickerModule
/**
 * @fileOverview TinyRoadbook application
 * @author Christophe Boisier
 * @version: 0.1
 */

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
var appModule = (function () {
    'use strict';

    var settings = {
        adsense: {
            adClient: 'ca-pub-8495719252049968'
        }
    };

    var map1;

    // Base layers
    var mapquestSatLayer = mapLayersModule.create('mapquestSat');
    var openCycleMapLayer = mapLayersModule.create('openCycleMap');
    var openStreetMapLayer = mapLayersModule.create('openStreetMap', {visible: true});
    var openStreetMapHumanitarianLayer = mapLayersModule.create('openStreetMapHumanitarian');
    var thunderforestTransportLayer = mapLayersModule.create('thunderforestTransport');
    var thunderforestOutdoorLayer = mapLayersModule.create('thunderforestOutdoor');

    // Overlays
    var mapquestHybLayer = mapLayersModule.create('mapquestHyb');
    var lonviaHikingLayer = mapLayersModule.create('lonviaHiking');
    var lonviaCyclingLayer = mapLayersModule.create('lonviaCycling');
    var gpxLayer = new ol.layer.Vector({
        name: 'gpsTrack',
        visible: false,
        source: new ol.source.Vector({
            format: new ol.format.GPX()
        }),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 255, 0, 0.7)',
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

        var layers = [
            new ol.layer.Group({
                name: 'baseLayers',
                title: 'Base map',
                layers: [
                    mapquestSatLayer,
                    openStreetMapHumanitarianLayer,
                    thunderforestTransportLayer,
                    thunderforestOutdoorLayer,
                    openCycleMapLayer,
                    openStreetMapLayer
                ]
            }),
            new ol.layer.Group({
                name: 'overlays',
                title: 'Overlays',
                layers: [
                    gpxLayer,
                    mapquestHybLayer,
                    lonviaHikingLayer,
                    lonviaCyclingLayer
                ]
            })
        ];

        var controls = ol.control.defaults({
            attribution: false,
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                collapsible: false
            }),
            zoomOptions: {
                // zoomInTipLabel: $.t('buttons:olZoomIn.label'),
                // zoomOutTipLabel: $.t('buttons:olZoomOut.label')
            }
        }).extend([
            attributionControl,
            scaleLineControl,
            fullScreenControl,
            layerSwitcherControl
        ]);

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



    $(document).ready(function () {

        adsenseModule.init(settings.adsense);

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
        // Garlic reset buttons
        $('#reset_settings').click(function () {
            $('#settings form').garlic('destroy');
            location.reload();
        });
        $('#reset_all').click(function () {
            swal({
                title: 'Are you sure?',
                text: 'This will reset settings, erase your roadbook and delete local data stored by this application.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes reset all',
                cancelButtonText: 'No stop !',
                closeOnConfirm: false,
                closeOnCancel: false
            }, function (isConfirm) {
                if (isConfirm) {
                    var cookies = document.cookie.split(';');
                    cookies.forEach(function (cookie) {
                        document.cookie = cookie.split('=')[0]
                                + '=; username=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
                    });
                    localStorage.clear();
                    location.reload();
                    //navigator.geolocation.clearWatch();
                } else {
                    swal('Cancelled', 'You can continue where you left off.', 'error');
                }
            });
        });

        // Automatically reload the last opened tab
        tabModule.rememberTab('#main-nav', !localStorage);

        /*window.update_cookieconsent_options({
            //learnMore: 'Learn more'
            theme: 'light-floating'
        });*/

    });

    return {
        map: map1
    };

})();