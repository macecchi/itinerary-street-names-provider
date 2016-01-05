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

function addToItinerary(street) {
    if (streets.length > 0 && streets[streets.length-1] === street) {
        return false;
    }
    
    streets.push(street);
    return true;
}

function main() {
    wait.for(RioBus.connect);

    console.log('Loading itinerary information...');
    var spots = wait.for(RioBus.findItinerary, searchedLine);
    console.log('Loaded itinerary.');

    for (var spot of spots) {
        var result = wait.for(Maps.reverseGeocode, spot);

        if (result.status == 'OK') {
            var streetName = result.results[0].address_components[1].short_name;
            var added = addToItinerary(streetName);
                console.log(streetName);
            
        } else {
            console.log('Error', result);
        }
    }
}

wait.launchFiber(main);