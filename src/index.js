'use strict';
/* global process; */
const Core = require('./core');
const Database = Core.Database;
const LoggerFactory = Core.LoggerFactory;
const Config = require('./config');
const Itinerary = require('./model/itinerary.js');
const ItineraryDAO = require('./dao/itineraryDAO');
const ItineraryDownloader = require('./downloader/itineraryDownloader');
const MapUtils = require('./utils/mapUtils');
const spawn = require('co');

const logger = LoggerFactory.getRuntimeLogger();
const timeout = Config.provider.updateInterval;

var force;
var db, itineraryDAO, itineraries;

spawn(function*(){
    logger.info('Starting the server...');
    db = yield Database.connect();
    
    itineraryDAO = new ItineraryDAO(db);
    itineraries = prepareItineraries(yield itineraryDAO.getAll());
    logger.info(`Itineraries retrieved: ${Object.keys(itineraries).length}`);
    
    spawn(iteration);

})
.catch(function(error) {
    logger.fatal(error.stack);
    process.exit(1);
});

function* iteration() {
// for each available line
//      load and process itinerary for lines
    setTimeout(() => { spawn(iteration); }, timeout);
}

function prepareItineraries(itiList) {
    var itineraries = {};
    itiList.forEach( (itinerary) => {
        itineraries[itinerary.line] = itinerary;
    });
    return itineraries;
}

function* loadItinerary(line) {
    var tmpItinerary = itineraries[line];
    if(!tmpItinerary) {
        logger.alert(`[${line}] Itinerary not found. Downloading...`);
        try {
            tmpItinerary = yield ItineraryDownloader.fromLine(line);

            yield processItineraryStreets(tmpItinerary);
            
            logger.info(`[${line}] Saving Itinerary to database...`);
            yield itineraryDAO.save(tmpItinerary);
            logger.info(`[${line}] Itinerary saved.`);
            itineraries[line] = tmpItinerary;
        } catch(e) {
            if(e.statusCode===404) 
                logger.error(`[${line}] Itinerary does not exist.`);
            else if(e.statusCode===403)
                logger.error(`[${line}] Access forbidden to the Itinerary data.`);
            else logger.error(e.stack);
            
            tmpItinerary = new Itinerary(line);
            yield itineraryDAO.save(tmpItinerary);
            itineraries[line] = tmpItinerary;
        }
    }
    return tmpItinerary;
}

function* processItineraryStreets(itinerary) {
    var spots = itinerary.spots;
    if (spots.length == 0) {
        logger.alert('The line ' + itinerary.line + ' does not have information about the itinerary coordinates.');
        return;
    }
   
    logger.info('Loaded itinerary with ' + spots.length + ' spots.');

    logger.info('Requesting street names...');
    for (var spot of spots) {
        try {
            let streetName = yield MapUtils.streetNameFromCoordinates(spot);
            let returning = spot.returning;
            
            if (streetName !== '') {
                itinerary.addStreet(streetName, returning);
            } else {
                logger.alert('Street name returned empty.');
            }  
        } catch (err) {
            logger.error(err);
            return;
        }
    }
}

force = process.argv.indexOf('--force') > -1;
