/* global process; */
var GoogleMapsAPI = require('googlemaps');
var Config = require('./config');

var publicConfig = {
  key: Config.GoogleMaps.key,
  stagger_time:       1000, // for elevationPath
  encode_polylines:   false,
  secure:             false // use https
};

var gmAPI = new GoogleMapsAPI(publicConfig);

function reverseGeocode(coordinates, callback) {
	var reverseGeocodeParams = {
	  "latlng":        coordinates.latitude + ',' + coordinates.longitude,
	  "result_type":   "street_address",
	  "language":      "pt-BR",
	  "location_type": "ROOFTOP"
	};

	gmAPI.reverseGeocode(reverseGeocodeParams, callback);
}

module.exports = {
	reverseGeocode: reverseGeocode
}