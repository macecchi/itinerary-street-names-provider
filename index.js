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

var skipped = 0, requests = 0;
var matchesCache = {};

function addToItinerary(street, returning) {
    if (lastStreet === street) {
        lastStreetCount++;
        if (lastStreetCount == 4) {
            if (streets.length == 0 || streets[streets.length - 1] !== street) {
                streets.push({ location: street, returning: returning });
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

function findStreetName(spot) {
    var spotKey = JSON.stringify(spot);
    var streetName;
    
    if (spotKey in matchesCache) {
        skipped++;
        streetName = matchesCache[spotKey];
    }
    else {
        streetName = wait.for(Maps.reverseGeocode, spot);
        matchesCache[spotKey] = streetName;
        requests++;
    }
    
    return streetName;
}

function exportItinerary(line, data, callback) {
    // Save to file
    var dataString = JSON.stringify(data, null, 4);
    fs.writeFile('itineraries/' + line + '.json', dataString, 'utf8', callback);
    
}

function main() {
    wait.for(RioBus.connect);

    console.log('Loading itinerary information...');
    var spots = wait.for(RioBus.findItinerary, searchedLine);
    console.log('Loaded itinerary.');

    console.log('Requesting reverse geocodes...');
    for (var spot of spots) {
        try {
            var streetName = findStreetName(spot); 
            var returning = spot.returning;
            
            if (streetName !== '') {
                var added = addToItinerary(streetName, returning);
                console.log(streetName + (returning ? ' (returning)' : ''));
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
    
    try {
        wait.for(exportItinerary, searchedLine, streets);
        console.log('Exported to file.');
        
        wait.for(RioBus.saveStreetItinerary, searchedLine, streets);
        console.log('Exported to database.')
    } catch (err) {
        console.log('Error exporting data.', err)
    }
    
    process.exit(0);        
}

wait.launchFiber(main);