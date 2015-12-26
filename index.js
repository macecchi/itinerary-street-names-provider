/* global process; */
var Config = require('./config');
var assert = require('assert');
var RioBus = require('./operations');

assert(process.argv.length > 2, 'Missing bus line parameter.');

var searchedLine = process.argv[process.argv.length-1];
assert(!isNaN(searchedLine), 'Missing bus line parameter.');

RioBus.connect(function(err, db) {
	assert.equal(null, err);

	console.log('Loading itinerary information...');

	RioBus.findItinerary(db, searchedLine, function(spots) {
		console.dir(spots);
		process.exit(0);
	});

});