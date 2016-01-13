//jslint browser: true
//global $, mapModule

/**
 * OL3 inputs module.
 * @external jQuery
 * @external OL3
 * @external mapModule
 * @module
 * @returns {Object} mapModule
 */
'use strict';

var mapInputsModule = (function (mapModule) {
    'use strict';

    /**
     * Layer switcher
     * @param {string} selector - Select input ID
     * @param {Object} map - OL3 map
     */
    mapModule.addLayerSwitcher = function (selector, map) {

        var $el = $(selector);
        if (!$el) {
            return;
        }

        var layers = map.getLayers();

        $el.change(function () {
            var name = $el.find(':selected').val();
            layers.forEach(function (layer) {
                layer.set('visible', layer.get('name') === name);
            });
        });

        $el.trigger('change');
    };

    /**
     * Zoom switcher
     * @param {string} selector - Select input ID
     * @param {Object} map - OL3 map
     */
    mapModule.addZoomSwitcher = function (selector, map) {

        var $el = $(selector);
        if (!$el) {
            return;
        }

        var view = map.getView();
        view.on('change:resolution', function () {
            var zoom = view.getZoom();
            $el.val(zoom);
        });
    };

    return mapModule;
})(mapModule || {});
//# sourceMappingURL=mapInputsModule.js.map
