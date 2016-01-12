//jslint browser: true
//global console, window, escape, FileReader, $, ol, controls, mapControlsModule

/**
 * OL3 module.
 * @external jQuery
 * @external ol3
 * @see {@link http://openlayers.org/en/v3.12.1/apidoc/}
 * @module
 * @returns {Object} Public functions and variables
 */
var mapModule = (function () {
    'use strict';

    var map,
        draw,
        ready = $.Deferred();



    /**
     * Draw map
     * @public
     */
    var init = function (target) {

        ready.resolve();

        return map;

    };



    /**
     * Add a predefined control on a initialized map
     * (Remove control with map.removeControl(control);)
     * @private
     * @param {string} control - Predefined control variable name
     * @param {object} map - OL3 initialized map
     */
    var _addControl = function (control, map) {
        if (!map || !controls[control]) {
            return;
        }
        map.addControl(mapControlsModule.controls[control]);
    };




    /**
     * Center the map at a given position and make a zoom
     * @public
     * @param {number} longitude - Longitude at EPSG:4326 projection
     * @param {number} latitude - Latitude at EPSG:4326 projection
     * @param {integer} [zoom] - Zoom from 0 to 18
     */
    var centerMap = function (longitude, latitude, zoom) {

        var view = map.getView();
        view.setCenter(ol.proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857'));
        if (zoom) {
            view.setZoom(zoom);
        }
        console.log('Map centered at longitude: ' + longitude + ' latitude: ' + latitude + ' zoom: ' + zoom);
    };



    /**
     * Center map on user position
     * @public
     * @param {Object} map - OL3 map
     */
    var centerOnPosition = function (map) {

        var view = map.getView();

        var geolocation = new ol.Geolocation({
            projection: view.getProjection(),
            tracking: true
        });

        geolocation.once('change:position', function () {
            view.setCenter(geolocation.getPosition());
            //view.setResolution(2.388657133911758);
            view.setZoom(10);
        });
        
    };



    /**
     * Center the map on a vector source and adjust zoom
     * @see {@link http://openlayers.org/en/v3.4.0/examples/center.html}
     * @public
     */
    var fitLayerGeometry = function (id, map, layer, featureId) {

        var source = layer.getSource();
        var feature = source.getFeatureById(id);
        var polygon = /** @type {ol.geom.SimpleGeometry} */ (feature.getGeometry());
        var size = /** @type {ol.Size} */ (map.getSize());

        var view = map.getView();
        view.fit(polygon, size, {
            padding: [0, 0, 0, 0],
            constrainResolution: false
            // nearest: true,
            // minResolution: 50
        });
    };



    /**
     * Fit all layers in the map viewport
     * @public
     * @param {Object} map - OL3 map
     */
    var fitAll = function (map) {

        var extent = ol.extent.createEmpty();
        map.getLayers().forEach(function (layer) {
            ol.extent.extend(extent, layer.getSource().getExtent());
        });
        map.getView().fit(extent, map.getSize());

    };



    /**
     * Zoom out to view extent
     * @public
     * @param {Object} map - OL3 map
     */
    var zoomOut = function (map) {
        //var extent = map.  .getSource().getExtent();
        var view = map.getView();
        var extent = view.getExtent();
        view.fit(extent, map.getSize());
    };



    /**
     * Update layer source url from a file input
     * <input id="gpx_file_path" type="file" accept=".gpx" />
     * @see {@link http://www.html5rocks.com/en/tutorials/file/dndfiles/}
     * @public
     * @param {string} selector - File input ID
     * @param {Object} layer - OL3 vector layer
     */
    var setFileSource = function (selector, layer) {

        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            console.warn('The File APIs are not fully supported in this browser.');
        }

        var $filePath = $(selector);
        $filePath.on('change', function (e) {

            var files = e.target.files;
            files.forEach(function (f) {

                var reader = new FileReader();
                reader.onload = (function (theFile) {
                    return function (e) {
                        layer.setProperties({
                            title: escape(theFile.name),
                            source: new ol.source.Vector({
                                url: e.target.result,
                                format: new ol.format.GPX()
                            }),
                            visible: true
                        });
                    };
                })(f);

                reader.readAsDataURL(f);

            });

        });

    };



    return {
        map: map,
        ready: ready,
        init: init,
        centerOnPosition: centerOnPosition,
        setFileSource: setFileSource,
        fitAll: fitAll
    };

})();