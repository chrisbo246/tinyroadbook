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
     * Convert bytes to string size
     * @param {integer} bytes - Size in bytes
     * @param {integer} decimals - Round number to n decimals
     * @returns {string} The formatted value
     */
    var _formatBytes = function (bytes, decimals) {
       if(bytes == 0) return '0 Byte';
       var k = 1000;
       var dm = decimals + 1 || 3;
       var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
       var i = Math.floor(Math.log(bytes) / Math.log(k));
       return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
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
            swal({title: 'Oups!', text: 'The File APIs are not fully supported by your browser.', type: 'warning'});
            return;
        }

        var gpxFormat = new ol.format.GPX();
        var gpxFeatures;
    
        var $filePath = $(selector);  
        $filePath.on('change', function (e) {
            
            var files = e.target.files;
            var output = [];
            for (var i = 0, f; f = files[i]; i++) {

                var reader = new FileReader();                
                reader.readAsText(f); //, 'UTF-8'
                //reader.readAsDataURL(f);
                
                reader.onload = function (e) {
                    
                    gpxFeatures = gpxFormat.readFeatures(e.target.result, {
                        dataProjection: 'EPSG:4326',
                        featureProjection: 'EPSG:3857'
                    });
                    layer.getSource().addFeatures(gpxFeatures);
                    
                    layer.setProperties({
                        visible: true
                    });
                    
                };
                
                reader.onloadstart = function (e) {
                    //console.log('GPX tracks loading...');
                };
                reader.onloadend = function (e) {
                    console.log('GPX tracks loaded');
                };
                reader.onerror = function (e) {
                    swal({title: 'Oups!', text: 'An error occured while trying to read your file.', type: 'warning'});
                };
                
                // Build the list of loaded files
                output.push('<li class="list-group-item">'
                + escape(f.name) + ' <span class="badge">'
                + _formatBytes(f.size)
                + (' ' + f.type || '')
                //+ (f.lastModifiedDate ? ' last modified: ' + f.lastModifiedDate.toLocaleDateString() : '')
                + '<span></li>');

            };
            
            var $list = $(selector + '_list');
            if ($list) {
                $list.html('<ul class="list-group">' + output.join('') + '</ul>');
            }

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