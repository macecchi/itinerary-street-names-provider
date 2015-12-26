/* global process; */
var Config = require('./config');
var assert = require('assert');
var RioBus = require('./riobus');
var Maps = require('./maps');

assert(process.argv.length > 2, 'Missing bus line parameter.');

var searchedLine = process.argv[process.argv.length-1];
assert(!isNaN(searchedLine), 'Missing bus line parameter.');

RioBus.connect(function(err, db) {
	assert.equal(null, err);

	console.log('Loading itinerary information...');

	RioBus.findItinerary(db, searchedLine, function(spots) {
		console.log('Loaded itinerary.');

		var streets = [];
		
		spots.forEach(function (spot) {
			Maps.reverseGeocode(spot, function(result) {
				if (result.status == 'OK') {
					streets.push(result.results[0]);
					console.log(result.results[0].address_components[1].short_name);
				}
			});
		});

		
	});

});