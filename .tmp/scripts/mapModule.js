'use strict';

/*eslint-env browser, jquery */
/*global ol */
/**
 * OL3 module.
 * @see {@link http://openlayers.org/en/v3.12.1/apidoc/}
 * @module
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
        basil: {}
    };

    settings = $.extend(true, {}, defaults, settings);

    // Global variables
    var basil;

    // Init Basil
    if (!basil && typeof window.Basil !== 'undefined') {
        // Define an unique namespace to store map data
        if (!settings.basil.namespace) {
            settings.basil.namespace = map.get('target');
        }
        basil = new window.Basil(settings.basil);
    }

    /**
     * Save map state using cookies or local storage
     * @public
     */
    var storeMapState = function storeMapState() {

        if (!basil) {
            return false;
        }

        var view = map.getView();

        // Store view center changes
        view.on('change:center', function () {
            basil.set('center', this.getCenter()); //, {'namespace': settings.basil.namespace}
        });

        // Store view resolution changes
        view.on('change:resolution', function () {
            basil.set('zoom', this.getZoom());
        });

        // Store map move changes
        map.on('moveend', function () {
            basil.set('center', view.getCenter());
        });

        // Store map render changes
        map.on('postrender', function () {
            basil.set('zoom', view.getZoom());
        });

        // Save / restore visible layers
        /*var layers = map.getLayers();
        mapLayersModule.treatLayers(map1, function (l) {
            if (l.getVisible()) {
                console.log('Selected layer', l.get('name'));
            } else {
                console.log('Unselected layer', l.get('name'));
            }
        });*/
    };

    /**
     * Save map state using cookies or local storage
     * @public
     * @return {Boolean} Restore success
     */
    var restoreMapState = function restoreMapState() {

        if (!basil) {
            return false;
        }

        var ok = false;
        var view = map.getView();

        // Restore map center
        if (basil.get('center')) {
            view.setCenter(basil.get('center'));
            ok = true;
        }

        // Restore map zoom
        if (basil.get('zoom')) {
            view.setZoom(basil.get('zoom'));
            ok = true;
        }

        // Save / restore visible layers
        /*var layers = map.getLayers();
        mapLayersModule.treatLayers(map1, function (l) {
            if (l.getVisible()) {
                console.log('Selected layer', l.get('name'));
            } else {
                console.log('Unselected layer', l.get('name'));
            }
        });*/

        return ok;
    };

    /**
     * Display event logs
     * @public
     */
    var debug = function debug() {

        var target = map.get('target');
        var view = map.getView();

        map.on('change change:layerGroup change:size change:target change:view click dblclick moveend pointerdrag pointermove postcompose postrender precompose propertychange singleclick', function (e) {
            console.log(target + ' map ', e);
            console.log(target + ' map ' + e.name + ' event firered', e.value);
        });

        view.on('change change:center change:resolution change:rotation propertychange', function (e) {
            console.log(target + ' map view ', e);
            console.log(target + ' map view ' + e.name + ' event firered', e.value);
        });

        /*map.on('moveend', function () {
            console.log(target + ' map moved', view.getCenter());
        });
        map.on('postrender', function () {
            console.log(target + ' map zoom changed after postrender', view.getZoom());
        });
        view.on('change:center', function () {
            console.log(target + ' view center changes', this.getCenter());
        });
        view.on('change:resolution', function () {
            console.log(target + ' view zoom changed', this.getZoom());
        });*/
    };

    /**
     * Add a predefined control on a initialized map
     * (Remove control with map.removeControl(control);)
     * @private
     * @param {string} control - Predefined control variable name
     */
    /*var addControl = function (control) {
        if (!controls[control]) {
            return false;
        }
        map.addControl(mapControlsModule.controls[control]);
    };*/

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
        var view = map.getView();
        var extent = layer.getSource().getExtent();
        view.fit(extent, map.getSize());
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

    return {
        settings: settings,
        map: map,
        basil: basil,
        debug: debug,
        setZoom: setZoom,
        setCenter: setCenter,
        setCenterOnPosition: setCenterOnPosition,
        getSelectedBaseLayer: getSelectedBaseLayer,
        storeMapState: storeMapState,
        restoreMapState: restoreMapState,
        fitView: fitView,
        fitLayers: fitLayers,
        fitVectorLayer: fitVectorLayer,
        fitLayerGeometry: fitLayerGeometry
    };
};
//# sourceMappingURL=mapModule.js.map
