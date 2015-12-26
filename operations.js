/* global process; */
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var Config = require('./config');

/**
 * Connect to database.
 */
function connect(callback) {
	var config = Config.database;
	var url = `${config.host}:${config.port}/${config.dbName}`;
	if (config.user!=='' && config.pass!=='') url = `${config.user}:${config.pass}@${url}`;
	url = 'mongodb://' + url;
	MongoClient.connect(url, function(err, db) { callback(err, db); });
}

/**
 * Finds itinerary for the specified bus line.
 */
function findItinerary(db, line, callback) {
	var cursor = db.collection(Config.schema.itineraryCollection).find({ "line": line });
	var spots = [];

	cursor.each(function(err, doc) {
		assert.equal(err, null);
		if (doc != null) {
			spots = doc.spots;
		} else {
			callback(spots);
		}
	});
};

module.exports = {
	connect: connect,
	findItinerary: findItinerary
};