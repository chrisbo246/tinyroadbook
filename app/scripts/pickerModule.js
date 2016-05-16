/*eslint-env browser, jquery */
/*global geocodeModule, ol, roadbookModule, swal */
/**
 * City picker module.
 * @module
 * @external $
 * @external geocodeModule
 * @external ol
 * @external roadbookModule
 * @external swal
 * @return {Object} Public functions / variables
 */
/*eslint-disable no-unused-vars*/
var pickerModule = (function () {
    /*eslint-enable no-unused-vars*/
    'use strict';

    var settings = {
        allowedTypes: {
            admin: ['country', 'state', 'state_district', 'county', 'island', 'islet'],
            city: ['city', 'town', 'village'],
            suburb: ['city_district', 'suburb', 'hamlet', 'locality', 'municipality', 'isolated_dwelling'],
            road: [
                'bike_route', 'bus-route-segment', 'fitness_trail', 'footway', 'historic_route', 'loc_route', 'master_route',
                'nature trail', 'old_route', 'path', 'pedestrian', 'road', 'route', 'route', 'route-disabled', 'route-part',
                'route-template', 'routeindex', 'routemaster', 'routerating', 'routetmp', 'route_fragments', 'route_link',
                'route_master', 'route_rating', 'route_ref', 'route_section', 'runway', 'superroute', 'through_route',
                'track', 'trail'
            ],
            poi: null,
            various: ['country_code', 'postcode', 'house_number', 'neighbourhood']

        },
        disallowedTypes: {
            various: ['address26', 'address29']
        }
    };

    //settings.allowedTypes.poi = settings.disallowedTypes.various;
    settings.disallowedTypes.poi = [].concat.apply([], [
        settings.allowedTypes.admin,
        settings.allowedTypes.city,
        settings.allowedTypes.suburb,
        settings.allowedTypes.road,
        settings.allowedTypes.various
    ]);

    var zoomMin = 0,
        zoomMax = 21,
        zoomDelta = -2,
        pick = 'city',
        language = 'en',
        geolocationXhr,
        clickCounter;



    /**
     * Use reverse geocode to define the name of the city at a given position
     * @private
     * @param {Object} json - The JSON object returned by Nominatim reverse geocode
     * @param {Array} [allowedPlaceTypes] - Allowed place types
     * @param {Array} [disallowedPlaceTypes] - Disallowed place types
     */
    var getPlaceDetails = function (json, allowedPlaceTypes, disallowedPlaceTypes, options) {

        if (!json.address) {
            return json;
        }

        var params = {
            format: 'json',
            limit: 1,
            'polygon_svg': 0,
            addressdetails: 1,
            extratags: 1,
            namedetails: 1,
            'accept-language': language
        };

        if (options) {
            $.extend(params, options);
        }

        // Build query
        var query = [];

        // Get the smallest valid place name
        if (json.address) {

            // Search the first allowed place types and use the name as query string
            console.log('Search for an allowed place type in ', allowedPlaceTypes);
            $.each(json.address, function (k, v) {
                if ((!allowedPlaceTypes || $.inArray(k, allowedPlaceTypes) !== -1)
                    && (!disallowedPlaceTypes || $.inArray(k, disallowedPlaceTypes) === -1)) {
                    query.push(v);
                    return false;
                } else {
                    // Remove the (first) disallowed values from params
                    delete params[k];
                }
            });

            var street = [];
            /*eslint-disable dot-notation*/
            if (json.address['house_number']) {
                street.push(json.address['house_number']);
            }
            /*eslint-enable dot-notation*/
            if (json.address.road) {
                street.push(json.address.road);
            }
            if (street.length > 0) {
                params.street = street.join(' ');
            }
            if (json.address.city) {
                params.city = json.address.city;
            }
            if (json.address.county) {
                params.county = json.address.county;
            }
            if (json.address.state) {
                params.state = json.address.state;
            }
            if (json.address.country) {
                params.country = json.address.country;
            }
            if (json.address.postcode) {
                params.postalcode = json.address.postcode;
            }

        }

        return geocodeModule.nominatimSearch(params, query);

    };



    /**
     * Check if the Nominatim result is of the good type
     * else make a new request to get a more accurate result
     * @private
     * @param {Object} json - Nominatim result
     * @param {Array} allowedPlaceTypes - Allowed place types
     * @param {Array} disallowedPlaceTypes - Disallowed place types
     * @return {Object} Deferred with new Nominatim result
     */
    var filterNominatimResult = function (json, allowedPlaceTypes, disallowedPlaceTypes, options) {

        var dfd = new $.Deferred();

        if (json && json.address) {

            // Try a geolocation request with the reverse geolocation result
            geolocationXhr = getPlaceDetails(json, allowedPlaceTypes, disallowedPlaceTypes, options);
            geolocationXhr.done(function (json2) {
                    if (json2.length > 0) {
                        dfd.resolve(json2[0]);
                    } else {
                        dfd.resolve(json);
                    }
                });
            geolocationXhr.fail(function () {
                    dfd.resolve(json);
                });

        } else {
            dfd.resolve(json);
        }

        return dfd;

    };



    /**
     * Copy road name in the input field for a further use
     * @param {object} json - JSON object returned by the Nominatim request
     * @private
     */
    var storeRoad = function (json) {

        var name;
        var $input = $('#road');

        if (!json || !$input) {
            return false;
        }

        // Check if this is really a road
        if (json && json.address) {

            var translation;

            /*eslint-disable no-unused-vars*/
            $.each(json.address, function (k, v) {
                translation = v;
                return false;
            });
            /*eslint-enable no-unused-vars*/
        }

        // Get the road number, else the road name
        if ((json && json.namedetails) || translation) {
            name = json.namedetails.ref || json.namedetails.int_ref || json.namedetails.name || translation;
        }

        if (name) {

            // If input is focused, insert the picked road at caret position
            if ($input.is(':focus')) {
                var pos = document.getElementById($input.attr('id')).selectionStart;
                var content = $input.val();
                name = content.substring(0, pos) + name + content.substring(pos);
            }

            // Populate input field
            $input.attr('data-nominatim-reverse', JSON.stringify(json));
            $input.val(name).trigger('change');
        }

    };



    /**
     * Start listening clicks on the map
     * @public
     * @param {Object} map - OL3 map
     */
    var watchMapClick = function (map) {

        var $input;
        var $spinner = $('#map').find('.spinner');

        // Watch map clicks
        map.on('singleclick', function (evt) {

            console.log('Picked', pick);

            // Adjust extraction level
            var view = map.getView();
            var zoom = view.getZoom();
            console.log('Zoom', zoom);
            //console.log('zoomMin', zoomMin);
            //console.log('zoomMax', zoomMax);
            //console.log('zoomDelta', zoomDelta);

            // Define clicked coordinates
            var position = evt.coordinate;
            var projection = view.getProjection();
            position = ol.proj.transform(position, projection.getCode(), 'EPSG:4326');
            var lon = position[0];
            var lat = position[1];

            // Stop the previous geolocation task if user click too quickly
            if (geolocationXhr) { //&& geolocationXhr.state() === 'pending'
                console.log('Geolocation state', geolocationXhr.state());
                geolocationXhr.abort();
                $spinner.fadeOut();
                /*if (clickCounter > 0) {
                    swal({
                        title: 'Slow down!',
                        text: 'You made a second click before the previous application have been completed.',
                        type: 'warning',
                        timer: 2000
                    });
                }*/
                clickCounter = 0;
            }

            // Reverse geocode clicked location
            if (pick === 'admin') {

                $spinner.fadeIn();
                clickCounter = clickCounter + 1;
                zoom = Math.min(Math.max((zoom + zoomDelta), 0), 9);

                getPlace(lon, lat, {'osm_type': 'relation', zoom: zoom})
                    .done(function (json) {
                        filterNominatimResult(json, settings.allowedTypes[pick], null, {zoom: zoom})
                            .done(function (json2) {
                                roadbookModule.insertNominatimResult(json2);
                            });
                    });

            } else if (pick === 'city') {

                $spinner.fadeIn();
                clickCounter = clickCounter + 1;
                zoom = Math.min(Math.max((zoom + zoomDelta), 10), 13);

                getPlace(lon, lat, {'osm_type': 'relation', zoom: zoom})
                    .done(function (json) {
                        filterNominatimResult(json, settings.allowedTypes[pick], null, {zoom: zoom})
                            .done(function (json2) {
                                roadbookModule.insertNominatimResult(json2);
                            });
                    });

            } else if (pick === 'suburb') {

                $spinner.fadeIn();
                clickCounter = clickCounter + 1;
                zoom = Math.min(Math.max((zoom + zoomDelta), 14), 15);

                getPlace(lon, lat, {'osm_type': 'relation', zoom: zoom})
                    .done(function (json) {
                        filterNominatimResult(json, settings.allowedTypes[pick], null, {zoom: zoom})
                            .done(function (json2) {
                                roadbookModule.insertNominatimResult(json2);
                            });
                    });

            } else if (pick === 'road') {

                $spinner.fadeIn();
                clickCounter = clickCounter + 1;
                zoom = Math.min(Math.max((zoom + zoomDelta), 16), 17);

                getPlace(lon, lat, {'osm_type': 'way', zoom: zoom})
                    .done(function (json) {

                        filterNominatimResult(json, settings.allowedTypes[pick], null, {zoom: zoom})
                            .done(function (json2) {

                                // Copy road name in the input field for a further use
                                storeRoad(json2);

                                // Insert the road in the editor (if not in auto-insert mode)
                                var $checkbox = $('#auto_insert_road');
                                if ($checkbox && !$checkbox.is(':checked')) {
                                    $input = $('#road');
                                    //var json = $input.data('nominatim-reverse');
                                    var name = $input.val();
                                    roadbookModule.insertNominatimResult(json2, {
                                            address: {road: name},
                                            namedetails: {name: name}
                                        });
                                }

                            });

                    });

            } else if (pick === 'poi') {

                $spinner.fadeIn();
                clickCounter = clickCounter + 1;
                zoom = Math.min(Math.max((zoom + zoomDelta), 18), 21);

                getPlace(lon, lat, {'osm_type': 'node', zoom: zoom})
                    .done(function (json) {
                        filterNominatimResult(json, settings.allowedTypes[pick], settings.disallowedTypes[pick], {zoom: zoom})
                            .done(function (json2) {
                                roadbookModule.insertNominatimResult(json2);
                            });
                    });

            } else {

                $spinner.fadeIn();
                clickCounter = clickCounter + 1;
                zoom = Math.min(Math.max((zoom + zoomDelta), zoomMin), zoomMax);

                getPlace(lon, lat, {zoom: zoom})
                    .done(function (json) {
                        roadbookModule.insertNominatimResult(json);
                    });

            }

            // Stop the spinner and reduce the click counter once the geolocation task completed
            if (geolocationXhr) {
                geolocationXhr.always(function () {
                        $spinner.fadeOut();
                        clickCounter = clickCounter - 1;
                    });
            }

            // Auto-insert the stored road before each insertion (excepted roads obviously)
            var $el = $('#auto_insert_road');
            if (pick !== 'road' && $el && $el.is(':checked')) {
                $input = $('#road');
                var storedjson = $input.data('nominatim-reverse');
                var storedName = $input.val();
                roadbookModule.insertNominatimResult(storedjson, {
                        address: {road: storedName},
                        namedetails: {name: storedName}
                    });
            }

            // Reset active button
            $input = $('#default_type');
            if ($input) {
                var $button = $('#pick_' + $input.val());
                if ($button) {
                    $button.trigger('click');
                }
            }

        });

    };



    /**
     * Use reverse geocode to define the name of the city at a given position
     * @private
     * @param {number} lon - Longitude
     * @param {number} lat - Latitude
     * @param {object} [options] - Longitude, latitude at EPSG:4326 projection
     * @return {Object} jqxhr
     */
    var getPlace = function (lon, lat, options) {

        var params = {
            format: 'json',
            lon: lon,
            lat: lat,
            //zoom: zoom,
            //'osm_type': 'relation',
            addressdetails: 1,
            extratags: 1,
            namedetails: 1,
            'accept-language': language
        };

        console.log('getPlace options', options);
        $.extend(params, options);

        geolocationXhr = geocodeModule.nominatimReverse(params);

        return geolocationXhr;

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
        var $buttons = $('#pick_buttons').find('button');
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
