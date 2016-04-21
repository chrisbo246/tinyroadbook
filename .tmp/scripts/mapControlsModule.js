'use strict';

/*eslint-env browser, jquery */
/*global ol */
/**
 * OL3 controls module.
 * @module
 * @external ol
 * @return {Object} Public functions / variables
 */
/*eslint-disable no-unused-vars*/
var mapControlsModule = function () {
    /*eslint-enable no-unused-vars*/
    'use strict';

    var controls = {};

    /**
     * Create a new control using predefined settings
     * @public
     * @param {string} name - Predefined control
     * @return {Object} - OL3 control
     */
    var create = function create(name) {
        if (!controls[name]) {
            console.warn(name + ' control definition is not defined');
            return false;
        }
        var control = controls[name]();
        /*
        control.setProperties(settings.properties);
        if (properties) {
            control.setProperties(properties);
        }
        */
        return control;
    };
    // Controls ------------------------------------------------------------------------------------
    controls.attribution = function () {
        return new ol.control.Attribution({
            collapsible: true
            //tipLabel: $.t('buttons:olAttribution.label')
        });
    };
    controls.zoomSlider = function () {
        return new ol.control.ZoomSlider({});
    };
    controls.zoomToExtent = function () {
        //var projection = ol.proj.get('EPSG:4326'); // EPSG:3857 EPSG:4326
        //var extent = projection.getExtent();
        return new ol.control.ZoomToExtent({
            //extent: extent //ol.proj.transformExtent([-180, -90, 180, 90], 'EPSG:4326', 'EPSG:3857')
            //tipLabel: $.t('buttons:olZoomExtent.label')
        });
    };
    controls.scaleLine = function () {
        return new ol.control.ScaleLine({
            //tipLabel: $.t('buttons:olScaleLine.label')
        });
    };
    controls.fullScreen = function () {
        return new ol.control.FullScreen({
            //className: 'ol-glyphicon',
            //label: '\e140'
            //tipLabel: $.t('buttons:olFullScreen.label')
        });
    };
    controls.overviewMap = function () {
        return new ol.control.OverviewMap({
            // see in overviewmap-custom.html to see the custom CSS used
            className: 'ol-overviewmap ol-custom-overviewmap',
            //layers: [
            //    mapLayersModule.baselayers
            //],
            collapseLabel: '«',
            label: '»',
            collapsed: true
            //tipLabel: $.t('buttons:olOverviewmap.label')
        });
    };
    controls.layerSwitcher = function () {
        return new ol.control.LayerSwitcher({
            //tipLabel: $.t('buttons:olLayerswitcher.label')
        });
    };
    controls.mousePosition = function () {
        return new ol.control.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(4),
            projection: 'EPSG:4326', // infoProjection
            // comment the following two lines to have the mouse position
            // be placed within the map.
            className: 'custom-mouse-position',
            target: document.getElementById('mouse-position'),
            undefinedHTML: '&nbsp;'
        });
    };
    return {
        create: create
    };
}();
//# sourceMappingURL=mapControlsModule.js.map
