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
    if (lastStreet === '') {
        lastStreet = street;
        lastStreetCount++;
        return false;
    }
    
    if (lastStreet === street) {
        lastStreetCount++;
        if (lastStreetCount == 5) {
            if (streets.length == 0 || streets[streets.length-1] !== street) {
                streets.push(street);
                return true;
            }
         }
    }
    else {
        lastStreet = street;
        lastStreetCount = 0;
    }
    
    return false;
}

function main() {
    wait.for(RioBus.connect);

    console.log('Loading itinerary information...');
    var spots = wait.for(RioBus.findItinerary, searchedLine);
    console.log('Loaded itinerary.');

    console.log('Requesting reverse geocodes...');
    for (var spot of spots) {
        try {
            var result = wait.for(Maps.reverseGeocode, spot);

            if (result.status == 'OK') {
                // console.dir(result.results[0])
                var streetName = result.results[0].address_components[1].long_name;
                var added = addToItinerary(streetName);
                console.log(streetName);
                if (added) console.log('adicionou', streets); 
            }
            else {
                console.log('[ERROR]', result.error_message, '(' + result.status + ')');
                process.exit(1);
            }
        } catch (err) {
            console.log('[ERROR]', err);
            process.exit(2);
        }
    }
    
    console.log('Done!', streets);
    process.exit(0);
}

wait.launchFiber(main);