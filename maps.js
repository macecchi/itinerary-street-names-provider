/* global process; */
var request = require('request');
var GoogleMapsAPI = require('googlemaps');
var Config = require('./config');

var publicConfig = {
  key: Config.GoogleMaps.key,
  stagger_time:       1000, // for elevationPath
  encode_polylines:   false,
  secure:             false // use https
};

var gmAPI = new GoogleMapsAPI(publicConfig);

/**
 * Receives a coordinates object with latitude and longitude and a callback that will
 * receive the street name corresponding to the coordinates.
 */
function reverseGeocode(coordinates, callback) {
	var latlng = coordinates.latitude + ',' + coordinates.longitude;

    // reverseGeocodeGoogleMaps(latlng, callback);
    reverseGeocodeOSRM(latlng, callback);
}

function reverseGeocodeOSRM(latlng, callback) {
    var OSRM = Config.OSRM;
    var url = `http://${OSRM.host}:${OSRM.port}/nearest?loc=${latlng}`;
	request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body);
            callback(error, result.name);
        }
        else {
            callback(error, null);
        }
    })
}


function reverseGeocodeGoogleMaps(latlng, callback) {
	var reverseGeocodeParams = {
	  "latlng":        latlng,
	  "result_type":   "street_address",
	  "language":      "pt-BR",
	  "location_type": "ROOFTOP"
	};

	gmAPI.reverseGeocode(reverseGeocodeParams, function(error, result) {
        if (error) {
            callback(error, result);
        }
        else {
            if (result.status === 'OK') {
                callback(error, result.results[0].address_components[1].long_name);
            }
            else if (result.status === 'OVER_QUERY_LIMIT' || result.status === 'REQUEST_DENIED') {
                callback(result.error_message + ' (' + result.status + ')', null);
            }
            else {
                callback(result.error_message + ' (' + result.status + ')', null);
            }
        }
    });
}

module.exports = {
	reverseGeocode: reverseGeocode
}