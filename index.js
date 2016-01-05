/* global process; */
var Config = require('./config');
var assert = require('assert');
var RioBus = require('./riobus');
var Maps = require('./maps');
var wait = require('wait.for');
var fs = require('fs');

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
            if (streets.length == 0 || streets[streets.length - 1] !== street) {
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

function exportItinerary(line, data) {
    fs.writeFile('itineraries/' + line + '.json', JSON.stringify(data, null, 4), function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Exported.');
        }
    });
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
            var streetName = wait.for(Maps.reverseGeocode, spot);
            matchesCache[spotKey] = streetName;
            requests++;
            
            if (streetName !== '') {
                var added = addToItinerary(streetName);
                console.log(streetName);
                if (added) console.log('Partial itinerary: ', streets);
            }
            else {
                console.log('[WARNING] Street name returned empty.');
            }  
        } catch (err) {
            console.log('[ERROR]', err);
            process.exit(2);
        }
    }

    console.log('Done!\n', streets);
    console.log('Requests: ' + requests);
    console.log('Skipped spots: ' + skipped);
    
    exportItinerary(searchedLine, streets);
    process.exit(0);
}

wait.launchFiber(main);