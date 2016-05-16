/*eslint-env browser, jquery */
/*global console, $, ol */
/**
 * OL3 layers module.
 * @module
 * @external $
 * @external ol
 * @return {Object} Public functions / variables
 */
/*eslint-disable no-unused-vars*/
var mapLayersModule = (function () {
    /*eslint-enable no-unused-vars*/
    'use strict';

    var settings = {
        bingMapsKey: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
        properties: {
            visible: false,
            preload: 'Infinity'
        }
    };

    var protocol = (window.location.protocol === 'https:') ? 'https:' : 'http:';

    var layers = {};



    /**
     * Create a new layer using predefined settings
     * @public
     * @param {string} name - Predefined layer (variable name)
     * @param {Object} [properties] - Layer custom parameters
     * @return {Object} OL3 layer
     */
    var create = function (name, properties) {
        if (!layers[name]) {
            console.warn(name + ' layer definition is not defined');
            return false;
        }
        var layer = layers[name]();
        layer.setProperties(settings.properties);
        if (properties) {
            layer.setProperties(properties);
        }
        return layer;
    };



    /**
     * Apply a function on (nested) layers
     * @public
     * @param {Object} layer - Map object or layer group
     * @param {function} fn - Function with layer as parameter, to apply to each layer
     */
    var treatLayers = function (layer, fn) {

        $.each(layers, function (i, l) {
            if (l.getLayers()) {
                treatLayers(l, fn);
            } else {
                fn(l);
            }
        });

    };



    /**
     * Update layer source url from input value
     * @public
     * @param {Object} layer - OL3 layer
     * @param {String} selector - Input id
     */
    var inputLayerSource = function (layer, selector) {
        var $el = $(selector);
        if ($el && layer) {

            var url = $.trim($el.val());
            if (url) {
                layer.setProperties({
                    source: new ol.source.OSM({
                        url: url
                    })
                });
            }

            $el.on('change', function () {
                url = $.trim($el.val());
                if (url) {
                    layer.setProperties({
                        visible: true,
                        source: new ol.source.OSM({
                            url: url
                        })
                    });
                } else {
                    layer.setProperties({
                        visible: false
                    });
                }
            });

        }
    };


    // Styles ______________________________________________________________________________________
    /**
     * Timezones layer style
     * @see http://openlayers.org/en/v3.4.0/examples/kml-timezones.html
     * @private
     */
    var timezonesStyle = function (feature) { // feature, resolution
        var offset = 0;
        var name = feature.get('name'); // e.g. GMT -08:30
        var match = name.match(/([\-+]\d{2}):(\d{2})$/);
        if (match) {
            var hours = parseInt(match[1], 10);
            var minutes = parseInt(match[2], 10);
            offset = 60 * hours + minutes;
        }
        var date = new Date();
        var local = new Date(date.getTime() +
            (date.getTimezoneOffset() + offset) * 60000);
        // offset from local noon (in hours)
        var delta = Math.abs(12 - local.getHours() + (local.getMinutes() / 60));
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
                urls: [
                    protocol + '//a.tile.openstreetmap.org/{z}/{x}/{y}.png'
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
                attributions: [
                    new ol.Attribution({
                        html: 'All maps &copy; ' +
                                '<a href="http://www.openseamap.org/">OpenSeaMap</a>'
                    }),
                    ol.source.OSM.ATTRIBUTION
                ],
                crossOrigin: null,
                urls: [
                    'http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
                    'http://t1.openseamap.org/seamark/{z}/{x}/{y}.png'
                ]
            })
        });
    };
    layers.openStreetMapHumanitarian = function () {
        return new ol.layer.Tile({
            name: 'openStreetMapHumanitarian',
            title: 'Humanitarian <small>(by <a href="https://www.openstreetmap.org">OpenStreetMap</a>)</small>',
            type: 'base',
            source: new ol.source.OSM({
                attributions: [
                    new ol.Attribution({
                        html: 'All maps &copy; ' +
                                '<a href="http://www.openstreetmap.fr/">OpenStreetMap</a>'
                    }),
                    ol.source.OSM.ATTRIBUTION
                ],
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
                attributions: [
                    new ol.Attribution({
                        html: 'All maps &copy; ' +
                                '<a href="http://www.opencyclemap.org/">OpenCycleMap</a>'
                    }),
                    ol.source.OSM.ATTRIBUTION
                ],
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
                attributions: [
                    new ol.Attribution({
                        html: 'All maps &copy; ' +
                                '<a href="http://www.thunderforest.com/">ThunderForest</a>'
                    }),
                    ol.source.OSM.ATTRIBUTION
                ],
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
                attributions: [
                    new ol.Attribution({
                        html: 'All maps &copy; ' +
                                '<a href="http://www.thunderforest.com/">ThunderForest</a>'
                    }),
                    ol.source.OSM.ATTRIBUTION
                ],
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
                attributions: [
                    new ol.Attribution({
                        html: 'All maps &copy; ' +
                                '<a href="http://www.thunderforest.com/">ThunderForest</a>'
                    }),
                    ol.source.OSM.ATTRIBUTION
                ],
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
                attributions: [
                    new ol.Attribution({
                        html: 'All maps &copy; ' +
                                '<a href="http://www.thunderforest.com/">ThunderForest</a>'
                    }),
                    ol.source.OSM.ATTRIBUTION
                ],
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
                attributions: [
                    new ol.Attribution({
                        html: 'Tiles &copy; <a href="https://services.arcgisonline.com/ArcGIS/' +
                                'rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
                    })
                ],
                url: protocol + '//server.arcgisonline.com/ArcGIS/rest/services/' +
                        'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
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
            type: 'base'/*,
            source: new ol.source.OSM({
                url: ''
            })*/
        });
    };
    layers.mapsForFreeRelief = function () {
        return new ol.layer.Tile({
            name: 'mapsForFreeRelief',
            title: 'Relief<small> (by <a href="http://www.maps-for-free.com">maps-for-free.com</a>)</small>',
            type: 'base',
            maxZoom: 11,
            source: new ol.source.XYZ({
                urls: [
                    'http://www.maps-for-free.com/layer/relief/z{z}/row{y}/{z}_{x}-{y}.jpg'
                ]
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
                attributions: [
                    new ol.Attribution({
                        html: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> and contributors <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
                    }),
                    ol.source.OSM.ATTRIBUTION
                ],
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
                attributions: [
                    new ol.Attribution({
                        html: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> and contributors <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
                    }),
                    ol.source.OSM.ATTRIBUTION
                ],
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

    /**
     *
     */
    var ImageData = function () {
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
    var shade = function (inputs, data) {
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
      var pixelX, pixelY, x0, x1, y0, y1, offset,
          z0, z1, dzdx, dzdy, slope, aspect, cosIncidence, scaled;
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
          cosIncidence = sinSunEl * Math.cos(slope) +
              cosSunEl * Math.sin(slope) * Math.cos(sunAz - aspect);
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
                sources: [
                    new ol.source.XYZ({
                        url: 'https://{a-d}.tiles.mapbox.com/v3/aj.sf-dem/{z}/{x}/{y}.png',
                        crossOrigin: 'anonymous'
                    })
                ],
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
            }),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(50, 255, 0, 0.6)',
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
            title: 'Custom'/*,
            source: new ol.source.OSM({
                url: ''
            })*/
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
        inputLayerSource: inputLayerSource,
        treatLayers: treatLayers
    };

})();
