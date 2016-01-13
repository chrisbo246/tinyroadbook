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
//jslint browser: true
//global console, $, ol

/**
 * OL3 layers module.
 * @external jQuery
 * @external OL3
 * @module
 * @returns {Object} Public functions and variables
 */
var mapLayersModule = (function () {
    'use strict';

    var layers = {};

    var settings = {
        bingMapsKey: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
        properties: {
            visible: false,
            preload: 'Infinity'
        }
    };


    /**
     * Change default configuration
     * @public
     * @param {Object} customSettings - Custom settings
     */
    var config = function (customSettings) {

        $.extent(settings, customSettings);

    };



    /**
     * Create a new layer using predefined settings
     * @public
     * @param {string} name - Predefined layer (variable name)
     * @param {Object} [properties] - Layer custom parameters
     * @returns {Object} OL3 layer
     */
    var create = function (name, properties) {

        if (!layers[name]) {
            console.warn(name + ' layer definition is not defined');
            return;
        }

        var layer = layers[name]();

        layer.setProperties(settings.properties);

        if (properties) {
            layer.setProperties(properties);
        }

        return layer;

    };



    // Base layers _________________________________________________________________________________

    layers.openStreetMap = function () {
        return new ol.layer.Tile({
            name: 'openStreetMap',
            title: 'Road Map<small> (by OpenStreetMap)</small>', // (offline)
            visible: true,
            type: 'base',
            source: new ol.source.OSM({
                // crossOrigin: null,
                urls: [
                    'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    //'../../Datas/Tiles/osm_mapnik/{z}/{x}/{y}.png'
                ]
            })
        });
    };

    layers.openSeaMap = function () {
        return new ol.layer.Tile({
            name: 'openSeaMap',
            title: 'Shipping lanes<small> (by OpenSeaMap)</small>',
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
            title: 'Humanitarian <small>(OpenStreetMap)</small>',
            type: 'base',
            source: new ol.source.OSM({
                attributions: [
                    new ol.Attribution({
                        html: 'All maps &copy; ' +
                                '<a href="http://www.openstreetmap.fr/">OpenStreetMap</a>'
                    }),
                    ol.source.OSM.ATTRIBUTION
                ],
                url: 'http://tile-{a-c}.openstreetmap.fr/hot/{z}/{x}/{y}.png'
            })
        });
    };

    layers.mapquestOSM = function () {
        return new ol.layer.Tile({
            name: 'mapquestOSM',
            title: 'Road map<small> (by MapQuest)</small>',
            type: 'base',
            source: new ol.source.MapQuest({
                layer: 'osm'
            })
        });
    };

    layers.mapquestSat = function () {
        return new ol.layer.Tile({
            name: 'mapquestSat',
            title: 'Aerial view<small> (by MapQuest)</small>',
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
            title: 'Cycling roads<small> (OpenCycleMap)</small>',
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
            title: 'Transports<small> (ThunderForest)</small>',
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
            title: 'Transport dark<small> (ThunderForest)</small>',
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
            title: 'Landscape<small> (ThunderForest)</small>',
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
            title: 'Outdoor activities<small> (ThunderForest)</small>',
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
            title: 'Terrain<small> (by ArcGIS)</small>',
            type: 'base',
            source: new ol.source.XYZ({
                crossOrigin: 'anonymous', // Important
                attributions: [
                    new ol.Attribution({
                        html: 'Tiles &copy; <a href="http://services.arcgisonline.com/ArcGIS/' +
                                'rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
                    })
                ],
                url: 'http://server.arcgisonline.com/ArcGIS/rest/services/' +
                        'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'

            })
        });
    };

    layers.arcgisRestHighwayUSA = function () {
        return new ol.layer.Tile({
            name: 'arcgisRestHighwayUSA',
            title: 'Highway USA<small> (by ArcGIS)</small>',
            type: 'base',
            extent: [-13884991, 2870341, -7455066, 6338219],
            source: new ol.source.TileArcGISRest({
                url: 'http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/' + 'ESRI_StateCityHighway_USA/MapServer'
            })
        });
    };

    layers.googleTerrain = function () {
        return new ol.layer.Tile({
            name: 'googleTerrain',
            title: 'Terrain + labels<small> (by Google)</small>',
            type: 'base',
            source: new ol.source.XYZ({
                crossOrigin: 'anonymous', // Important
                url: 'http://mts0.google.com/vt/lyrs=t@132,r@285000000&hl=en&src=app&x={x}&y={y}&z={z}&s=1'
            })
        });
    };

    layers.googleSatellite = function () {
        return new ol.layer.Tile({
            name: 'googleSatellite',
            title: 'Aerial view<small> (by Google)</small>',
            type: 'base',
            source: new ol.source.XYZ({
                crossOrigin: 'anonymous', // Important
                //resolutions: [9784, 2446, 1223, 76.44, 9.55, 2.39],
                url: 'http://khms0.google.com/kh/v=165&src=app&x={x}&y={y}&z={z}&s=1'
            })
        });
    };

    layers.bingRoad = function () {
        return new ol.layer.Tile({
            name: 'bingRoad',
            title: 'Road map<small> (by Bing)</small>',
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
            title: 'Aerial view<small> (by Bing)</small>',
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
            title: 'Aerial view with labels<small> (by Bing)</small>',
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
            title: 'CollinsBart<small> (by Bing)</small>',
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
            title: 'OrdnanceSurvey<small> (by Bing)</small>',
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
            title: 'B&W map<small> (by Stamen)</small>',
            type: 'base',
            source: new ol.source.Stamen({
                layer: 'toner'
            })
        });
    };

    layers.stamenTonerLite = function () {
        return new ol.layer.Tile({
            name: 'stamenTonerLite',
            title: 'Gray scale map<small> (by Stamen)</small>',
            type: 'base',
            source: new ol.source.Stamen({
                layer: 'toner-lite'
            })
        });
    };

    layers.stamenTonerBackground = function () {
        return new ol.layer.Tile({
            name: 'stamenTonerBackground',
            title: 'B&W background<small> (by Stamen)</small>',
            type: 'base',
            source: new ol.source.Stamen({
                layer: 'toner-background'
            })
        });
    };

    layers.stamenWatercolor = function () {
        return new ol.layer.Tile({
            name: 'stamenWatercolor',
            title: 'Watercolor map<small> (by Stamen)</small>',
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
            title: 'Terrain USA<small> (by Stamen)</small>',
            type: 'base',
            source: new ol.source.Stamen({
                layer: 'terrain'
            })
        });
    };

    layers.stamenTerrainWithLabels = function () {
        return new ol.layer.Tile({
            name: 'stamenTerrainLabels',
            title: 'Terrain + labels USA<small> (by Stamen)</small>',
            type: 'base',
            source: new ol.source.Stamen({
                layer: 'terrain-labels'
            })
        });
    };

    /*
    // Err
    layers.stamenBurningMap = function () {
    return new ol.layer.Tile({
        name: 'stamenBurningMap',
        title: 'Burning map<small> (by Stamen)</small>',
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
        title: 'Mars<small> (by Stamen)</small>',
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
        title: 'Trees Cabs Crime<small> (by Stamen)</small>',
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
            title: 'Cycling roads<small> (by Google)</small>',
            visible: true,
            opacity: 1,
            source: new ol.source.XYZ({
                //attributions: [
                //  new ol.Attribution({
                //    html: 'Map data &copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> and contributors <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
                //  }),
                //  ol.source.OSM.ATTRIBUTION
                //],
                crossOrigin: 'anonymous',
                url: 'http://mts0.google.com/vt/lyrs=h@239000000,bike&hl=en&src=app&x={x}&y={y}&z={z}&s=1'
            })
        });
    };

    layers.mapquestHyb = function () {
        return new ol.layer.Tile({
            name: 'mapquestHyb',
            title: 'City names<small> (by MapQuest)</small>',
            source: new ol.source.MapQuest({
                layer: 'hyb'
            })
        });
    };

    layers.lonviaCycling = function () {
        return new ol.layer.Tile({
            name: 'lonviaCycling',
            title: 'Cycling roads<small> (by Lonvia)</small>',
            opacity: 0.7,
            source: new ol.source.OSM({
                attributions: [
                    new ol.Attribution({
                        html: 'Map data &copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> and contributors <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
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
            title: 'Hiking paths<small> (by Lonvia)</small>',
            opacity: 0.7,
            source: new ol.source.OSM({
                attributions: [
                    new ol.Attribution({
                        html: 'Map data &copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> and contributors <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
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
            title: 'B&W roads + labels<small> (by Stamen)</small>',
            source: new ol.source.Stamen({
                layer: 'toner-hybrid'
            })
        });
    };

    layers.stamenTonerLabels = function () {
        return new ol.layer.Tile({
            name: 'stamenTonerLabels',
            title: 'B&W labels<small> (by Stamen)</small>',
            source: new ol.source.Stamen({
                layer: 'toner-labels'
            })
        });
    };

    layers.stamenTonerLines = function () {
        return new ol.layer.Tile({
            name: 'stamenTonerLines',
            title: 'B&W roads<small> (by Stamen)</small>',
            source: new ol.source.Stamen({
                layer: 'toner-lines'
            })
        });
    };

    layers.mapboxShadedRelief = function () {
        return new ol.layer.Image({
            name: 'mapboxShadedRelief',
            title: 'Shaded relief<small> (by Mapbox)</small>',
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
            style: _timezonesStyle,
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

    layers.drawingVector = function () {
        return new ol.layer.Tile({
            name: 'drawing',
            title: 'My drawings'
            // ,
            //    source: new ol.source.MapQuest({layer: 'sat'})
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



    // Styles ______________________________________________________________________________________

    /**
     * Timezones layer style
     * See http://openlayers.org/en/v3.4.0/examples/kml-timezones.html
     */

    var _timezonesStyle = function (feature) { // feature, resolution
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

    // _____________________________________________________________________________________________

    /**
     * Generates a shaded relief image given elevation data.  Uses a 3x3
     * neighborhood for determining slope and aspect.
     * @param {Array.<ImageData>} inputs Array of input images.
     * @param {Object} data Data added in the "beforeoperations" event.
     * @return {ImageData} Output image.
     */
    function shade(inputs, data) {
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
    }

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
        config: config
    };

})();
//jslint browser: true
//global window, console, $, ol, swal, Quill, geocodeModule

/**
 * OL3 controls module.
 * @external jQuery
 * @external OL3
 * @external Quill
 * @external geocodeModule
 * @module
 * @returns {Object} Public functions and variables
 */
var mapControlsModule = (function () {
    'use strict';

    var controls = {};

    var settings = {

    };



    /**
     * Change default settings
     * @public
     * @param {object} customSettings - Custom settings
     */
    var config = function (customSettings) {

        $.extent(settings, customSettings || {});

    };



    /**
     * Create a new control using predefined settings
     * @public
     * @param {string} name - Predefined control
     * @returns {Object} - OL3 control
     */
    var create = function (name, properties) {

        if (!controls[name]) {
            console.warn(name + ' control definition is not defined');
            return;
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
            collapseLabel: '\u00AB',
            label: '\u00BB',
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
        create: create,
        config: config
    };

})();
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
                layer.set('visible', (layer.get('name') === name));
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
//jslint browser: true
//global document, ol

/**
 * OL3 draw module.
 * @external OL3
 * @module
 * @returns {Object} Public functions and variables
 */
var mapDrawModule = (function () {
    'use strict';

    var draw;

    var features = new ol.Collection();



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


    
    return {
        init: init,
        drawInteraction: drawInteraction,
        addDrawTypeSwitcher: addDrawTypeSwitcher
    };

})();
//jslint browser: true
//global window, console, $, ol, swal, Quill, geocodeModule

/**
 * City picker module.
 * @external jQuery
 * @external OL3
 * @external swal
 * @external Quill
 * @external geocodeModule
 * @module
 * @returns {Object} Public functions and variables
 */
var cityPickerModule = (function () {
    'use strict';

    var editor;

    var settings = {
        quill: {
            //readOnly: false,
            //theme: 'snow',
            styles: false,
            formats: ['bold', 'italic', 'strike', 'underline',
                    'font', 'size', 'align', 'color', 'background'] //'bullet', 'list', 'image', 'link'
        }
    };

    

    /**
     * Convert a number to a name according to the range of values
     * @param {number} number - The number to convert
     * @param {number} min - The minimal value the number can have
     * @param {number} min - The minimal value the number can have
     * @param {array} values - Possible returned values sorted from the smallest to the biggest
     * @param {integer} index - Default value (array index starting from 0)
     * @returns {string} One of the possible values
     */
    var numberToName = function (number, min, max, values, index) {
        //if (!$.isNumeric(number)) return values[index];

        // Define the default value with the medium value if empty
        index = index || Math.ceil(values.length / 2);
        // Make sure the number is in the min-max range
        number = Math.min(Math.max(number, min), max);

        var step = (max - min) / values.length;
        var i = (number - min) / step;
        i = i.toFixed(0);
        var name = values[i] || values[index];
        console.log('numberToFontSize(' + number + ', ' + min + ', ' + max + ') step:' + step + ' i:' + i + ' name:' + name);
        return name;
    };



    /**
     * Convert a number to a valid font size-name
     * @param {number} number - Value to convert
     * @param {number} min - The smallest value accepted
     * @param {number} max - The biggest value accepted
     * @returns {string} A valid font size-name from xx-small to xx-large
     */
    var _numberToFontSizeName = function (number, min, max) {
        var array = ['xx-small', 'x-small', 'smaller', 'small', 'normal',
                'large', 'larger', 'x-large', 'xx-large'];
        return numberToName(number, min, max, array, 4);
    };


    /**
     * Convert a number to a valid color name
     * @param {number} number - Value to convert
     * @param {number} min - The smallest value accepted
     * @param {number} max - The biggest value accepted
     * @returns {string} A valid color name
     */
    var _numberToColorName = function (number, min, max) {
        var array = ['lightgray', 'gray', 'black']; // 'whitesmock', 'silver',
        return numberToName(number, min, max, array, 1);
    };



    /**
     * Prepare cursor for insertion
     * - Delete selected text
     * - Move to the end if position cannot be found
     * - Set position to 0 if editor is empty (pos 1)
     * @returns {integer} Cursor position
     */
    var _posBeforeInsert = function () {

        var pos;
        var length = editor.getLength();
        // Focus editor prior to get selection
        if (length > 1) {
            editor.focus();
        }
        var range = editor.getSelection();

        if (range) {
            pos = range.start; //+ 1
            if (range.start !== range.end) {
                editor.deleteText(range.start, range.end);
            }
            console.log('Cursor ready for insertion at pos ' + pos);
        } else {
            pos = length - 1;
            console.log('Cursor is ready for insertion at the last pos ' + pos);
        }
        //if (pos === 1) pos = 0;

        return pos;

    };



    /**
     * Add city name to the editor
     * @param {Object} json - The JSON object returned by Nominatim
     */
    var _insertCity = function (json) {

        var size,
            color,
            names = [],
            types = ['country', 'state', 'county',
                    'city', 'town', 'village', 'hamlet']; //'state_district', 'city_district',
        //var smallestAreaType = $('#smallest_area_type').val() || 'village';

        if (!json) {
            return;
        }

        if (json.address) {
            var name;
            types.forEach(function (value) {
                if (json.address[value]) {
                    name = json.address[value];
                    //console.log(value + '/' + smallestAreaType);
                    //if (value === smallestAreaType) {
                    //    return false;
                    //}
                }
            });
            names.push(name);
        }

        if (json.extratags) {
            // Define font size depending on population
            if (json.extratags.population && $('#font_size_proportional').is(':checked')) {
                //var size = (Math.log(json.extratags.population) / 15 + 0.4).toFixed(2) + 'em';
                size = _numberToFontSizeName(Math.log(json.extratags.population) || 0, 0, Math.log(25000000));
            }
            if (json.extratags.population && $('#font_color_proportional').is(':checked')) {
                //var val = (255 - Math.log(json.extratags.population) * 15).toFixed(0);
                //var color = 'rgb(' + val + ', ' + val + ', ' + val + ')';
                color = _numberToColorName(Math.log(json.extratags.population) || 0, 0, Math.log(25000000));
            }
        }

        if (json.namedetails) {
            // Add also the local language name
            if ($('#insert_local_name').is(':checked') && json.namedetails.name) {
                names.push(json.namedetails.name);
            }
        }

        // Insert text
        if (names.length > 0) {
            var pos = _posBeforeInsert();
            var text;

            // Insert icon
            if (json.icon && $('#insert_icon') && $('#insert_icon').is(':checked')) {
                text = json.icon;
                console.log('pos:' + pos + ' text:' + text);
                editor.insertEmbed(pos, 'image', text);
                pos = pos + 1;//text.length;
                //console.log('Cursor positioned at pos:' + pos + '/' + editor.getLength() - 1);
            }

            // Insert city name
            text = $.unique(names).join(' / ');
            editor.insertText(pos, text, {
                'size': size || '1em',
                'color': color || 'black'
            });
            pos = pos + text.length;
            //console.log('Cursor positioned at pos:' + pos + '/' + editor.getLength() - 1);

            // Insert a separator
            var $separator = $('#separator');
            text = ($separator) ? $separator.val() : '\n';
            editor.insertText(pos, text);
            pos = pos + text.length;
            //console.log('Cursor positioned at pos:' + pos + '/' + editor.getLength() - 1);

            // Move cursor after insertions
            editor.setSelection(pos, pos);

            console.log('Cursor positioned at pos:' + pos + '/' + editor.getLength() - 1);


        } else {
            console.log('Extracted data does not contain a city name.');
        }



    };



    /**
     * Use reverse geocode to define the name of the city at a given position
     * @param {object} json - The JSON object returned by Nominatim reverse geocode
     */
    var _getCityDetails = function (json) {

        if (!json || !json.address) {
            return;
        }

        var params = {
            format: 'json',
            limit: 1,
            polygon_svg: 0,
            addressdetails: 1,
            extratags: 1,
            namedetails: 1
            //'accept-language': 'en'
        };

        // Build query
        var query = [];
        // , 'city_district', 'state_district'
        ['village', 'town', 'city', 'county', 'state', 'country'].forEach(function (value) {
            if (json.address[value]) {
                query.push(json.address[value]);
                //console.log(json.address[value]);
                return false;
            }
        });

        // Build params
        $.each({city: 'city', county: 'county', state: 'state', country: 'country',
                'postal_code': 'postalcode', 'country_code': 'countrycodes'}, function (key, value) {
            if (json.address[key]) {
                params[value] = json.address[key];
            }
        });

        geocodeModule.nominatimSearch(params, query).success(function (json) {
            console.log(JSON.stringify(json));
            _insertCity(json[0]);
        });

    };



    /**
     * Use reverse geocode to define the name of the city at a given position
     * @param {object} position - Longitude, latitude at EPSG:4326 projection
     * @param {integer} zoom - Zoom level used for extraction
     */
    var _getCity = function (position, zoom) {

        if (!position || !zoom) {
            return false;
        }

        //console.log('Zoom: ' + zoom);
        zoom = Math.min(Math.max((zoom || 10), 0), 18);
        //console.log('Extraction level: ' + zoom);

        var params = {
            format: 'json',
            lon: position[0],
            lat: position[1],
            zoom: zoom, //$('#zoom_level_extraction').val() || 10
            osm_type: 'N',
            addressdetails: 1,
            extratags: 0,
            namedetails: 0,
            'accept-language': 'en'
        };

        geocodeModule.nominatimReverse(params).success(function (json) {
            //console.log(JSON.stringify(json));

            setTimeout(function () {
                _getCityDetails(json);
            }, 1000);
            /*
            if ($('#font_color_proportional, #font_size_proportional, #insert_local_name, #insert_icon').is(':checked')) {
                // Wait 1s to respect the Nominatim policy
                // and make a seconde request to get more details
                setTimeout(function () {
                    _getCityDetails(json);
                }, 1000);
            } else {
                // Else insert the city name in editor
                _insertCity(json);
            }
            */

        });

    };


    /**
     * Print editor content
     * @param {Object} data - Formated text
     */
    var _print = function (data) {

        console.log(data);

        console.log($('#export_direction').val());
        var $el = $('#export_direction');
        if ($el && $el.val() === 'inline') {
            data = data.replace(/<div>/g, ', ');
            console.log(data);
        }

        var printWin = window.open('', window.location.hostname, ''); //height=600,width=800
        printWin.document.write('<html>'
                + '<head><title>' + window.location.hostname + '</title></head>'
                + '<body>' + data + '</body></html>');
        printWin.print();
        printWin.close();

        return true;
    };



    /**
     * Start listening clicks on the map
     * @public
     * @param {Object} map - OL3 map
     */
    var setMap = function (map) {

        map.on('click', function (evt) {

            var view = map.getView();
            var zoom = view.getZoom();
            var position = evt.coordinate;
            var projection = view.getProjection();

            position = ol.proj.transform(position, projection.getCode(), 'EPSG:4326');
            console.time('Reverse geocoding');
            _getCity(position, zoom);
            console.timeEnd('Reverse geocoding');

        });

    };



    /**
     * Toggle buttons visibility when editor is empty or not
     */
    var _toggleButtonStatusEmptyEditor = function () {

        var $buttons = $('#copy_editor, #print_editor, #erase_editor');
        if (editor.getLength() === 1) {
            $buttons
                .attr('disabled', true)
                .closest('li').addClass('disabled');
            //$('#get_started_alert').fadeIn();
        } else {
            $buttons
                .attr('disabled', false)
                .closest('li').removeClass('disabled');
            //$('#get_started_alert').fadeOut();
        }

    };



    $(document).ready(function () {

        var $editor = $('#editor');

        editor = new Quill('#editor', settings.quill);
        editor.addModule('toolbar', {
            container: '#editor_toolbar'
        });
        var qlMultiCursorModule = editor.addModule('multi-cursor', {
            timeout: 10000
        });

        editor.on('selection-change', function (range) {

            var $buttons = $('#editor_toolbar').find('.ql-bold, .ql-italic, .ql-strike, .ql-underline, .ql-size, .ql-color, .ql-background'); // .ql-font .ql-align .ql-bullet .ql-list .ql-image .ql-link
            
            if (range) {
                if (range.start === range.end) {
                    qlMultiCursorModule.setCursor('selectionStart', range.start, 'Insertion point', '#337ab7');
                    $buttons.attr('disabled', true).closest('li').addClass('disabled');
                    console.log('Cursor is on', range.start);
                } else {
                    //var text = editor.getText(range.start, range.end);
                    $buttons.attr('disabled', false).closest('li').removeClass('disabled');
                    //console.log('User has highlighted', text);
                }
            } else {
                console.log('Cursor not in the editor');
            }
        });

        editor.on('text-change', function (delta, source) {

            // Copy editor content to hidden textarea (for garlic autosave)
            $('#stored_roadbook').val(editor.getHTML()).trigger('change');

            _toggleButtonStatusEmptyEditor();

            // Auto-scroll the textarea to keep the last city visible
            $editor.scrollTop($editor[0].scrollHeight);

        });

        // Populate editor with hidden textarea data
        // once garlic has restored this field
        // then move the cursor to the end
        $('#stored_roadbook').garlic({
            excluded: '',
            onRetrieve: function (elem, retrievedValue) {
                editor.setHTML(retrievedValue);
                //var pos = editor.getLength() - 1;
                //editor.setSelection(pos, pos);
                //console.log('Cursor moved to position ' + pos);
            }
        });

        _toggleButtonStatusEmptyEditor();

        // Print button
        $('#print_editor').click(function (e) {
            e.preventDefault();
            _print(editor.getHTML());
        });

        // Erase button
        $('#erase_editor').click(function (e) {
            e.preventDefault();

            swal({
                title: 'Are you sure?',
                text: 'Your roadbook will be permanently deleted. You will not be able to recover it.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes delete it',
                cancelButtonText: 'No stop !',
                closeOnConfirm: false,
                closeOnCancel: false
            }, function (isConfirm) {
                if (isConfirm) {
                    editor.setText('');
                    swal({
                        title: 'Deleted!',
                        text: 'Your roadbook has been deleted. Let\'s start a new one!',
                        type: 'success',
                        timer: 2500,
                        showConfirmButton: false
                    });
                } else {
                    swal({
                        title: 'Cancelled',
                        text: 'Whew... you narrow escape! ^_^',
                        type: 'error',
                        timer: 2500,
                        showConfirmButton: false
                    });
                }
            });

        });

        // Copy to clipboard button
        /*
        var client = new ZeroClipboard(document.getElementById('copy_editor'));//editor
        client.on('ready', function (readyEvent) {
            console.log('ZeroClipboard ready');
        });
        client.on('copy', function (event) {
            event.clipboardData.setData('text/plain', event.relatedTarget.innerHTML
                //.replace(/[<&>'"]/g, function (c) {
                //    return "&#" + c.charCodeAt() + ";";
                //})
            );
            client.on('aftercopy', function (event) {
                swal({title: 'Good job!', text: 'Your roadbook has been copied to the clipboard.', type: 'success', timer: 2500, showConfirmButton: true});
            });
        });
        client.on('error', function (event) {
            swal({title: 'Oups!', text: 'ZeroClipboard error of type "' + event.name + '": ' + event.message, type: 'warning', timer: 10000, showConfirmButton: true});
            ZeroClipboard.destroy();
        });
        */

        // Show / hide editor toolbar switch
        /*var $el = $('#editor_toolbar_visibility');
        $el.change(function () {
            if ($el.is(':checked')) {
                $('#editor_toolbar').show();
            } else {
                $('#editor_toolbar').hide();
            }
        });//.trigger('change');*/

    });

    return {
        setMap: setMap
        //getCityDetails: getCityDetails,
        //insertCity: insertCity
    };

})();

/**
 * Adsense module.
 * @external jQuery
 * @external Adsense
 * @module
 * @returns {Object} Public functions and variables
 */
var adsenseModule = (function () {
    'use strict';

    var settings = {
        containers: '.adsbygoogle',
        adClient: 'ca-pub-8495719252049968', // Client id used when attribut is missing
        adSlot: '3723415549', // Default ad slot when attribut is missing
        adFormat: 'auto' // Default ad format when attribut is missing
    };



    /**
     * Search ad containers in given block and insert ad
     * @param {string} selector - Div selector from where to start ad block search
     */
    var _insertAds = function (selector) {

        var $block = (selector) ? $(selector) : $('body');
        if (!$block) {
            return;
        }

        $block.find(settings.containers).filter(':visible').each(function (i, container) {

            var $container = $(container);

            if (!$container.attr('data-adsbygoogle-status')) {

                // Inset missing attributs
                if (!$container.attr('data-ad-client')) {
                    $container.attr('data-ad-client', settings.adClient);
                }
                if (!$container.attr('data-ad-slot')) {
                    $container.attr('data-ad-slot', settings.adSlot);
                }
                if (!$container.attr('data-ad-format')) {
                    $container.attr('data-ad-format', settings.adFormat);
                }

                // Initialize ad
                (adsbygoogle = window.adsbygoogle || []).push({});
            }

        });
    };



    /**
     * Search Bootstrap hidden tabs
     * @param {string} selector - Div selector from where to start ad block search 
     */
    var _findHiddenAds = function (selector) {

        var $block = (selector) ? $(selector) : $('body');
        if (!$block) return;

        $block.find('a[data-toggle="tab"]').filter(':not(.active)').each(function (i, tab) {
            $(tab).one('shown.bs.tab', function (e) {
                var paneId = $(e.target).attr('href');
                _insertAds(paneId);
                _findHiddenAds(paneId);
            });
        });

    };



    /**
     * Find ad blocks, add missing attributs and initialise ads
     * @public
     * @param {object} [customSettings] - Adsense parameters
     */
    var init = function (customSettings) {

        $.extend(settings, customSettings || {});

        $(window).on('load', function () {
            // Initialize visible ads
            _insertAds();
            // Delay ad initialisation in hidden tabs
            _findHiddenAds();
        });

    };



    /**
     * Auto insert Adsense script when document is ready
     */
    $(document).ready(function () {
        $('body').append('<!-- Google Adsense -->'
            + '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>');
    });



    return {
        init: init
    };

})();
//jslint browser: true, devel: true
//global window, console, $
//
// http://wiki.openstreetmap.org/wiki/Nominatim_usage_policy
//

/**
 * OL3 geocode module.
 * @external jQuery
 * @module
 * @returns {Object} Public functions and variables
 */
var geocodeModule = (function () {
    'use strict';


    /**
     * Geocode search using Openstreetmap Nominatim
     * @public
     * @param {object} params - Request parameters
     * @param {string} query - Formated address
     * @returns {Object} jqHXR
     */
    var nominatimSearch = function (params, query) {

        var url = 'http://nominatim.openstreetmap.org/search/' + encodeURI(query) + '?' + $.param(params);
        console.log(url);

        return $.ajax({
            url: url,
            error: function (jqxhr, status, error) {
                console.warn(status);
            }

        });
    };



    /**
     * Reverse geocode using Openstreetmap Nominatim
     * @public
     * @param {Object} params - Request parameters
     * @returns {Object} jqXHR
     */
    var nominatimReverse = function (params) {

        var url = 'http://nominatim.openstreetmap.org/reverse?' + $.param(params);
        console.log(url);

        return $.ajax({
            url: url,
            error: function (jqxhr, status, error) {
                console.warn(status);
            }
        });

    };


    return {
        nominatimSearch: nominatimSearch,
        nominatimReverse: nominatimReverse
    };

})();
/**
 * Bootstrap tab module.
 * @external jQuery
 * @external Bootstrap
 * @module
 * @returns {Object} Public functions and variables
 */
var tabModule = (function () {
    'use strict';

    /**
     * Show the last displayed tab  using local storage
     * Usage: tabModule.rememberTab('#main-nav', !localStorage);
     * @public
     * @param {string} tabSelector - Tabs selector
     * @param {boolean} useHash - Restore tab from URL hash or not?
     */
    var rememberTab = function (tabSelector, useHash) {

        var key = 'selectedTabFor' + tabSelector;

        if (get(key)) {
            $(tabSelector).find('a[href="' + get(key) + '"]').tab('show');
        }
        
        $(tabSelector).on('click', 'a[data-toggle]', function (event) {
            set(key, this.getAttribute('href'));
        });

        function get(key) {
            return useHash ? location.hash: localStorage.getItem(key);
        }

        function set(key, value) {
            if (useHash) {
                location.hash = value;
            } else {
                localStorage.setItem(key, value);
            }
        }

    };



    return {
        rememberTab: rememberTab
    };

})();
//jslint browser: true
//global window, $, ol, swal, mapModule, mapLayersModule, mapControlsModule, tabModule, adsenseModule, cityPickerModule
/**
 * @fileOverview TinyRoadbook application
 * @author Christophe Boisier
 * @version: 0.1
 */

/**
 * Main module.
 * @external jQuery
 * @external OL3
 * @external swal
 * @external mapModule
 * @external mapLayersModule
 * @external mapControlsModule
 * @external tabModule
 * @external adsenseModule
 * @external cityPickerModule
 * @module
 * @returns {Object} Public functions and variables
 */
var appModule = (function () {
    'use strict';

    var settings = {
        adsense: {
            adClient: 'ca-pub-8495719252049968'
        }
    };

    var map1;

    // Base layers
    var mapquestSatLayer = mapLayersModule.create('mapquestSat');
    var openCycleMapLayer = mapLayersModule.create('openCycleMap');
    var openStreetMapLayer = mapLayersModule.create('openStreetMap', {visible: true});
    var openStreetMapHumanitarianLayer = mapLayersModule.create('openStreetMapHumanitarian');
    var thunderforestTransportLayer = mapLayersModule.create('thunderforestTransport');
    var thunderforestOutdoorLayer = mapLayersModule.create('thunderforestOutdoor');

    // Overlays
    var mapquestHybLayer = mapLayersModule.create('mapquestHyb');
    var lonviaHikingLayer = mapLayersModule.create('lonviaHiking');
    var lonviaCyclingLayer = mapLayersModule.create('lonviaCycling');
    var gpxLayer = new ol.layer.Vector({
        name: 'gpsTrack',
        visible: false,
        source: new ol.source.Vector({
            format: new ol.format.GPX()
        }),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 255, 0, 0.7)',
                width: 3
            })
        })
    });

    // Controls
    var attributionControl = mapControlsModule.create('attribution');
    var scaleLineControl = mapControlsModule.create('scaleLine');
    var fullScreenControl = mapControlsModule.create('fullScreen');
    var layerSwitcherControl = mapControlsModule.create('layerSwitcher');



    /**
     * Initialize an OL3 map
     * @param {target} target - Map div selector
     * @return {object} - The map object
     */
    var _addMap = function (target) {

        var layers = [
            new ol.layer.Group({
                name: 'baseLayers',
                title: 'Base map',
                layers: [
                    mapquestSatLayer,
                    openStreetMapHumanitarianLayer,
                    thunderforestTransportLayer,
                    thunderforestOutdoorLayer,
                    openCycleMapLayer,
                    openStreetMapLayer
                ]
            }),
            new ol.layer.Group({
                name: 'overlays',
                title: 'Overlays',
                layers: [
                    gpxLayer,
                    mapquestHybLayer,
                    lonviaHikingLayer,
                    lonviaCyclingLayer
                ]
            })
        ];

        var controls = ol.control.defaults({
            attribution: false,
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                collapsible: false
            }),
            zoomOptions: {
                // zoomInTipLabel: $.t('buttons:olZoomIn.label'),
                // zoomOutTipLabel: $.t('buttons:olZoomOut.label')
            }
        }).extend([
            attributionControl,
            scaleLineControl,
            fullScreenControl,
            layerSwitcherControl
        ]);

        return new ol.Map({
            layers: layers,
            target: target,
            view: new ol.View({
                center: [0, 0],
                zoom: 4
            }),
            controls: controls
        });

    };



    $(document).ready(function () {

        adsenseModule.init(settings.adsense);

        // Initialize the map when pane become visible for the first time
        $('a[data-toggle="tab"]').one('shown.bs.tab', function (e) {
            var paneId = $(e.target).attr('href');
            if (paneId === '#picker') {
                map1 = _addMap('map');
                mapModule.centerOnPosition(map1);
                cityPickerModule.setMap(map1);
                $('#gpx_file_path').on('change', function () {
                    layerSwitcherControl.renderPanel();
                });
            }
        });

        if (window.File && window.FileReader && window.FileList && window.Blob) {
            mapModule.setFileSource('#gpx_file_path', gpxLayer);
        } else {
            $('#gpx_file_path').closest('.form-group').hide();
        }

        $('.start-editing').click(function () {
            $('a[href="#picker"]').tab('show');
        });

        // excluded: 'input[type="file"], input[type="hidden"], input[type="submit"], [data-persist="false"]'
        // Garlic reset buttons
        $('#reset_settings').click(function () {
            $('#settings form').garlic('destroy');
            location.reload();
        });
        $('#reset_all').click(function () {
            swal({
                title: 'Are you sure?',
                text: 'This will reset settings, erase your roadbook and delete local data stored by this application.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes reset all',
                cancelButtonText: 'No stop !',
                closeOnConfirm: false,
                closeOnCancel: false
            }, function (isConfirm) {
                if (isConfirm) {
                    var cookies = document.cookie.split(';');
                    cookies.forEach(function (cookie) {
                        document.cookie = cookie.split('=')[0]
                                + '=; username=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
                    });
                    localStorage.clear();
                    location.reload();
                    //navigator.geolocation.clearWatch();
                } else {
                    swal('Cancelled', 'You can continue where you left off.', 'error');
                }
            });
        });

        // Automatically reload the last opened tab
        tabModule.rememberTab('#main-nav', !localStorage);

        /*window.update_cookieconsent_options({
            //learnMore: 'Learn more'
            theme: 'light-floating'
        });*/

    });

    return {
        map: map1
    };

})();