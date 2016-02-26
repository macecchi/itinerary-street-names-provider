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
    provider: {
        host: 'dadosabertos.rio.rj.gov.br',
        path: {
            bus: {
                'REGULAR': '/apitransporte/apresentacao/rest/index.cfm/onibus',
                'BRT': '/apitransporte/apresentacao/rest/index.cfm/brt'
            },
            itinerary: '/apiTransporte/Apresentacao/csv/gtfs/onibus/percursos/gtfs_linha$$-shapes.csv'
        },
        updateInterval:	5000
    },
    OSRM: {
        host: process.env.RIOBUS_OSRM_HOST || 'localhost',
        port: process.env.RIOBUS_OSRM_PORT || 5000
    },
    logs: {
        runtime: '/tmp/riobus/log/runtime.log'
    }
};