/* global process; */
var Config = require('./config');
var RioBus = require('./riobus');
var StreetIitinerary = require('./itinerary.js');
var Maps = require('./maps');
var wait = require('wait.for');

var searchedLine;
if (process.argv.length > 2) {
    searchedLine = process.argv[2];
}
var force = process.argv.indexOf('--force') > -1;

var matchesCache = {};

var skipped = 0, requests = 0;

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

function processLine(line) {
    var spots = line.spots;
    if (spots.length == 0) {
        console.log('[ERROR] The line ' + line.line + ' does not have information about the itinerary coordinates.');
        return;
    }
   
   console.log('Loaded itinerary with ' + spots.length + ' spots.');

    var streetItinerary = new StreetIitinerary();
    console.log('Requesting reverse geocodes...');
    for (var spot of spots) {
        try {
            var streetName = findStreetName(spot); 
            var returning = spot.returning;
            
            if (streetName !== '') {
                var added = streetItinerary.add(streetName, returning);
                // console.log(streetName + (returning ? ' (returning)' : ''));
                // if (added) console.log('Partial itinerary: ', streetItinerary.streets);
            }
            else {
                console.log('[WARNING] Street name returned empty.');
            }  
        } catch (err) {
            console.log('[ERROR]', err);
            return;
        }
    }

    console.log('Done!\n', streetItinerary.streets);
    console.log('Requests: ' + requests);
    console.log('Skipped spots: ' + skipped);
    
    try {
        wait.for(RioBus.saveStreetItinerary, line, streetItinerary);
        console.log('Exported line ' + line.line + ' to database.')
    } catch (err) {
        console.log('Error exporting data.', err)
    }
}

function main() {
    wait.for(RioBus.connect);

    if (searchedLine) {
        console.log('Loading itinerary for line ' + searchedLine + '...');
        
        try {
            var line = wait.for(RioBus.findItineraryForLine, searchedLine, force);
            if (line) {
                console.log('Loaded.');
                processLine(line);
            } else {
                console.log('[ERROR] Could not find the line ' + searchedLine + ' or it has already got street information.');
            }
        } catch (err) {
            console.log('Could not load itinerary.', err);
            process.exit(1);
        }
        
        process.exit(0);
    }
    
    console.log('Loading all itineraries...');
    
    try {
        var allLines = wait.for(RioBus.findItineraries, force);
        console.log('Loaded ' + allLines.length + ' lines.');
        for (var line of allLines) {
            console.log('Processing line ' + line.line + '...');
            processLine(line);
        }
    } catch (err) {
        console.log('Error loading itineraries.', err);
    }
    
     process.exit(0);
}

wait.launchFiber(main);