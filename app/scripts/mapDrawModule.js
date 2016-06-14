/*eslint-env browser, jquery */
/*global ol */
/**
* OL3 draw module.
* @module
* @external ol
* @return {Object} Public functions / variables
*/
/*eslint-disable no-unused-vars*/
var mapDrawModule = (function () {
    /*eslint-enable no-unused-vars*/
    'use strict';

    var draw;
    var features = new ol.Collection();



    /**
    * Modify interaction
    */
    var modify = new ol.interaction.Modify({
        features: features,
        // the SHIFT key must be pressed to delete vertices, so
        // that new vertices can be drawn at the same position
        // of existing vertices
        deleteCondition: function (event) {
            return ol.events.condition.shiftKeyOnly(event) &&
            ol.events.condition.singleClick(event);
        }
    });



    /**
    * Features vector layer
    */
    var featureOverlay = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: features
        }),
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        })
    });



    /**
    * Add the draw interaction to the map
    * @public
    * @param {Object} map - OL3 map
    */
    var init = function (map) {
        featureOverlay.setMap(map);
        map.addInteraction(modify);
    };



    /**
    * Add a draw interaction to the map
    * @public
    * @param {string} type - Interaction type
    * @param {Object} OL3 map
    */
    var drawInteraction = function (type, map) {
        if (type) {
            draw = new ol.interaction.Draw({
                features: features,
                type: /** @type {ol.geom.GeometryType} */ (type)
            });
            map.addInteraction(draw);
        }
    };



    /**
    * Let user change the geometry type.
    * @public
    * @param {string} id - Select input ID
    * @param {Object} map - OL3 map
    */
    var addDrawTypeSwitcher = function (id, map) {
        var typeSelect = document.getElementById(id);
        typeSelect.onchange = function () {
            map.removeInteraction(draw);
            drawInteraction(typeSelect.value, map);
        };
        drawInteraction(typeSelect.value, map);
    };



    return {
        init: init,
        drawInteraction: drawInteraction,
        addDrawTypeSwitcher: addDrawTypeSwitcher
    };

})();
