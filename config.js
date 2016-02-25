/* global process; */
/**
 * Application configuration
 * You may use it to describe every global configuration data
 */
module.exports = {
    database: {
        dbName: process.env.RIOBUS_DB_NAME  || 'nodejs',
        host: process.env.RIOBUS_DB_HOST    || 'localhost',
        port: process.env.RIOBUS_DB_PORT    || 27017,
        user: process.env.RIOBUS_DB_USER    || '',
        pass: process.env.RIOBUS_DB_PASS    || ''
    },
    schema: {
        itineraryCollection: 'itinerary'
    },
    GoogleMaps: {
        key: 'AIzaSyBipo-V2cBGUWLbfwEcihDx5H8ZO89upuE'
    },
    OSRM: {
        host: process.env.RIOBUS_OSRM_HOST   || 'localhost',
        port: process.env.RIOBUS_OSRM_PORT   || 5000
    }
};