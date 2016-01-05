/* global process; */
var Config = require('./config');
var assert = require('assert');
var RioBus = require('./riobus');
var Maps = require('./maps');
var wait = require('wait.for');

assert(process.argv.length > 2, 'Missing bus line parameter.');

var searchedLine = process.argv[process.argv.length - 1];
assert(!isNaN(searchedLine), 'Missing bus line parameter.');

var streets = [];
var lastStreet = '';
var lastStreetCount = 0;

function addToItinerary(street) {
    if (lastStreet === street) {
        lastStreetCount++;
        if (lastStreetCount == 4) {
            if (streets.length == 0 || streets[streets.length-1] !== street) {
                streets.push(street);
                return true;
            }
         }
    }
    else {
        lastStreet = street;
        lastStreetCount = 1;
    }
    
    return false;
}

function main() {
    wait.for(RioBus.connect);

    console.log('Loading itinerary information...');
    var spots = wait.for(RioBus.findItinerary, searchedLine);
    console.log('Loaded itinerary.');

    var matchesCache = {};
    var skipped = 0, requests = 0;

    console.log('Requesting reverse geocodes...');
    for (var spot of spots) {
        var spotKey = JSON.stringify(spot);
        if (spotKey in matchesCache) {
            skipped++;
            continue;
        }
        
        try {
            var result = wait.for(Maps.reverseGeocode, spot);
            requests++;

            if (result.status === 'OK') {
                // console.dir(result.results[0])
                var streetName = result.results[0].address_components[1].long_name;
                matchesCache[spotKey] = streetName;
                var added = addToItinerary(streetName);
                console.log(streetName);
                if (added) console.log('Partial itinerary: ', streets); 
            }
            else if (result.status === 'OVER_QUERY_LIMIT' || result.status === 'REQUEST_DENIED') {
                console.log('[ERROR]', result.error_message, '(' + result.status + ')');
                process.exit(1);
            }
            else {
                console.log('[WARNING]', result.error_message, '(' + result.status + ')');
            }
        } catch (err) {
            console.log('[ERROR]', err);
            process.exit(2);
        }
    }
    
    console.log('Done!\n', streets);
    console.log('Requests: ' + requests);
    console.log('Skipped spots: ' + skipped);
    process.exit(0);
}

wait.launchFiber(main);