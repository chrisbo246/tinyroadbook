/*eslint-env browser, jquery */
/*global escape, ol */
/**
 * OL3 inputs module.
 * @module
 * @external $
 * @external escape
 * @external ol
 * @return {Object} Public functions / variables
 */
/*eslint-disable no-unused-vars*/
var mapInputsModule = (function () {
    /*eslint-enable no-unused-vars*/
    'use strict';

    /** @private */
    var map;



    /** @private */
    var inputs = {};



    /**
     * Create a new input using predefined settings
     * @public
     * @param {string} name - Predefined input (variable name)
     * @return {Object} OL3 layer
     */
    var create = function (name, selector) {
        if (!inputs[name]) {
            console.warn(name + ' input definition does not exists');
            return false;
        }
        var input = inputs[name](selector);
        return input;
    };



    /**
     * Base layer select
     * @param {string} selector - Select input ID
     * @param {Object} map - OL3 map
     */
    inputs.layer = function (selector) {
        var $input = $(selector);
        if ($input) {
            map.getLayers().forEach(function (layer) {
                if (layer.get('visible')) {
                    $input.val(layer.get('name'));
                }
            });
            $input.on('change', function () {
                var name = $input.find(':selected').val();
                map.getLayers().forEach(function (layer) {
                    layer.set('visible', (layer.get('name') === name));
                });
            });
        }
    };



    /**
     * Map zoom input
     * @param {string} selector - Input ID or class
     * @param {Object} map - OL3 map
     */
    inputs.zoom = function (selector) {
        var $input = $(selector);
        if ($input) {
            $input.val(this.getZoom());
            $input.on('change', function () {
                var val = $input.val();
                if (val || val === 0) {
                    map.getView().setZoom(val);
                }
            });
            map.getView().on('change:resolution', function () {
                $input.val(this.getZoom());
            });
        }
    };



    /**
     * Map resolution input
     * @param {string} selector - Input ID or class
     * @param {Object} map - OL3 map
     */
    inputs.resolution = function (selector) {
        var $input = $(selector);
        if ($input) {
            $input.val(this.getResolution());
            $input.on('change', function () {
                var val = $input.val();
                if (val || val === 0) {
                    map.getView().setResolution(val);
                }
            });
            map.getView().on('change:resolution', function () {
                $input.val(this.getResolution());
            });
        }
    };



    /**
     * Map rotation input
     * @param {string} selector - Input ID or class
     * @param {Object} map - OL3 map
     */
    inputs.rotation = function (selector) {
        var $input = $(selector);
        $input.on('change', function () {
            var val = $input.val();
            if (val || val === 0) {
                map.getView().setRotation(val);
            }
        });
        map.getView().on('change:rotation', function () {
            $input.val(this.getRotation());
        });
    };



    /**
     * Map X center input
     * @param {string} selector - Input ID or class
     * @param {Object} map - OL3 map
     */
    inputs.centerX = function (selector) {
        var $input = $(selector);
        $input.on('change', function () {
            var val = $input.val();
            if (val || val === 0) {
                // map.getView().setCenter($centerX.val(), $centerY.val());
            }
        });
        map.getView().on('change:center', function () {
            var lonLat = this.getCenter();
            $input.val(lonLat[0]); // .toFixed(2)
        });
    };



    /**
     * Map Y center input
     * @param {string} selector - Input ID or class
     * @param {Object} map - OL3 map
     */
    inputs.centerY = function (selector) {
        var $input = $(selector);
        $input.on('change', function () {
            var val = $input.val();
            if (val || val === 0) {
                //map.getView().setCenter($centerX.val(), val);
            }
        });
        map.getView().on('change:center', function () {
            var lonLat = this.getCenter();
            $input.val(lonLat[1]); // .toFixed(2)
        });
    };



    /**
     * Map XY center input
     * @param {string} selector - Input ID or class
     * @param {Object} map - OL3 map
     */
    inputs.center = function (Xselector, Yselector) {
        var $centerX = $(Xselector);
        var $centerY = $(Yselector);
        map.getView().on('change:center', function () {
            var lonLat = this.getCenter();
            if (lonLat) {
                $centerX.val(lonLat[0].toFixed(2));
                $centerY.val(lonLat[1].toFixed(2));
            }
        });
        $(Xselector + ', ' + Yselector).on('change', function () {
            if (($centerX.val() || $centerX.val() === 0) && ($centerY.val() || $centerY.val() === 0)) {
                map.getView().setCenter($centerX.val(), $centerY.val());
            }
        });
    };



    /**
     * Export map as PNG
     */
    inputs.exportPNG = function () {
        var $input = document.getElementById('export-png');
        if ($input) {
            $input.on('click', function () {
                map.once('postcompose', function (event) {
                    var canvas = event.context.canvas;
                    $input.attr('href', canvas.toDataURL('image/png'));
                });
                // map.renderSync();
            });
        }
    };



    /**
     * Update layer source url from a file input
     * <input id="gpx_file" type="file" accept=".gpx" />
     * @see {@link http://www.html5rocks.com/en/tutorials/file/dndfiles/}
     * @public
     * @param {string} selector - File input ID
     * @param {Object} layer - OL3 vector layer
     */
    inputs.GPXSource = function (selector, layer) {
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            console.warn('The File APIs are not fully supported in this browser.');
        }
        var $filePath = $(selector);
        $filePath.on('change', function (inputEvent) {
            var files = inputEvent.target.files;
            files.forEach(function (f) {
                var reader = new FileReader();
                reader.onload = (function (loadEvent) {
                    return function (returned) {
                        layer.setProperties({
                            title: escape(loadEvent.name),
                            source: new ol.source.Vector({
                                url: returned.target.result,
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
        create: create
    };

})();
