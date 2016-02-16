/* global process; */
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var Config = require('./config');

var db;

module.exports = {    
    /**
     * Connect to database.
     */
    connect: function (callback) {
        var config = Config.database;
        var url = `${config.host}:${config.port}/${config.dbName}`;
        if (config.user!=='' && config.pass!=='') url = `${config.user}:${config.pass}@${url}`;
        url = 'mongodb://' + url;
        MongoClient.connect(url, function(err, _db) { 
            db = _db; callback(err);
        });
    },

    /**
     * Finds itinerary for the specified bus line.
     * @param {boolean} force - Force conversion of itinerary even if the line already
     * has a street itinerary.
     */
    findItineraryForLine: function (line, force, callback) {
        var itineraryCollection = db.collection(Config.schema.itineraryCollection);
        var searchParams = force ? { "line": line } : { "line": line, "streets": [] };
        itineraryCollection.find(searchParams).limit(1).next(callback);
    },
    
    /**
     * Finds all the itineraries that do not have a street itinerary defined or all
     * if force` is specified.
     * @param {boolean} force - Force conversion of itinerary for lines that already
     * have a street itinerary.
     */
    findItineraries: function (force, callback) {
        var itineraryCollection = db.collection(Config.schema.itineraryCollection);
        var searchParams = force ? {} : { "streets": [] };
        itineraryCollection.find(searchParams).toArray(callback);
    },
    
    
    /**
     * Save street itinerary on database.
     */
    saveStreetItinerary: function (line, streetItinerary, callback) {
        db.collection(Config.schema.itineraryCollection).updateOne(
            { "line": line.line },
            {
                "$set": { "streets": streetItinerary.streets }
            },
            callback
        );
    }
    
};