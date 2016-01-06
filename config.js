/* global process; */
/**
 * Application configuration
 * You may use it to describe every global configuration data
 */
module.exports = {
    database: {
        dbName: process.env.NODEJS_DB_NAME  || 'nodejs',
        host: process.env.NODEJS_DB_HOST    || 'localhost',
        port: process.env.NODEJS_DB_PORT    || 27017,
        user: process.env.NODEJS_DB_USER    || '',
        pass: process.env.NODEJS_DB_PASS    || ''
    },
    schema: {
        itineraryCollection: 'itinerary'
    },
    GoogleMaps: {
        key: 'AIzaSyBipo-V2cBGUWLbfwEcihDx5H8ZO89upuE'
    },
    OSRM: {
        base_url: 'http://146.164.16.5:5000'
    }
};