'use strict';
const Config   = require('../config');
const Core     = require('../core');
const Http     = Core.Http;

const logger   = Core.LoggerFactory.getRuntimeLogger();

var reverseGeocodeCache = {};

/**
 * Map helper functions
 * @class {MapUtils}
 */
class MapUtils {
    
    /**
     * Receives a coordinates object with latitude and longitude and returns
     * the street name corresponding to the coordinates.
     * @param {object} coordinates - Object containing a latitude and a longitude property
     * @return {Promise}
     */
    static streetNameFromCoordinates(coordinates) {
        return MapUtils.reverseGeocodeOSRM(coordinates);
    }

    /**
     * Find the street name using a coordinate using the Open Street Routing Machine API.
     * @param {object} coordinates - Object containing a latitude and a longitude property
     * @return {Promise}
     */
    static reverseGeocodeOSRM(coordinates) {
        var latlng = coordinates.latitude + ',' + coordinates.longitude;
        
        var streetFromCache = this.loadReverseGeocodeFromCache(latlng);
        if (streetFromCache) {
            return Promise.resolve(streetFromCache).then( (value) => {
                return value;
            });
        }
        
        var OSRM = Config.OSRM;
        var url = `http://${OSRM.host}:${OSRM.port}/nearest?loc=${latlng}`;
        
        return Http.get(url).then( (response) => {
            const status = response.statusCode;
            switch(status) {
                case 200:
                    // logger.info(`[${url}] -> 200 OK`);
                    var streetName = response.body.name;
                    this.addReverseGeocodeToCache(latlng, streetName);
                    return streetName;
                default:
                    logger.error(`[${url}] -> ${status} ERROR: ${response.toString()}`);
                    break;
            }
            return null;
        }).catch(function (err) {
            logger.error(`[${url}] -> ERROR: ${err.error.code}`);
            return null;
        });
    }
    
    static loadReverseGeocodeFromCache(latlng) {
        // let value = reverseGeocodeCache[latlng];
        // if (value) console.log('Cache hit');
        // return value;
        return reverseGeocodeCache[latlng];
    }
    
    static addReverseGeocodeToCache(latlng, streetName) {
        reverseGeocodeCache[latlng] = streetName;
        // console.log('Cache miss. Cache size: ' + Object.keys(reverseGeocodeCache).length);
    }
}
module.exports = MapUtils;