/*eslint-env browser, jquery */
/*global ol, swal, roadbookModule, Spinner */
/**
* City picker module.
* @module
* @external $
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
            admin: ['country', 'state', 'state_district', 'county', 'island', 'islet',
            'city_district', 'suburb', 'hamlet', 'locality', 'municipality', 'isolated_dwelling'],
            city: ['city', 'town', 'village'],
            suburb: ['city_district', 'suburb', 'hamlet', 'locality', 'municipality', 'isolated_dwelling'],
            road: [
                'bike_route', 'bus-route-segment', 'fitness_trail', 'footway', 'historic_route', 'loc_route', 'master_route',
                'nature trail', 'old_route', 'path', 'pedestrian', 'road', 'route', 'route', 'route-disabled', 'route-part',
                'route-template', 'routeindex', 'routemaster', 'routerating', 'routetmp', 'route_fragments', 'route_link',
                'route_master', 'route_rating', 'route_ref', 'route_section', 'runway', 'superroute', 'through_route',
                'track', 'trail'
            ],
            poi: null, //['address26', 'address29', 'house_number']
            various: null
        },
        disallowedTypes: {
            admin: null,
            city: null,
            suburb: null,
            road: null,
            poi: null,
            various: ['country_code', 'postcode', 'neighbourhood']
        }
    };

    settings.disallowedTypes.poi = [].concat.apply([], [
        settings.allowedTypes.admin,
        settings.allowedTypes.city,
        settings.allowedTypes.suburb,
        settings.allowedTypes.road,
        settings.disallowedTypes.various
    ]);

    var zoomMin = 0,
    zoomMax = 21,
    zoomDelta = -2,
    pickType = 'city',
    language = 'en',
    geolocationXhr;

    var protocol = (window.location.protocol === 'https:') ? 'https:' : 'http:';

    var spinner = new Spinner({
        selector: '#map .spinner'
    });



    /**
    * Geocode search using Openstreetmap Nominatim
    * @private
    * @param {object} params - Request parameters
    * @param {string} query - Formated address
    * @return {Object} jqHXR
    */
    var nominatimSearch = function (params, query) {

        console.time('Nominatim geocoding complete');

        var url = protocol + '//nominatim.openstreetmap.org/search/' + encodeURI(query) + '?' + $.param(params);
        console.log('Nominatim geocoding request', url);

        return $.ajax({
            url: url
        })
        .done(function (json) {
            console.log('Nominatim geocoding result', JSON.stringify(json));
        })
        .fail(function () {
            console.warn('Nominatim geocoding failed');
        })
        .always(function () {
            console.timeEnd('Nominatim geocoding complete');
        });
    };



    /**
    * Reverse geocode using Openstreetmap Nominatim
    * @private
    * @param {Object} params - Request parameters
    * @return {Object} jqXHR
    */
    var nominatimReverse = function (params) {

        console.time('Nominatim reverse geocoding complete');

        var url = protocol + '//nominatim.openstreetmap.org/reverse?' + $.param(params);
        console.log('Nominatim reverse geocoding request', url);

        return $.ajax({
            url: url
        })
        .done(function (json) {
            console.log('Nominatim reverse geocoding result', JSON.stringify(json));
        })
        .fail(function () {
            console.warn('Nominatim reverse geocoding failed');
        })
        .always(function () {
            console.timeEnd('Nominatim reverse geocoding complete');
        });
    };



    /**
    * Use reverse geocode to define the name of the city at a given position
    * @private
    * @param {Object} json - The JSON object returned by Nominatim reverse geocode
    * @param {Array} [allowedPlaceTypes] - Allowed place types
    * @param {Array} [disallowedPlaceTypes] - Disallowed place types
    */
    var getPlaceDetails = function (json, allowedPlaceTypes, disallowedPlaceTypes, options) {

        var dfd = new $.Deferred();

        if (!json || !json.address) {
            dfd.resolve(json);
            return false;
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

        var query = [];
        var address = $.extend({}, json.address);

        // Search the first allowed place types and use the name as query string
        console.log('Search for an allowed place type in ', allowedPlaceTypes);
        $.each(json.address, function (k, v) {
            if ((!allowedPlaceTypes || $.inArray(k, allowedPlaceTypes) !== -1)
            && (!disallowedPlaceTypes || $.inArray(k, disallowedPlaceTypes) === -1)) {
                query.push(v);
                delete address[k];
                // If this is a house number, append the road
                if (k === 'house_number' && json.address.road) {
                    query[0] = query[0] + ' ' + json.address.road;
                    delete address.road;
                }
                return false;
            } else {
                // Remove the (first) disallowed values
                delete params[k];
                delete address[k];
            }
        });

        // If data contain at least an allowed place type
        if (query.length > 0) {

            var street = [];
            /*eslint-disable dot-notation*/
            if (address['house_number']) {
                street.push(json.address['house_number']);
            }
            /*eslint-enable dot-notation*/
            var road = address.road || address.pedestrian;
            if (road) {
                street.push(road);
            }
            if (street.length > 0) {
                params.street = street.join(' ');
                //query[0] = street.join(' ');
            }

            if (address.city && address.city !== query[0]) {
                params.city = json.address.city;
                query.push(json.address.city);
            }
            if (address.county && address.county !== query[0]) {
                params.county = json.address.county;
                query.push(json.address.county);
            }
            if (address.state && address.state !== query[0]) {
                params.state = json.address.state;
                query.push(json.address.state);
            }
            if (address.country && address.country !== query[0]) {
                params.country = json.address.country;
                query.push(json.address.country);
            }
            //if (address.postcode && address.postcode !== query[0]) {
            //    params.postalcode = json.address.postcode;
            //    query.push(json.address.postcode);
            //}

            geolocationXhr = nominatimSearch(params, $.unique(query))
            .done(function (json2) {
                dfd.resolve(json2);
            })
            .fail(function () {
                dfd.resolve(json);
            });

        } else {
            dfd.resolve(json);
        }

        spinner.addJob(dfd);

        return dfd;

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

            // If the first place type is allowed, not disallowed, and is not address29 or address26 (miscellaneous)
            // just return the current data without making an second request
            /*eslint-disable no-unused-vars*/
            $.each(json.address, function (k, v) {
                if ((!allowedPlaceTypes || $.inArray(k, allowedPlaceTypes) !== -1)
                && (!disallowedPlaceTypes || $.inArray(k, disallowedPlaceTypes) === -1)
                && $.inArray(k, settings.allowedTypes.poi) === -1) {
                    dfd.resolve(json);
                }
                return false;
            });
            /*eslint-enable no-unused-vars*/

            // Else make a geolocation request with the first allowed place type
            if (dfd.state() === 'pending') {
                getPlaceDetails(json, allowedPlaceTypes, disallowedPlaceTypes, options)
                .done(function (json2) {
                    if (json2.length > 0) {
                        dfd.resolve(json2[0]);
                    } else {
                        dfd.resolve(json);
                    }
                })
                .fail(function () {
                    dfd.resolve(json);
                });
            }

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

            var type, translation;

            /*eslint-disable no-unused-vars*/
            // Get the translated name (only if this is a road)
            $.each(json.address, function (k, v) {
                type = k;
                translation = v;
                return false;
            });
            /*eslint-enable no-unused-vars*/
        }

        // Get the road number, else the road name
        if ((json && json.namedetails) || translation) {
            name = json.namedetails.ref || json.namedetails.int_ref || json.namedetails.name || translation;
        }

        if (name && type && $.inArray(type, settings.allowedTypes.road) !== -1) {

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
    * Auto-insert the stored road before each insertion (excepted roads obviously)
    * @private
    */
    var insertInputRoad = function () {

        var $checkbox = $('#auto_insert_road');
        if (pickType !== 'road' && $checkbox && $checkbox.is(':checked')) {
            var $input = $('#road');
            var storedjson = $input.data('nominatim-reverse');
            var storedName = $input.val();
            roadbookModule.insertNominatimResult(storedjson, {
                address: {road: storedName},
                namedetails: {name: storedName}
            });
        }

    };



    /**
    * Reset the pick type to default (if defined in settings)
    * @private
    */
    var setDefaultPickType = function () {

        var $input = $('#default_type');
        if ($input) {
            var $button = $('[data-pick-type="' + $input.val() + '"]');
            if ($button) {
                $button.trigger('click');
            }
        }

    };



    /**
    * Start listening clicks on the map
    * @public
    * @param {Object} map - OL3 map
    */
    var watchMapClick = function (map) {

        var $input;

        // Watch map clicks
        map.on('singleclick', function (evt) {

            console.log('Pick type', pickType);
            console.log('Selected pick type', pickType);

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
            /*if (geolocationXhr && geolocationXhr.state() === 'pending') {
            geolocationXhr.abort();
            swal({
            title: 'Slow down!',
            text: 'You made a second click before the previous application have been completed.',
            type: 'warning',
            timer: 2000
        });
    }*/

    // Reverse geocode clicked location
    if (pickType === 'admin') {

        //zoom = Math.min(Math.max((zoom + zoomDelta), 0), 9);
        zoom = Math.min(Math.max((zoom + zoomDelta), 0), 15);

        getPlace(lon, lat, {'osm_type': 'R', zoom: zoom})
        .done(function (json) {
            filterNominatimResult(json, settings.allowedTypes[pickType], settings.disallowedTypes[pickType], {zoom: zoom})
            .done(function (json2) {
                roadbookModule.insertNominatimResult(json2);
                insertInputRoad();
                setDefaultPickType();
            });
        });

    } else if (pickType === 'city') {

        zoom = Math.min(Math.max((zoom + zoomDelta), 10), 16);

        getPlace(lon, lat, {'osm_type': 'R', zoom: zoom})
        .done(function (json) {
            filterNominatimResult(json, settings.allowedTypes[pickType], settings.disallowedTypes[pickType], {zoom: zoom})
            .done(function (json2) {
                roadbookModule.insertNominatimResult(json2);
                insertInputRoad();
                setDefaultPickType();
            });
        });
        /*
    } else if (pickType === 'suburb') {

    zoom = Math.min(Math.max((zoom + zoomDelta), 14), 15);

    getPlace(lon, lat, {'osm_type': 'R', zoom: zoom})
    .done(function (json) {
    filterNominatimResult(json, settings.allowedTypes[pickType], settings.disallowedTypes[pickType], {zoom: zoom})
    .done(function (json2) {
    roadbookModule.insertNominatimResult(json2);
    insertInputRoad();
    setDefaultPickType();
});
});
*/
} else if (pickType === 'road') {

    zoom = Math.min(Math.max((zoom + zoomDelta), 16), 17);

    getPlace(lon, lat, {'osm_type': 'W', zoom: zoom})
    .done(function (json) {

        filterNominatimResult(json, settings.allowedTypes[pickType], settings.disallowedTypes[pickType], {zoom: zoom})
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
                setDefaultPickType();
            }

        });

    });

} else if (pickType === 'poi') {

    zoom = Math.min(Math.max((zoom + zoomDelta), 18), 21);

    getPlace(lon, lat, {'osm_type': 'N', zoom: zoom})
    .done(function (json) {
        filterNominatimResult(json, settings.allowedTypes[pickType], settings.disallowedTypes[pickType], {zoom: zoom})
        .done(function (json2) {
            //storeRoad(json2);
            roadbookModule.insertNominatimResult(json2);
            insertInputRoad();
            setDefaultPickType();
        });
    });

} else {

    zoom = Math.min(Math.max((zoom + zoomDelta), zoomMin), zoomMax);

    getPlace(lon, lat, {zoom: zoom})
    .done(function (json2) {
        storeRoad(json2);
        roadbookModule.insertNominatimResult(json2);
        insertInputRoad();
        setDefaultPickType();
    });

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
        //'osm_type': 'R',
        addressdetails: 1,
        extratags: 1,
        namedetails: 1,
        'accept-language': language
    };

    console.log('getPlace options', options);
    $.extend(params, options);


    geolocationXhr = nominatimReverse(params);

    spinner.addJob(geolocationXhr);

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

    $('#roadbook_language').on('change', function () {
        language = $(this).val();
    }).trigger('change');

    // Activate the default pick button
    var $buttons = $('[data-pick-type]');
    $buttons.filter('[data-pick-type="' + pickType + '"]').trigger('click');
    console.log('Pick type initialized', pickType);

    // Watch pick buttons clicks
    $buttons.click(function () {
        pickType = $(this).data('pick-type');
        console.log('Pick type changed', pickType);
    });

    var $input = $('#road');
    $input.on('change', function () {
        if (!$input.val()) {
            $input.attr('data-nominatim-reverse', null);
        }
    });

});

return {
    geolocationXhr: geolocationXhr,
    watchMapClick: watchMapClick
};

})();
