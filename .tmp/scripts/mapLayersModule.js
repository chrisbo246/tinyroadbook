'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/*eslint-env browser, jquery */
/*global console, $, ol, Basil, parsley, commonsModule */
/**
 * OL3 layers module.
 * @module
 * @external $
 * @external ol
 * @return {Object} Public functions / variables
 */
/*eslint-disable no-unused-vars*/
var mapLayersModule = function () {
    /*eslint-enable no-unused-vars*/
    'use strict';

    var settings = {
        debug: false,
        bingMapsKey: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
        properties: {
            visible: false
        },
        basil: {}
    };

    var olLayerTypes = ['Base', 'Group', 'Heatmap', 'Image', 'Layer', 'Tile', 'Vector', 'VectorTile'];

    var olSourceTypes = ['BingMaps', 'CartoDB', 'Cluster', 'Image', 'ImageCanvas', 'ImageMapGuide', 'ImageStatic', 'ImageVector', 'ImageWMS', 'MapQuest', 'OSM', 'Raster', 'Source', 'Stamen', 'Tile', 'TileArcGISRest', 'TileDebug', 'TileImage', 'TileJSON', 'TileUTFGrid', 'TileWMS', 'Vector', 'VectorTile', 'WMTS', 'XYZ', 'Zoomify'];
    // 'ImageArcGISRest', 'ImageEvent', 'RasterEvent', 'TileEvent', 'VectorEvent', 'UrlTile',

    var olFormatTypes = ['GMLBase', 'JSONFeature', 'TextFeature', 'XML', 'XMLFeature', 'EsriJSON', 'Feature', 'GeoJSON', 'GML', 'GML2', 'GML3', 'GPX', 'IGC', 'KML', 'MVT', 'OSMXML', 'Polyline', 'TopoJSON', 'WFS', 'WKT', 'WMSCapabilities', 'WMSGetFeatureInfo', 'WMTSCapabilities'];

    var olStyleTypes = ['AtlasManager', 'Circle', 'Fill', 'Icon', 'Image', 'RegularShape', 'Stroke', 'Style', 'Text'];

    var olSourceGetters = { 'revision': 'getRevision', 'state': 'getState', 'urls': 'getUrls', 'url': 'getUrl' };
    //'attributions': 'getAttributions', 'logo': 'getLogo', 'projection': 'getProjection',
    //'tileGrid': 'getTileGrid', 'tileLoadFunction': 'getTileLoadFunction', 'tileUrlFunction': 'getTileUrlFunction'
    //var olSourceSetters = {'revision': 'setRevision', 'state': 'setState', 'urls': 'setUrls', 'url': 'setUrl'};
    var olStyleTypeGetters = { 'Fill': 'getFill', 'Image': 'getImage', 'Stroke': 'getStroke', 'Text': 'getText' };
    var olStylePropertyGetters = { 'color': 'getColor', 'lineCap': 'getLineCap', 'geometry': 'getGeometry', 'geometryFunction': 'getGeometryFunction', 'lineDash': 'getLineDash',
        'lineJoin': 'getLineJoin', 'miterLimit': 'getMiterLimit', 'width': 'getWidth', 'zIndex': 'getZIndex' };
    var olStylePropertySetters = { 'color': 'setColor', 'lineCap': 'setLineCap', 'geometry': 'setGeometry', 'geometryFunction': 'setGeometryFunction', 'lineDash': 'setLineDash',
        'lineJoin': 'setLineJoin', 'miterLimit': 'setMiterLimit', 'width': 'setWidth', 'zIndex': 'getZIndex' };

    var protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';

    var layers = {};
    var selectedLayer;
    var basil;

    if (typeof Basil === 'function') {
        basil = new window.Basil(settings.basil);
    }

    /**
     * Display some logs about layer events
     * @private
     * @param {Object} layer - ol.layer
     */
    var debug = function debug(layer) {

        if (!settings.debug) {
            commonsModule.hideLogs();
            return false;
        }

        // postcompose precompose render propertychange
        'change change:blur change:extent change:gradient change:layers change:maxResolution change:minResolution change:opacity change:preload change:radius change:source change:useInterimTilesOnError change:visible change:zIndex'.split(' ').forEach(function (eventType) {
            layer.on(eventType, function (e) {
                if (e.key) {
                    console.log('Layer ' + e.key + ' changed', layer.get(e.key));
                } else {
                    console.log(e.target.get('name') + ' layer' + e.type, e);
                }
            });
        });
    };

    /**
     * Restore some properties from the local storage and save changes
     * @private
     * @param {Object} layer - ol.layer
     */
    var watchLayerChanges = function watchLayerChanges(layer) {

        // Store layer properties changes
        layer.on('propertychange', function () {

            var namespace = layer.get('name');
            if (namespace) {

                var properties = layer.getProperties();
                var key = 'properties';
                var value = {
                    visible: properties.visible,
                    zIndex: properties.zIndex,
                    opacity: properties.opacity
                };
                basil.set(key, value, { 'namespace': namespace });
                console.log(namespace + ' properties stored', value);
            }
        });
    };

    /**
     * Restore all layers properties from the local storage
     * @private
     * @param {Object} layer - ol.layer
     */
    var restoreLayer = function restoreLayer(layer) {

        var namespace = layer.get('name');
        if (namespace) {

            var key = 'properties';
            var value = basil.get(key, { 'namespace': namespace });
            if (value !== null) {
                layer.setProperties(value);
                console.log(namespace + ' ' + key + ' restored', value);
            }
        }
    };

    /**
     * Create a new layer using predefined settings
     * @public
     * @param {string} name - Predefined layer (variable name)
     * @param {Object} [properties] - Layer custom parameters
     * @return {Object} OL3 layer
     */
    var create = function create(name, properties) {

        if (!layers[name]) {
            console.warn(name + ' layer definition is not defined');
            return false;
        }

        // Define the new layer with a predefined layer
        var layer = layers[name]();

        debug(layer);

        // Apply default and custom settings
        layer.setProperties($.extend(true, {}, settings.properties, properties));

        // Append a link to the settings after each title
        var title = layer.get('title');
        if (title) {
            layer.set('title', title + ' <a href="#layer_settings_modal" data-toggle="modal" data-layer="' + name + '">' + '<span class="glyphicon glyphicon-cog"></span></a>');
        }

        if (basil) {
            restoreLayer(layer);
            watchLayerChanges(layer);
        }

        return layer;
    };

    /**
     * Apply a function on (nested) layers
     * @public
     * @param {Object} layer - Map object or layer group
     * @param {function} fn - Function with layer as parameter, to apply to each layer
     */
    var treatLayers = function treatLayers(layer, fn) {

        $.each(layers, function (i, l) {
            if (l.getLayers()) {
                treatLayers(l, fn);
            } else {
                fn(l);
            }
        });
    };

    /**
     * Live update layer values once a field was validated by Parsley
     * @public
     * @param {Object} layer - Map object or layer group
     */
    var validateSettingsForm = function validateSettingsForm(formSelector) {

        var $input, key, value, style, type;

        if (!$().parsley) {
            console.warn('Parsley is not defined');
            return false;
        }

        var $form = $(formSelector);
        $form.parsley({
            excluded: 'input[type=button], input[type=submit], input[type=reset], input[type=hidden], [disabled], :hidden'
        }).on('field:success', function () {
            $input = this.$element;

            // Update layer properties
            if ($input.is('[data-ol-layer][data-ol-property]')) {
                key = $input.data('ol-property');
                value = commonsModule.getInputValue($input);
                if (key && value !== null) {
                    selectedLayer.set(key, value);
                }
            }

            // Update source urls
            if ($input.is('[data-ol-source][data-ol-property="urls"]')) {
                value = commonsModule.getInputValue($input);
                value = value.split('\n');
                updateSourceUrl(selectedLayer, value);
            }

            // Update source features
            if ($input.is('[data-ol-source="Vector"][data-ol-format="GPX"]')) {
                value = commonsModule.getInputValue($input);
                loadFileFeatures(selectedLayer, value, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                });
                //mapModule.fitVectorLayer(selectedLayer);
            }

            // Update layer style
            if ($input.is('[data-ol-style][data-ol-property]')) {
                key = $input.data('ol-property');
                value = commonsModule.getInputValue($input);
                type = $input.data('ol-style');
                style = selectedLayer.getStyle();
                if (olStyleTypeGetters[type] && _typeof(style[olStyleTypeGetters[type]])) {
                    style = style[olStyleTypeGetters[type]]();
                    if (olStylePropertySetters[key] && _typeof(style[olStylePropertySetters[key]])) {
                        style[olStylePropertySetters[key]](value);
                    }
                }
            }
        }).on('form:submit', function () {
            // Prevent form submission
            return false;
        });
    };

    /**
     * Edit layer
     * @public
     * @param {Object} layer - Map object or layer group
     */
    var initSettingsForm = function initSettingsForm(layer, formSelector, formGroupSelector) {

        var $input, $groups, key, value;

        var $form = $(formSelector);
        var $formGroups = $form.find(formGroupSelector);

        // Memorize the selected layer
        selectedLayer = layer;

        // Hide every form groups
        $formGroups.hide();

        // Get layer types
        var layerTypes = commonsModule.getInstancesOf(layer, ol.layer, olLayerTypes);
        console.log('Layer types', layerTypes);

        // Get layer properties
        var layerKeys = layer.getKeys();
        console.log('Layer keys', layerKeys);
        var layerProperties = layer.getProperties(layer);
        console.log('Layer properties', layerProperties);
        if (typeof layer.getSource === 'function') {
            var source = layer.getSource();
        }
        if (typeof layer.getStyle === 'function') {
            var style = layer.getStyle();
        }

        // Unhide filtered form groups
        //$groups = $formGroups.has('[data-ol-layer]');
        var types = layerTypes;
        types.push('*');
        types.forEach(function (type) {
            $groups = $formGroups.has('[data-ol-layer="' + type + '"]');
            layerKeys.forEach(function (key2) {
                $groups.has('[data-ol-property="' + key2 + '"]').show().find('label small').html('(' + type + ')');
            });
        });

        if (source) {

            // Get source types
            var sourceTypes = commonsModule.getInstancesOf(source, ol.source, olSourceTypes);
            console.log('Layer source types', sourceTypes);

            // Get source properties
            var sourceKeys = source.getKeys();
            console.log('Layer source keys', sourceKeys);
            var sourceProperties = source.getProperties(layer);
            console.log('Layer source properties', sourceProperties);
            //if (typeof source.getUrls === 'function') {
            //    var sourceUrls = source.getUrls(layer);
            //    console.log('Source URLs', sourceUrls);
            //}
            if (typeof source.getFormat === 'function') {
                var format = source.getFormat();
            }

            var sourceExtraProperties = {};
            $.each(olSourceGetters, function (key2, getter2) {
                if (typeof source[getter2] === 'function') {
                    value = source[getter2]();
                    if (value && !sourceProperties[key2]) {
                        sourceExtraProperties[key2] = value;
                    }
                }
            });
            console.log('Source extra properties', sourceExtraProperties);

            // Unhide filtered form groups
            //$groups = $formGroups.has('[data-ol-source]');
            types = sourceTypes;
            types.push('*');
            types.forEach(function (type) {
                $groups = $formGroups.has('[data-ol-source="' + type + '"]');
                sourceKeys.forEach(function (key2) {
                    $groups.has('[data-ol-property="' + key2 + '"]').show().find('label small').html('(' + type + ')');
                });
                $.each(sourceExtraProperties, function (key2) {
                    $groups.has('[data-ol-property="' + key2 + '"]').show().find('label small').html('(' + type + ')');
                });
                //if (sourceUrls) {
                //    $groups.has('[data-ol-property="urls"]').show();
                //}
            });

            if (format) {

                // Get format types
                var formatTypes = commonsModule.getInstancesOf(format, ol.format, olFormatTypes);
                console.log('Layer format types', formatTypes);

                // Unhide filtered form groups
                //$groups = $formGroups.has('[data-ol-format]');
                types = formatTypes;
                types.push('*');
                types.forEach(function (type) {
                    $groups = $formGroups.has('[data-ol-format="' + type + '"]');
                    $groups.show().find('label small').html('(' + type + ')');
                });
                $groups.has('[data-ol-format=""]').show();
            }

            /*
            if (typeof source.getFeatures === 'function'') {
                var features = source.getFeatures();
            }
             if (features) {
                $.each(features, function (i, feature) {
                     var id = feature.getId();
                    console.log('Feature id', id);
                    var keys = feature.getKeys();
                    console.log('Feature keys', keys);
                     if (typeof feature.getFormat === 'function') {
                        format = feature.getFormat();
                    }
                     if (format) {
                        var types = commonsModule.getInstancesOf(format, ol.format, olFormatTypes);
                        console.log('Feature format types', types);
                    }
                 });
            }
            */
        }

        if (style) {

            var styleTypes = commonsModule.getInstancesOf(style, ol.style, olStyleTypes);
            console.log('Layer style types', styleTypes);

            var styleProperties = {};

            $.each(olStyleTypeGetters, function (key2, getter2) {
                if (typeof style[getter2] === 'function') {

                    styleProperties[key2] = {};
                    value = style[getter2]();

                    if (value) {
                        styleTypes = commonsModule.getInstancesOf(value, ol.style, olStyleTypes);

                        // If property is a child style
                        if (styleTypes) {
                            console.log('Child style ' + key2 + ' found', styleTypes);

                            // Unhide filtered form groups
                            //$groups = $formGroups.has('[data-ol-style]');
                            types = styleTypes;
                            types.push('*');
                            types.forEach(function (type) {
                                $groups = $formGroups.has('[data-ol-style="' + type + '"]');

                                $.each(olStylePropertyGetters, function (key3, getter3) {
                                    if (typeof value[getter3] === 'function') {
                                        value = value[getter3]();
                                        //console.log(key2 + ' ' + key3 + '(' + (typeof value) + ')', value);
                                        styleProperties[key2][key3] = value;
                                        $groups.has('[data-ol-property="' + key3 + '"]').show().find('label small').html('(' + type + ')');
                                    }
                                });
                            });
                        } else {
                            styleProperties[key2] = value;
                        }
                    }
                }
            });
            console.log('Layer style properties', styleProperties);
        }

        // Populate fields with layer properties
        if (layerProperties) {
            $formGroups.find(':input').filter('[data-ol-layer][data-ol-property]').each(function () {
                $input = $(this);
                key = $input.data('ol-property');
                if (layerProperties[key] !== null) {
                    value = layerProperties[key];
                    commonsModule.setInputValue($input, value);
                    console.log('Layer property ' + key + ' populated', value);
                }
            });
        }

        if (sourceProperties) {
            $formGroups.find(':input').filter('[data-ol-source][data-ol-property]').each(function () {
                $input = $(this);
                key = $input.data('ol-property');
                if (sourceProperties[key] !== null) {
                    value = sourceProperties[key];
                    commonsModule.setInputValue($input, value);
                    console.log('Source property ' + key + ' populated', value);
                }
            });
        }
        if (sourceExtraProperties) {
            $formGroups.find(':input').filter('[data-ol-source][data-ol-property]').each(function () {
                $input = $(this);
                key = $input.data('ol-property');
                if (sourceExtraProperties[key] !== null) {
                    value = sourceExtraProperties[key];
                    commonsModule.setInputValue($input, value);
                    console.log('Source property ' + key + ' populated', value);
                }
            });
        }
        /*if (sourceUrls) {
            $formGroups.find(':input').filter('[data-ol-source][data-ol-property="urls"]').each(function () {
                $input = $(this);
                value = sourceUrls;
                commonsModule.setInputValue($input, value);
                console.log('Layer input "URL" populated', value);
            });
        }*/

        if (formatTypes) {
            $formGroups.find(':input').filter('[data-ol-source="Vector"][data-ol-format="GPX"]').each(function () {
                console.log('Layer input "file" ready', value);
            });
        }

        if (styleProperties) {
            var styleType;
            $formGroups.find(':input').filter('[data-ol-style][data-ol-property]').each(function () {
                $input = $(this);
                styleType = $input.data('ol-style');
                key = $input.data('ol-property');
                if (styleType && key && styleProperties[styleType] && styleProperties[styleType][key] !== null) {
                    value = styleProperties[styleType][key];
                    console.log(styleType + ' ' + key + ' (' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)) + ')', value);
                    commonsModule.setInputValue($input, value);
                }
            });
        }

        // Initialize Parsley excluding hidden fields
        // and update layer properties when the form is submitted
        validateSettingsForm(formSelector);
    };

    /**
     * Update layer source url
     * @public
     * @param {Object} layer - OL3 layer
     * @param {String|array} url - URL
     */
    var updateSourceUrl = function updateSourceUrl(layer, url) {

        if (!layer) {
            return false;
        }

        var source = layer.getSource();

        if (typeof source.setUrls !== 'undefined') {
            if ($.isArray(url)) {
                source.setUrls(url);
            } else {
                url = $.trim(url);
                source.setUrl(url);
            }
        }

        // Show layer if the URL is defined, else hide layer
        //layer.setVisible((url));
    };

    /**
     * Update the GPX layer with the input file values
     * @private
     * @param {Object} layer - OL layer
     * @param {Object} files - Input file [files]
     * @param {Object} featuresOptions - Features options
     */
    var loadFileFeatures = function loadFileFeatures(layer, files, featuresOptions) {

        if (files.length === 0) {
            return false;
        }

        var source = layer.getSource();

        // Remove all features
        source.clear();

        var dfd = commonsModule.reader(files, function (result) {

            // Import features from files
            var format = source.getFormat();
            var features = format.readFeatures(result, featuresOptions);
            source.addFeatures(features);

            // Display layer
            layer.setVisible(true);
        });

        // Refresh the layerswitcher control
        //layerSwitcherControl.renderPanel();

        // Adjust the view to fit tracks
        //mapMod1.fitVectorLayer(gpxLayer);

        return dfd;
    };

    // Styles ______________________________________________________________________________________
    /**
     * Timezones layer style
     * @see http://openlayers.org/en/v3.4.0/examples/kml-timezones.html
     * @private
     */
    var timezonesStyle = function timezonesStyle(feature) {
        // feature, resolution
        var offset = 0;
        var name = feature.get('name'); // e.g. GMT -08:30
        var match = name.match(/([\-+]\d{2}):(\d{2})$/);
        if (match) {
            var hours = parseInt(match[1], 10);
            var minutes = parseInt(match[2], 10);
            offset = 60 * hours + minutes;
        }
        var date = new Date();
        var local = new Date(date.getTime() + (date.getTimezoneOffset() + offset) * 60000);
        // offset from local noon (in hours)
        var delta = Math.abs(12 - local.getHours() + local.getMinutes() / 60);
        if (delta > 12) {
            delta = 24 - delta;
        }
        var opacity = 0.75 * (1 - delta / 12);
        return [new ol.style.Style({
            fill: new ol.style.Fill({
                color: [0x55, 0x55, 0x55, opacity]
                //color: [0xff, 0xff, 0x33, opacity]
            }),
            stroke: new ol.style.Stroke({
                color: '#ffffff'
            })
        })];
    };

    // Base layers _________________________________________________________________________________
    layers.openStreetMap = function () {
        return new ol.layer.Tile({
            name: 'openStreetMap',
            title: 'Road Map<small> (by <a href="https://www.openstreetmap.org">OpenStreetMap</a>)</small>', // (offline)
            visible: true,
            type: 'base',
            source: new ol.source.OSM({
                // crossOrigin: null,
                urls: [protocol + '//a.tile.openstreetmap.org/{z}/{x}/{y}.png'
                //'../../Datas/Tiles/osm_mapnik/{z}/{x}/{y}.png'
                ]
            })
        });
    };
    layers.openSeaMap = function () {
        return new ol.layer.Tile({
            name: 'openSeaMap',
            title: 'Shipping lanes<small> (by <a href="http://www.openseamap.org">OpenSeaMap</a>)</small>',
            type: 'base',
            source: new ol.source.OSM({
                attributions: [new ol.Attribution({
                    html: 'All maps &copy; ' + '<a href="http://www.openseamap.org/">OpenSeaMap</a>'
                }), ol.source.OSM.ATTRIBUTION],
                crossOrigin: null,
                urls: ['http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', 'http://t1.openseamap.org/seamark/{z}/{x}/{y}.png']
            })
        });
    };
    layers.openStreetMapHumanitarian = function () {
        return new ol.layer.Tile({
            name: 'openStreetMapHumanitarian',
            title: 'Humanitarian <small>(by <a href="https://www.openstreetmap.org">OpenStreetMap</a>)</small>',
            type: 'base',
            source: new ol.source.OSM({
                attributions: [new ol.Attribution({
                    html: 'All maps &copy; ' + '<a href="http://www.openstreetmap.fr/">OpenStreetMap</a>'
                }), ol.source.OSM.ATTRIBUTION],
                url: protocol + '//tile-{a-c}.openstreetmap.fr/hot/{z}/{x}/{y}.png'
            })
        });
    };
    layers.mapquestOSM = function () {
        return new ol.layer.Tile({
            name: 'mapquestOSM',
            title: 'Road map<small> (by <a href="http://open.mapquest.com">MapQuest</a>)</small>',
            type: 'base',
            source: new ol.source.MapQuest({
                layer: 'osm'
            })
        });
    };
    layers.mapquestSat = function () {
        return new ol.layer.Tile({
            name: 'mapquestSat',
            title: 'Aerial view<small> (by <a href="http://open.mapquest.com">MapQuest</a>)</small>',
            type: 'base',
            source: new ol.source.MapQuest({
                layer: 'sat'
            })
        });
    };
    // http://thunderforest.com/maps/opencyclemap/
    layers.openCycleMap = function () {
        return new ol.layer.Tile({
            name: 'openCycleMap',
            title: 'Cycling roads<small> (by <a href="http://www.opencyclemap.org">OpenCycleMap</a>)</small>',
            type: 'base',
            source: new ol.source.OSM({
                attributions: [new ol.Attribution({
                    html: 'All maps &copy; ' + '<a href="http://www.opencyclemap.org/">OpenCycleMap</a>'
                }), ol.source.OSM.ATTRIBUTION],
                url: 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
            })
        });
    };
    // http://thunderforest.com/maps/transport/
    layers.thunderforestTransport = function () {
        return new ol.layer.Tile({
            name: 'thunderforestTransport',
            title: 'Transports<small> (by <a href="http://www.thunderforest.com">ThunderForest</a>)</small>',
            type: 'base',
            source: new ol.source.OSM({
                attributions: [new ol.Attribution({
                    html: 'All maps &copy; ' + '<a href="http://www.thunderforest.com/">ThunderForest</a>'
                }), ol.source.OSM.ATTRIBUTION],
                url: 'http://{a-c}.tile.thunderforest.com/transport/{z}/{x}/{y}.png'
            })
        });
    };
    // http://thunderforest.com/maps/transport-dark/
    layers.thunderforestTransportDark = function () {
        return new ol.layer.Tile({
            name: 'thunderforestTransportDark',
            title: 'Transport dark<small> (by <a href="http://www.thunderforest.com">ThunderForest</a>)</small>',
            type: 'base',
            source: new ol.source.OSM({
                attributions: [new ol.Attribution({
                    html: 'All maps &copy; ' + '<a href="http://www.thunderforest.com/">ThunderForest</a>'
                }), ol.source.OSM.ATTRIBUTION],
                url: 'https://{a-c}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png'
            })
        });
    };
    // http://thunderforest.com/maps/landscape/
    layers.thunderforestLandscape = function () {
        return new ol.layer.Tile({
            name: 'thunderforestLandscape',
            title: 'Landscape<small> (by <a href="http://www.thunderforest.com">ThunderForest</a>)</small>',
            type: 'base',
            source: new ol.source.OSM({
                attributions: [new ol.Attribution({
                    html: 'All maps &copy; ' + '<a href="http://www.thunderforest.com/">ThunderForest</a>'
                }), ol.source.OSM.ATTRIBUTION],
                url: 'https://{a-c}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png'
            })
        });
    };
    // http://thunderforest.com/maps/outdoors/
    layers.thunderforestOutdoor = function () {
        return new ol.layer.Tile({
            name: 'thunderforestOutdoor',
            title: 'Outdoor activities<small> (by <a href="http://www.thunderforest.com">ThunderForest</a>)</small>',
            type: 'base',
            source: new ol.source.OSM({
                attributions: [new ol.Attribution({
                    html: 'All maps &copy; ' + '<a href="http://www.thunderforest.com/">ThunderForest</a>'
                }), ol.source.OSM.ATTRIBUTION],
                url: 'https://{a-c}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png'
            })
        });
    };
    layers.arcgis = function () {
        return new ol.layer.Tile({
            name: 'arcgis',
            title: 'Terrain<small> (by <a href="https://services.arcgisonline.com">ArcGIS</a>)</small>',
            type: 'base',
            source: new ol.source.XYZ({
                crossOrigin: 'anonymous', // Important
                attributions: [new ol.Attribution({
                    html: 'Tiles &copy; <a href="https://services.arcgisonline.com/ArcGIS/' + 'rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
                })],
                url: protocol + '//server.arcgisonline.com/ArcGIS/rest/services/' + 'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
            })
        });
    };
    layers.arcgisRestHighwayUSA = function () {
        return new ol.layer.Tile({
            name: 'arcgisRestHighwayUSA',
            title: 'Highway USA<small> (by <a href="https://services.arcgisonline.com">ArcGIS</a>)</small>',
            type: 'base',
            extent: [-13884991, 2870341, -7455066, 6338219],
            source: new ol.source.TileArcGISRest({
                url: protocol + '//sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/' + 'ESRI_StateCityHighway_USA/MapServer'
            })
        });
    };
    layers.googleMap = function () {
        return new ol.layer.Tile({
            name: 'googleMap',
            title: 'Road map<small> (by <a href="https://www.google.com/maps/">Google</a>)</small>',
            type: 'base',
            source: new ol.source.XYZ({
                crossOrigin: 'anonymous', // Important
                url: protocol + '//mt1.google.com/vt/lyrs=m@285235804&hl=en&x={x}&y={y}&z={z}&s=1'
            })
        });
    };
    layers.googleTerrain = function () {
        return new ol.layer.Tile({
            name: 'googleTerrain',
            title: 'Terrain + labels<small> (by <a href="https://www.google.com/maps/">Google</a>)</small>',
            type: 'base',
            source: new ol.source.XYZ({
                crossOrigin: 'anonymous', // Important
                url: protocol + '//mts1.google.com/vt/lyrs=t@132,r@285000000&hl=en&src=app&x={x}&y={y}&z={z}&s=1'
                //url: protocol + '//mts0.google.com/maps//vt/lyrs=t@132,r@285000000&hl=en&src=app&x={x}&y={y}&z={z}&s=1'
            })
        });
    };
    layers.googleSatellite = function () {
        return new ol.layer.Tile({
            name: 'googleSatellite',
            title: 'Aerial view<small> (by <a href="https://www.google.com/maps/">Google</a>)</small>',
            type: 'base',
            source: new ol.source.XYZ({
                crossOrigin: 'anonymous', // Important
                //resolutions: [9784, 2446, 1223, 76.44, 9.55, 2.39],
                url: protocol + '//www.google.se/maps/vt/pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m2!1e1!3i198!4e0'
                //url: protocol + '//khms0.google.com/maps//kh/v=165&src=app&x={x}&y={y}&z={z}&s=1'
            })
        });
    };
    layers.bingRoad = function () {
        return new ol.layer.Tile({
            name: 'bingRoad',
            title: 'Road map<small> (by <a href="https://www.bing.com/maps/">Bing</a>)</small>',
            type: 'base',
            maxZoom: 19,
            source: new ol.source.BingMaps({
                key: settings.bingMapsKey,
                imagerySet: 'Road'
            })
        });
    };
    layers.bingAerial = function () {
        return new ol.layer.Tile({
            name: 'bingAerial',
            title: 'Aerial view<small> (by <a href="https://www.bing.com/maps/">Bing</a>)</small>',
            type: 'base',
            maxZoom: 19,
            source: new ol.source.BingMaps({
                key: settings.bingMapsKey,
                imagerySet: 'Aerial'
            })
        });
    };
    layers.bingAerialWithLabels = function () {
        return new ol.layer.Tile({
            name: 'bingAerialWithLabels',
            title: 'Aerial view with labels<small> (by <a href="https://www.bing.com/maps/">Bing</a>)</small>',
            type: 'base',
            maxZoom: 19,
            source: new ol.source.BingMaps({
                key: settings.bingMapsKey,
                imagerySet: 'AerialWithLabels'
            })
        });
    };
    layers.bingCollinsBart = function () {
        return new ol.layer.Tile({
            name: 'bingCollinsBart',
            title: 'CollinsBart<small> (by <a href="https://www.bing.com/maps/">Bing</a>)</small>',
            type: 'base',
            maxZoom: 19,
            source: new ol.source.BingMaps({
                key: settings.bingMapsKey,
                imagerySet: 'collinsBart'
            })
        });
    };
    layers.bingOrdnanceSurvey = function () {
        return new ol.layer.Tile({
            name: 'bingOrdnanceSurvey',
            title: 'OrdnanceSurvey<small> (by <a href="https://www.bing.com/maps/">Bing</a>)</small>',
            type: 'base',
            maxZoom: 19,
            source: new ol.source.BingMaps({
                key: settings.bingMapsKey,
                imagerySet: 'ordnanceSurvey'
            })
        });
    };
    // Stamen
    // http://maps.stamen.com/#watercolor/12/37.7706/-122.3782
    // toner toner-hybrid toner-labels toner-lines toner-background toner-lite
    layers.stamenToner = function () {
        return new ol.layer.Tile({
            name: 'stamenToner',
            title: 'B&W map<small> (by <a href="http://maps.stamen.com">Stamen</a>)</small>',
            type: 'base',
            source: new ol.source.Stamen({
                layer: 'toner'
            })
        });
    };
    layers.stamenTonerLite = function () {
        return new ol.layer.Tile({
            name: 'stamenTonerLite',
            title: 'Gray scale map<small> (by <a href="http://maps.stamen.com">Stamen</a>)</small>',
            type: 'base',
            source: new ol.source.Stamen({
                layer: 'toner-lite'
            })
        });
    };
    layers.stamenTonerBackground = function () {
        return new ol.layer.Tile({
            name: 'stamenTonerBackground',
            title: 'B&W background<small> (by <a href="http://maps.stamen.com">Stamen</a>)</small>',
            type: 'base',
            source: new ol.source.Stamen({
                layer: 'toner-background'
            })
        });
    };
    layers.stamenWatercolor = function () {
        return new ol.layer.Tile({
            name: 'stamenWatercolor',
            title: 'Watercolor map<small> (by <a href="http://maps.stamen.com">Stamen</a>)</small>',
            type: 'base',
            source: new ol.source.Stamen({
                layer: 'watercolor'
            })
        });
    };
    // terrain terrain-labels terrain-lines terrain-background
    layers.stamenTerrain = function () {
        return new ol.layer.Tile({
            name: 'stamenTerrain',
            title: 'Terrain USA<small> (by <a href="http://maps.stamen.com">Stamen</a>)</small>',
            type: 'base',
            source: new ol.source.Stamen({
                layer: 'terrain'
            })
        });
    };
    layers.stamenTerrainWithLabels = function () {
        return new ol.layer.Tile({
            name: 'stamenTerrainLabels',
            title: 'Terrain + labels USA<small> (by <a href="http://maps.stamen.com">Stamen</a>)</small>',
            type: 'base',
            source: new ol.source.Stamen({
                layer: 'terrain-labels'
            })
        });
    };
    layers.customBaseLayer = function () {
        return new ol.layer.Tile({
            name: 'customBaseLayer',
            title: 'Custom',
            type: 'base',
            source: new ol.source.XYZ({
                urls: []
            })
        });
    };
    layers.mapsForFreeRelief = function () {
        return new ol.layer.Tile({
            name: 'mapsForFreeRelief',
            title: 'Relief<small> (by <a href="http://www.maps-for-free.com">maps-for-free.com</a>)</small>',
            type: 'base',
            //maxResolution: 76.43702828517625, //Z11
            source: new ol.source.XYZ({
                urls: ['http://www.maps-for-free.com/layer/relief/z{z}/row{y}/{z}_{x}-{y}.jpg']
            })
        });
    };
    /*
    // Err
    layers.stamenBurningMap = function () {
    return new ol.layer.Tile({
        name: 'stamenBurningMap',
        title: 'Burning map<small> (by <a href="http://maps.stamen.com">Stamen</a>)</small>',
        type: 'base',
        source: new ol.source.Stamen({
            layer: 'burningmap'
        })
    });
    };
    // Err
    layers.stamenMars = function () {
    return new ol.layer.Tile({
        name: 'stamenMars',
        title: 'Mars<small> (by <a href="http://maps.stamen.com">Stamen</a>)</small>',
        type: 'base',
        source: new ol.source.Stamen({
            layer: 'mars'
        })
    });
    };
    // Err
    layers.stamenTreesCabsCrime = function () {
    return new ol.layer.Tile({
        name: 'stamenTreesCabsCrime',
        title: 'Trees Cabs Crime<small> (by <a href="http://maps.stamen.com">Stamen</a>)</small>',
        type: 'base',
        source: new ol.source.Stamen({
            layer: 'trees-cabs-crime'
        })
    });
    };
    */
    // Overlays ____________________________________________________________________________________
    layers.googleBike = function () {
        return new ol.layer.Tile({
            name: 'googleBike',
            title: 'Cycling roads<small> (by <a href="https://www.google.com/maps/">Google</a>)</small>',
            visible: true,
            opacity: 1,
            source: new ol.source.XYZ({
                crossOrigin: 'anonymous',
                url: protocol + '//mts0.google.com/vt/lyrs=h@239000000,bike&hl=en&src=app&x={x}&y={y}&z={z}&s=1'
                //url: protocol + '//mts0.google.com/maps//vt/lyrs=h@239000000,bike&hl=en&src=app&x={x}&y={y}&z={z}&s=1'
            })
        });
    };
    layers.googleHybrid = function () {
        return new ol.layer.Tile({
            name: 'googleHybrid',
            title: 'Roads + labels<small> (by <a href="https://www.google.com/maps/">Google</a>)</small>',
            visible: true,
            opacity: 1,
            source: new ol.source.XYZ({
                crossOrigin: 'anonymous',
                url: protocol + '//mt1.google.com/vt/lyrs=h@239000000&hl=en&x={x}&y={y}&z={z}&s=1'
            })
        });
    };
    layers.mapquestHyb = function () {
        return new ol.layer.Tile({
            name: 'mapquestHyb',
            title: 'City names<small> (by <a href="http://open.mapquest.com">MapQuest</a>)</small>',
            source: new ol.source.MapQuest({
                layer: 'hyb'
            })
        });
    };
    layers.lonviaCycling = function () {
        return new ol.layer.Tile({
            name: 'lonviaCycling',
            title: 'Cycling roads<small> (by <a href="http://www.waymarkedtrails.org">Lonvia</a>)</small>',
            opacity: 0.6,
            source: new ol.source.OSM({
                attributions: [new ol.Attribution({
                    html: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> and contributors <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
                }), ol.source.OSM.ATTRIBUTION],
                crossOrigin: null,
                url: 'http://tile.lonvia.de/cycling/{z}/{x}/{y}.png'
                // urls: [
                //  'http://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png',
                //  'http://tile.lonvia.de/cycling/{z}/{x}/{y}.png',
                //  '../../Datas/Tiles/lonvia_cycling/{z}/{x}/{y}.png'
                // ]
            })
        });
    };
    layers.lonviaHiking = function () {
        return new ol.layer.Tile({
            name: 'lonviaHiking',
            title: 'Hiking paths<small> (by <a href="http://www.waymarkedtrails.org">Lonvia</a>)</small>',
            opacity: 0.6,
            source: new ol.source.OSM({
                attributions: [new ol.Attribution({
                    html: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> and contributors <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
                }), ol.source.OSM.ATTRIBUTION],
                crossOrigin: null,
                url: 'http://tile.lonvia.de/hiking/{z}/{x}/{y}.png'
            })
        });
    };
    layers.stamenTonerHybrid = function () {
        return new ol.layer.Tile({
            name: 'stamenTonerHybrid',
            title: 'B&W roads + labels<small> (by <a href="http://maps.stamen.com">Stamen</a>)</small>',
            source: new ol.source.Stamen({
                layer: 'toner-hybrid'
            })
        });
    };
    layers.stamenTonerLabels = function () {
        return new ol.layer.Tile({
            name: 'stamenTonerLabels',
            title: 'B&W labels<small> (by <a href="http://maps.stamen.com">Stamen</a>)</small>',
            source: new ol.source.Stamen({
                layer: 'toner-labels'
            })
        });
    };
    layers.stamenTonerLines = function () {
        return new ol.layer.Tile({
            name: 'stamenTonerLines',
            title: 'B&W roads<small> (by <a href="http://maps.stamen.com">Stamen</a>)</small>',
            source: new ol.source.Stamen({
                layer: 'toner-lines'
            })
        });
    };
    // https://www.google.com/intl/fr-FR_US/help/terms_maps.html
    layers.mapsForFreeWater = function () {
        return new ol.layer.Tile({
            name: 'mapsForFreeWater',
            title: 'Water<small> (by <a href="http://www.maps-for-free.com">maps-for-free.com</a>)</small>',
            opacity: 0.7,
            source: new ol.source.XYZ({
                url: 'http://www.maps-for-free.com/layer/water/z{z}/row{y}/{z}_{x}-{y}.gif'
            })
        });
    };
    layers.mapsForFreeAdmin = function () {
        return new ol.layer.Tile({
            name: 'mapsForFreeAdmin',
            title: 'Admin<small> (by <a href="http://www.maps-for-free.com">maps-for-free.com</a>)</small>',
            opacity: 0.3,
            source: new ol.source.XYZ({
                url: 'http://www.maps-for-free.com/layer/admin/z{z}/row{y}/{z}_{x}-{y}.gif'
            })
        });
    };
    // http://korona.geog.uni-heidelberg.de/contact.html
    layers.uniHeidelbergAsterh = function () {
        return new ol.layer.Tile({
            name: 'uniHeidelbergAsterh',
            title: 'Hillshade<small> (by <a href="http://korona.geog.uni-heidelberg.de">uni-heidelberg.de</a>)</small>',
            opacity: 1,
            source: new ol.source.XYZ({
                url: 'http://korona.geog.uni-heidelberg.de/tiles/asterh/x={x}&y={y}&z={z}'
            })
        });
    };
    layers.uniHeidelbergAdminb = function () {
        return new ol.layer.Tile({
            name: 'uniHeidelbergAdminb',
            title: 'Admin boundaries<small> (by <a href="http://korona.geog.uni-heidelberg.de">uni-heidelberg.de</a>)</small>',
            opacity: 0.8,
            source: new ol.source.XYZ({
                url: 'http://korona.geog.uni-heidelberg.de/tiles/adminb/x={x}&y={y}&z={z}'
            })
        });
    };
    layers.uniHeidelbergHybrid = function () {
        return new ol.layer.Tile({
            name: 'uniHeidelbergHybrid',
            title: 'Hibrid<small> (by <a href="http://korona.geog.uni-heidelberg.de">uni-heidelberg.de</a>)</small>',
            opacity: 0.8,
            source: new ol.source.XYZ({
                url: 'http://korona.geog.uni-heidelberg.de/tiles/hybrid/x={x}&y={y}&z={z}'
            })
        });
    };

    /**
     *
     */
    var ImageData = function ImageData() {
        console.warm('ImageData function in development');
    };

    /**
     * Generates a shaded relief image given elevation data.  Uses a 3x3
     * neighborhood for determining slope and aspect.
     * @private
     * @param {Array.<ImageData>} inputs Array of input images.
     * @param {Object} data Data added in the "beforeoperations" event.
     * @return {ImageData} Output image.
     */
    var shade = function shade(inputs, data) {
        var elevationImage = inputs[0];
        var width = elevationImage.width;
        var height = elevationImage.height;
        var elevationData = elevationImage.data;
        var shadeData = new Uint8ClampedArray(elevationData.length);
        var dp = data.resolution * 2;
        var maxX = width - 1;
        var maxY = height - 1;
        var pixel = [0, 0, 0, 0];
        var twoPi = 2 * Math.PI;
        var halfPi = Math.PI / 2;
        var sunEl = Math.PI * data.sunEl / 180;
        var sunAz = Math.PI * data.sunAz / 180;
        var cosSunEl = Math.cos(sunEl);
        var sinSunEl = Math.sin(sunEl);
        var pixelX, pixelY, x0, x1, y0, y1, offset, z0, z1, dzdx, dzdy, slope, aspect, cosIncidence, scaled;
        for (pixelY = 0; pixelY <= maxY; ++pixelY) {
            y0 = pixelY === 0 ? 0 : pixelY - 1;
            y1 = pixelY === maxY ? maxY : pixelY + 1;
            for (pixelX = 0; pixelX <= maxX; ++pixelX) {
                x0 = pixelX === 0 ? 0 : pixelX - 1;
                x1 = pixelX === maxX ? maxX : pixelX + 1;
                // determine elevation for (x0, pixelY)
                offset = (pixelY * width + x0) * 4;
                pixel[0] = elevationData[offset];
                pixel[1] = elevationData[offset + 1];
                pixel[2] = elevationData[offset + 2];
                pixel[3] = elevationData[offset + 3];
                z0 = data.vert * (pixel[0] + pixel[1] * 2 + pixel[2] * 3);
                // determine elevation for (x1, pixelY)
                offset = (pixelY * width + x1) * 4;
                pixel[0] = elevationData[offset];
                pixel[1] = elevationData[offset + 1];
                pixel[2] = elevationData[offset + 2];
                pixel[3] = elevationData[offset + 3];
                z1 = data.vert * (pixel[0] + pixel[1] * 2 + pixel[2] * 3);
                dzdx = (z1 - z0) / dp;
                // determine elevation for (pixelX, y0)
                offset = (y0 * width + pixelX) * 4;
                pixel[0] = elevationData[offset];
                pixel[1] = elevationData[offset + 1];
                pixel[2] = elevationData[offset + 2];
                pixel[3] = elevationData[offset + 3];
                z0 = data.vert * (pixel[0] + pixel[1] * 2 + pixel[2] * 3);
                // determine elevation for (pixelX, y1)
                offset = (y1 * width + pixelX) * 4;
                pixel[0] = elevationData[offset];
                pixel[1] = elevationData[offset + 1];
                pixel[2] = elevationData[offset + 2];
                pixel[3] = elevationData[offset + 3];
                z1 = data.vert * (pixel[0] + pixel[1] * 2 + pixel[2] * 3);
                dzdy = (z1 - z0) / dp;
                slope = Math.atan(Math.sqrt(dzdx * dzdx + dzdy * dzdy));
                aspect = Math.atan2(dzdy, -dzdx);
                if (aspect < 0) {
                    aspect = halfPi - aspect;
                } else if (aspect > halfPi) {
                    aspect = twoPi - aspect + halfPi;
                } else {
                    aspect = halfPi - aspect;
                }
                cosIncidence = sinSunEl * Math.cos(slope) + cosSunEl * Math.sin(slope) * Math.cos(sunAz - aspect);
                offset = (pixelY * width + pixelX) * 4;
                scaled = 255 * cosIncidence;
                shadeData[offset] = scaled;
                shadeData[offset + 1] = scaled;
                shadeData[offset + 2] = scaled;
                shadeData[offset + 3] = elevationData[offset + 3];
            }
        }
        return new ImageData(shadeData, width, height);
    };

    layers.mapboxShadedRelief = function () {
        return new ol.layer.Image({
            name: 'mapboxShadedRelief',
            title: 'Shaded relief<small> (by <a href="http://www.mapbox.com">Mapbox</a>)</small>',
            source: new ol.source.Raster({
                sources: [new ol.source.XYZ({
                    url: 'https://{a-d}.tiles.mapbox.com/v3/aj.sf-dem/{z}/{x}/{y}.png',
                    crossOrigin: 'anonymous'
                })],
                operationType: 'image',
                operation: shade
            }),
            opacity: 0.3
        });
    };
    // See http://openlayers.org/en/v3.4.0/examples/kml-timezones.html
    layers.timeZones = function () {
        return new ol.layer.Vector({
            name: 'timeZones',
            title: 'Time zones',
            style: timezonesStyle,
            minResolution: 4891,
            source: new ol.source.Vector({
                extractStyles: false,
                projection: 'EPSG:3857',
                url: 'data/kml/timezones.kml',
                format: new ol.format.KML()
            })
            //source: new ol.source.Vector({
            //    url: 'data/kml/timezones.kml',
            //    format: new ol.format.KML({
            //        extractStyles: false
            //    })
            //})
        });
    };
    layers.gpxFile = function () {
        return new ol.layer.Vector({
            name: 'gpxFile',
            title: 'GPS tracks',
            visible: false,
            source: new ol.source.Vector({
                url: '',
                format: new ol.format.GPX()
            }),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#33ff00',
                    width: 5
                })
            })
        });
    };

    layers.drawingVector = function () {
        return new ol.layer.Tile({
            name: 'drawing',
            title: 'My drawings'
            // ,
            //    source: new ol.source.MapQuest({layer: 'sat'})
        });
    };
    layers.customOverlay = function () {
        return new ol.layer.Tile({
            name: 'customOverlay',
            title: 'Custom',
            source: new ol.source.XYZ({
                urls: []
            })
        });
    };
    /*
    layers.toolserverHillShading = function () {
    return new ol.layer.Tile({
        name: 'toolserverHillShading',
        title: 'Toolserver hill shading',
        minZoom: 2,
        maxZoom: 15,
        source: new ol.source.XYZ({
            // crossOrigin: null,
            urls: [
                // 'http://toolserver.org/~cmarqu/hill/{z}/{x}/{y}.png',
                'http://a.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png',
                'http://b.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png',
                'http://c.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png'
            ]
        })
    });
    };
    */
    //layers.grid = function () {
    //return new ol.layer.Tile({
    //  name: 'gridLayer',
    //  title: 'Country data',
    //  style: 'Grid',
    //  // visible: false,
    //  source: sources.grid
    //});
    //};
    // if (map && map.getView()) {
    //    map.addLayer(scoresLayer);
    // } else {
    //    userOverlays.push(scoresLayer);
    // }

    // _____________________________________________________________________________________________

    /**
     * Update layer source url from a file input
     * <input id="gpx_file" type="file" accept=".gpx" />
     * @see {@link http://www.html5rocks.com/en/tutorials/file/dndfiles/}
     * @public
     * @param {string} selector - File input ID
     * @param {Object} layer - OL3 vector layer
     */
    /*
    var GPXFileSource = function (selector, layer) {
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            $(selector).addClass('disabled');
            console.warn('The File APIs are not fully supported by your browser.');
            return false;
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
                + formatBytes(f.size)
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
    */

    // Set default properties
    /*$.each(layers, function (i, layer) {
        layer().setProperties(defaultProperties);
    });*/
    /*
    // Translate layer and group titles once i18next plugin initialized
    $.when(deferred.init.i18next).done(function () {
        roadBaselayers.setProperties({
            title: $.t('sections:roadLayers.title')
        });
        reliefBaselayers.setProperties({
            title: $.t('sections:roadWithReliefLayers.title')
        });
        aerialBaselayers.setProperties({
            title: $.t('sections:satelliteLayers.title')
        });
        baselayers.setProperties({
            title: $.t('sections:baseLayer.title')
        });
        roadOverlays.setProperties({
            title: $.t('sections:roadLayers.title')
        });
        informationOverlays.setProperties({
            title: $.t('sections:infoLayers.title')
        });
        //terrainOverlays.setProperties({
        //    title: $.t('sections:reliefLayers.title')
        //});
        userOverlays.setProperties({
            title: $.t('sections:myLayers.title')
        });
        overlays.setProperties({
            title: $.t('sections:layers.title')
        });
        informationOverlays.setProperties({
            title: $.t('sections:infoLayers.title')
        });
        console.log('Map layers translated');
    });
    */

    return {
        create: create,
        loadFileFeatures: loadFileFeatures,
        initSettingsForm: initSettingsForm,
        selectedLayer: selectedLayer,
        settings: settings,
        treatLayers: treatLayers,
        updateSourceUrl: updateSourceUrl
    };
}();
//# sourceMappingURL=mapLayersModule.js.map
