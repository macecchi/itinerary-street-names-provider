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
     */
    findItineraryForLine: function (line, callback) {
        db.collection(Config.schema.itineraryCollection).findOne({ "line": line }, callback);
    },
    
    /**
     * Finds all the itineraries.
     */
    findItineraries: function (callback) {
        var cursor = db.collection(Config.schema.itineraryCollection).find({});
        var lines = [];

        cursor.each(function(err, doc) {
            assert.equal(err, null);
            if (doc != null) {
                lines.push(doc);
            } else {
                callback(err, lines);
            }
        });
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