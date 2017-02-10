'use strict';

/*eslint-env browser, jquery */
/*global ol */
/**
* OL3 module.
* @see {@link http://openlayers.org/en/v3.12.1/apidoc/}
* @class
* @external $
* @external Basil
* @external ol
* @param {Object} map - ol initialized map
* @param {Object} settings - Module settings override
* @return {Object} Public functions / variables
*/
/*eslint-disable no-unused-vars*/
var MapModule = function MapModule(map, settings) {
    /*eslint-enable no-unused-vars*/
    'use strict';

    var defaults = {
        ol: {},
        basil: {},
        narrowWidth: 300,
        flatHeight: 200,
        centerOnPosition: true,
        debug: true
    };

    var $map;
    var basil;

    /**
    * Save map state using cookies or local storage
    * @public
    */
    var storeMapChanges = function storeMapChanges() {

        if (!basil) {
            return false;
        }

        var view = map.getView();

        var getters = { 'center': 'getCenter', 'resolution': 'getResolution', 'rotation': 'getRotation' };
        $.each(getters, function (key, getter) {
            view.on('change:' + key, function (e) {
                basil.set(key, this[getter]());
                console.log(key + ' stored after view ' + e.type, basil.get(key));
            });
        });

        // Store map move changes
        //map.on('moveend', function (e) {
        //    basil.set('center', this.getView().getCenter());
        //    console.log('Center stored after map ' + e.type, basil.get('center'));
        //});

        // Store map render changes
        //map.on('postrender', function (e) {
        //    basil.set('zoom', this.getView().getZoom());
        //    console.log('Zoom stored after map ' + e.type, basil.get('zoom'));
        //});
    };

    /**
    * Save map state using cookies or local storage
    * @public
    * @return {Boolean} Restore success
    */
    var restoreMapProperties = function restoreMapProperties() {

        if (!basil) {
            return false;
        }

        var ok = false;
        var view = map.getView();
        var value;

        // Restore some view properties
        var setters = { 'center': 'setCenter', 'resolution': 'setResolution', 'rotation': 'setRotation' };
        $.each(setters, function (key, setter) {
            value = basil.get(key);
            if (value !== null) {
                if (typeof view[setter] === 'function') {
                    view[setter](value);
                } else {
                    view.set(key, value);
                }
                console.log('View ' + key + ' restored', value);
                ok = true;
            } else {
                console.log('View ' + key + ' was not stored');
            }
        });

        return ok;
    };

    /**
    * Display event logs
    * @public
    */
    var debug = function debug() {

        var view = map.getView();

        // pointermove postcompose postrender precompose
        'change change:layerGroup change:size change:target change:view click dblclick moveend pointerdrag propertychange singleclick'.split(' ').forEach(function (eventType) {
            map.on(eventType, function (e) {
                console.log('Map', e.type);
                if (e.key) {
                    console.log('New ' + e.key, map.get(e.key));
                }
            });
        });

        'change change:center change:resolution change:rotation propertychange'.split(' ').forEach(function (eventType) {
            view.on(eventType, function (e) {
                console.log('View', e.type);
                if (e.key) {
                    console.log('New ' + e.key, view.get(e.key));
                }
            });
        });
        view.on('change:resolution', function () {
            console.log('New zoom', view.getZoom());
        });
    };

    /**
    * Return the selected base layer name
    * @public
    */
    var getSelectedBaseLayer = function getSelectedBaseLayer() {

        var layers = map.getLayers();

        $.each(layers, function (i, l) {
            //var BL = l.get('baselayer');
            if (l.getVisible()) {
                console.log('Selected layer', l.get('name'));
            } else {
                console.log('Unselected layer', l.get('name'));
            }
            l.on('change:visible', function () {
                // this.getVisible() ? $li.addClass('checked') : $li.removeClass('checked') ;
                if (this.getVisible()) {
                    console.log('Selected layer', this.get('name'));
                }
            });
        });
    };

    /**
    * Finds recursively the layer with the specified key and value.
    * @param {ol.layer.Base} layer
    * @param {String} key
    * @param {any} value
    * @returns {ol.layer.Base}
    */
    var findLayerBy = function findLayerBy(layer, key, value) {

        // If it's a single layer and the value was found, return the layer
        if (layer.get(key) === value) {
            return layer;
        }

        // If it's a group, search recursively
        if (layer.getLayers) {
            var layers = layer.getLayers().getArray();
            var result;
            layers.forEach(function (l) {
                result = findLayerBy(l, key, value);
                if (result) {
                    return result;
                }
            });
        }

        // Else
        return null;
    };

    /**
    * Center the map at a given position and make a zoom
    * @public
    * @param {number} longitude - Longitude at EPSG:4326 projection
    * @param {number} latitude - Latitude at EPSG:4326 projection
    */
    var setCenter = function setCenter(longitude, latitude) {

        var view = map.getView();
        view.setCenter(ol.proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857'));
        console.log('Map centered at longitude: ' + longitude + ' latitude: ' + latitude);
    };

    /**
    * Try to geolocate user and center map on the position
    * @public
    */
    var setCenterOnPosition = function setCenterOnPosition() {

        var view = map.getView();
        var geolocation = new ol.Geolocation({
            projection: view.getProjection(),
            tracking: true
        });

        geolocation.once('change:position', function () {
            view.setCenter(geolocation.getPosition());
        });
    };

    /**
    * Change zoom level
    * @public
    * @param {Integer} zoom - Zoom level from 0 to 21
    */
    var setZoom = function setZoom(zoom) {

        zoom = parseInt(zoom);
        if (zoom) {
            map.getView().setZoom(zoom);
        }
    };

    /**
    * Zoom out and adjust center to fit the view extent
    * @public
    */
    var fitView = function fitView() {

        var view = map.getView();
        var extent = view.getExtent();
        view.fit(extent, map.getSize());
    };

    /**
    * Zoom out and adjust center to fit all layers in the map viewport
    * @public
    */
    var fitLayers = function fitLayers() {

        var view = map.getView();
        var extent = ol.extent.createEmpty();
        map.getLayers().forEach(function (layer) {
            ol.extent.extend(extent, layer.getSource().getExtent());
        });
        view.fit(extent, map.getSize());
    };

    /**
    * Zoom out and adjust center to fit the layer features
    * @public
    * @param {Object} ol3 vector layer
    */
    var fitVectorLayer = function fitVectorLayer(layer) {

        var extent = layer.getSource().getExtent();
        map.getView().fit(extent, map.getSize());
    };

    /**
    * Zoom out and adjust center to fil a vectore layer feature
    * @see {@link http://openlayers.org/en/v3.4.0/examples/center.html}
    * @public
    * @param {String} id - Feature id
    * @param {Object} layer - Vector layer
    * @param {Object} options - ol3 fit function parameters
    */
    var fitLayerGeometry = function fitLayerGeometry(id, layer, options) {

        var source = layer.getSource();
        var feature = source.getFeatureById(id);
        var polygon = /** @type {ol.geom.SimpleGeometry} */feature.getGeometry();
        var size = /** @type {ol.Size} */map.getSize();
        var view = map.getView();

        view.fit(polygon, size, $.extend({
            padding: [0, 0, 0, 0],
            constrainResolution: false
            // nearest: true,
            // minResolution: 50
        }, options));
    };

    /**
    * Add a .flat and .narrow class to the map container according to map size
    * @param {Number} width - Map width
    * @param {Number} height - Map height
    */
    var updateSize = function updateSize() {

        map.updateSize();

        //var $map = $('#' + map.get('target'));

        //$map.toggleClass('narrow', ($map.width() < settings.narrowWidth));
        //$map.toggleClass('flat', ($map.height() < settings.flatHeight));

        var $el = $map.find('.layer-switcher');
        if ($el) {
            $map.toggleClass('inline-layer-switcher', $map.height() >= 200 && $map.height() < 500);
            $map.toggleClass('no-layer-switcher', $map.width() < 300 || $map.height() < 200);
        }

        $el = $map.find('.ol-zoomslider');
        if ($el) {
            $map.toggleClass('no-zoomslider', $map.height() < 300);
        }
    };

    /**
    * Get all tiles in rectangle area
    * @public
    * @param {Array} coord - Longitude, latitude
    * @param {Integer} zoom - Zoom
    * @return {Array}
    */
    /*var getTileURL = function (coord, zoom) {
      var cor = transform2(coord[0], coord[1]);
    var lon = cor[0];
    var lat = cor[1];
    var out = [];
    var xtile = parseInt(Math.floor((lon + 180) / 360 * (1 << zoom)));
    var ytile = parseInt(Math.floor((1 - Math.log(Math.tan(lat.toRad()) + 1 / Math.cos(lat.toRad())) / Math.PI) / 2 * (1 << zoom)));
    console.log('>> ' + zoom + '/' + xtile + '/' + ytile);
    out[0] = zoom;
    out[1] = xtile;
    out[2] = ytile;
      return out;
    };*/

    /**
    * Get all tiles in rectangle area
    * @public
    * @param {Array} coord1 - Longitude, latitude
    * @param {Array} coord2 - Longitude, latitude
    */
    /*var getAllTiles = function (coord1, coord2) {
    
    var out1 = getTileURL(coord1, 10);
    var out2 = getTileURL(coord2, 10);
    var outTmp1;
    
    if(out1[1] > out2[1]) {
    outTmp1 = out1[1];
    out1[1] = out2[1];
    out2[1] = outTmp1;
    }
    if(out1[2] > out2[2]) {
    outTmp1 = out1[2];
    out1[2] = out2[2];
    out2[2] = outTmp1;
    }
    
    console.log('zoom' + out1[0] + ' from ' + out1[1] + ' to ' + out2[1] + ' from ' + out1[2] + ' to ' + out2[2]);
    while(out1[1] <= out2[1]) {
    while(out1[2] <= out2[2]) {
    console.log('*** ' + out1[1] + '/' + out1[2]);
    out1[2]++;
    }
    out1[1]++;
    }
    
    };*/

    /**
    * Execute common tasks after map initialisation
    * @private
    */
    var init = function init() {

        // Merge default and custom settings
        settings = $.extend(true, {}, defaults, settings);

        // Define map container
        $map = $('#' + map.get('target'));

        // Redraw the map when the screen size change
        window.onresize = function () {
            updateSize();
        };

        // Add a .flat and .narrow class to the map container according to map size
        updateSize();

        // Init Basil
        if (typeof window.Basil !== 'undefined') {
            // Define an unique namespace to store map data
            if (!settings.basil.namespace) {
                settings.basil.namespace = map.get('target');
            }
            basil = new window.Basil(settings.basil);

            // Try to restore map center and zoom from the local storage
            if (!restoreMapProperties()) {
                // Or center map on user position and set a default zoom
                if (settings.centerOnPosition) {
                    setCenterOnPosition();
                    map.getView().setZoom(12);
                }
            }

            // Check map events and store changes to local storage
            storeMapChanges();
        }

        if (settings.debug) {
            debug();
        }
    };

    init();

    return {
        findLayerBy: findLayerBy,
        fitLayerGeometry: fitLayerGeometry,
        fitLayers: fitLayers,
        fitVectorLayer: fitVectorLayer,
        fitView: fitView,
        getSelectedBaseLayer: getSelectedBaseLayer,
        map: map,
        restoreMapProperties: restoreMapProperties,
        setCenter: setCenter,
        setCenterOnPosition: setCenterOnPosition,
        settings: settings,
        setZoom: setZoom,
        storeMapChanges: storeMapChanges,
        updateSize: updateSize
    };
};
//# sourceMappingURL=mapModule.js.map
