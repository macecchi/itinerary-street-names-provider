/* global process; */
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var Config = require('./config');

module.exports = {
    db: null,
    
    /**
     * Connect to database.
     */
    connect: function (callback) {
        var config = Config.database;
        var url = `${config.host}:${config.port}/${config.dbName}`;
        if (config.user!=='' && config.pass!=='') url = `${config.user}:${config.pass}@${url}`;
        url = 'mongodb://' + url;
        MongoClient.connect(url, function(err, _db) { this.db = _db; callback(err, _db); });
    },

    /**
     * Finds itinerary for the specified bus line.
     */
    findItinerary: function (line, callback) {
        var cursor = this.db.collection(Config.schema.itineraryCollection).find({ "line": line });
        var spots = [];

        cursor.each(function(err, doc) {
            assert.equal(err, null);
            if (doc != null) {
                spots = doc.spots;
            } else {
                callback(err, spots);
            }
        });
    }
};