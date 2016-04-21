/*eslint-env browser, jquery */
/*global geocodeModule, ol, roadbookModule */
/**
 * City picker module.
 * @module
 * @external $
 * @external geocodeModule
 * @external ol
 * @external roadbookModule
 * @return {Object} Public functions / variables
 */
/*eslint-disable no-unused-vars*/
var pickerModule = (function () {
    /*eslint-enable no-unused-vars*/
    'use strict';

    var zoomMin = 0;
    var zoomMax = 20;
    var zoomDelta = -2;
    var pick = 'place';
    var language = 'en';
    var reverseGeolocationXhr;



    /**
     * Start listening clicks on the map
     * @public
     * @param {Object} map - OL3 map
     */
    var watchMapClick = function (map) {

        // Watch map clicks
        map.on('click', function (evt) {

            var view = map.getView();
            var position = evt.coordinate;
            var projection = view.getProjection();

            // Adjust extraction level
            var zoom = view.getZoom();
            console.log('Zoom', zoom);
            console.log('zoomMin', zoomMin);
            console.log('zoomMax', zoomMax);
            console.log('zoomDelta', zoomDelta);
            zoom = Math.min(Math.max((zoom + zoomDelta), zoomMin), zoomMax);
            console.log('Extraction level', zoom);

            // Define clicked coordinates
            position = ol.proj.transform(position, projection.getCode(), 'EPSG:4326');

            console.log('Picked', pick);

            // Auto-insert the previous road before each insertion
            var $el = $('#auto_insert_road');
            if (pick !== 'road' && $el && $el.is(':checked')) {
                roadbookModule.insertRoad();
            }

            // Stop an eventual previous request
            if (reverseGeolocationXhr) {
                reverseGeolocationXhr.abort();
            }

            // Reverse geocode clicked location
            console.time('Reverse geocoding');
            if (pick === 'place') {

                reverseGeolocationXhr = getPlace(position, zoom);
                reverseGeolocationXhr.done(function (json) {
                        if (json.osm_type !== 'way') {
                            roadbookModule.insertCity(json);
                        } else {
                            console.log('osm_type is not the required type', json.osm_type);
                        }
                    });

            } else if (pick === 'road') {

                reverseGeolocationXhr = getRoad(position);
                reverseGeolocationXhr.done(function (json) {
                        if (json.osm_type === 'way') {

                            // Copy road name in the input field for a further use
                            storeRoad(json);

                            // Insert the road in the editor (if not in auto-insert mode)
                            var $checkbox = $('#auto_insert_road');
                            if ($checkbox && $checkbox.not(':checked')) {
                                roadbookModule.insertRoad(json);
                            }

                        } else {
                            console.log('osm_type is not the required type', json.osm_type);
                        }
                    });

            } else {

                reverseGeolocationXhr = getPOI(position);
                reverseGeolocationXhr.done(function (json) {
                        if (json.osm_type !== 'relation') {
                            roadbookModule.insertPOI(json);
                        } else {
                            console.log('osm_type is not the required type', json.osm_type);
                        }
                    });

            }
            console.timeEnd('Reverse geocoding');

            // Reset active button
            var $input = $('#default_type');
            if ($input) {
                var $button = $('#pick_' + $input.val());
                if ($button) {
                    $button.trigger('click');
                }
            }

        });

        // On layer change, adjust zoom delta depending on selected base layer
        // zoomDelta = -2;
    };



    /**
     * Use reverse geocode to define the name of the city at a given position
     * @private
     * @param {object} position - Longitude, latitude at EPSG:4326 projection
     * @param {integer} zoom - Zoom level used for extraction
     * @return {Object} jqxhr
     */
    var getPlace = function (position, zoom) {

        var params = {
            format: 'json',
            lon: position[0],
            lat: position[1],
            zoom: zoom,
            'osm_type': 'relation',
            addressdetails: 1,
            extratags: 1,
            namedetails: 1,
            'accept-language': language
        };

        var $spinner = $('#map').find('.spinner');
        $spinner.fadeIn();

        return geocodeModule.nominatimReverse(params)
            .always(function () {
                $spinner.fadeOut();
            });

    };



   /**
     * Use reverse geocode to define the name of the road at a given position
     * @private
     * @param {object} position - Longitude, latitude at EPSG:4326 projection
     * @return {Object} jqxhr
     */
    var getRoad = function (position) {

        var params = {
            format: 'json',
            lon: position[0],
            lat: position[1],
            zoom: 21,
            'osm_type': 'way',
            addressdetails: 1,
            extratags: 0,
            namedetails: 1,
            'accept-language': language
        };

        var $spinner = $('#map').find('.spinner');
        $spinner.fadeIn();

        return geocodeModule.nominatimReverse(params)
            .always(function () {
                $spinner.fadeOut();
            });

    };



    /**
     * Use reverse geocode to define the name of the relation at a given position
     * @private
     * @param {object} position - Longitude, latitude at EPSG:4326 projection
     * @param {integer} zoom - Zoom level used for extraction
     * @return {Object} jqxhr
     */
    var getPOI = function (position) {

        var params = {
            format: 'json',
            lon: position[0],
            lat: position[1],
            zoom: 21,
            'osm_type': 'node',
            addressdetails: 1,
            extratags: 1,
            namedetails: 1,
            'accept-language': language
        };

        var $spinner = $('#map').find('.spinner');
        $spinner.fadeIn();

        return geocodeModule.nominatimReverse(params)
            .always(function () {
                $spinner.fadeOut();
            });

    };



    /**
     * Copy road name in the input field for a further use
     * @param {object} json - JSON object returned by the Nominatim request
     * @private
     */
    var storeRoad = function (json) {

        var name, place;

        // Check if this is really a road
        if (json.address) {
            $.each(json.address, function (k, v) {
                place = k;
                name = v;
                return false;
            });
        }

        // Get the road number, else the road name
        if (json.namedetails) {
            name = json.namedetails.ref || json.namedetails.int_ref || json.namedetails.name;
        }

        var $input = $('#road');
        if (name && place && $input) { //&& place === 'road'

            // If input is focused, insert the picked road at caret position
            if ($input.is(':focus')) {
                var pos = document.getElementById($input.attr('id')).selectionStart;
                var content = $input.val();
                name = content.substring(0, pos) + name + content.substring(pos);
            }

            $input.val(name);
            $input.attr('data-nominatim-reverse', JSON.stringify(json));
        }

    };

    /**
     * Document ready
     */
    $(function () {

        // Watch input changes
        $('#zoom_delta').on('change', function () {
            zoomDelta = parseInt($(this).val());
        }).trigger('change');

        $('#zoom_max').on('change', function () {
            zoomMax = parseInt($(this).val());
        }).trigger('change');

        $('#zoom_min').on('change', function () {
            zoomMin = parseInt($(this).val());
        }).trigger('change');

        $('#user_language').on('change', function () {
            language = $(this).val();
        }).trigger('change');

        // Hide the spinner
        var $spinner = $('#map').find('.spinner');
        $spinner.hide();

        // Activate the default pick button
        var $buttons = $('#pick_place, #pick_road, #pick_poi');
        $buttons.filter('[data-type="' + pick + '"]').addClass('active');

        // Watch pick buttons clicks
        $buttons.click(function () {
            pick = $(this).data('type');
            console.log('Pick mode', pick);
            $buttons.removeClass('active');
            $(this).addClass('active');
        });

        var $input = $('#road');
        $input.on('change', function () {
            if (!$input.val()) {
                $input.attr('data-nominatim-reverse', null);
            }
        });

    });

    return {
        watchMapClick: watchMapClick
    };

})();
