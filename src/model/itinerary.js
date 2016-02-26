'use strict';
/**
 * Describes a Itinerary instance
 * @class {Itinerary}
 */
class Itinerary {
	
	constructor(line, description, agency, keywords, spots, streets) {
		this.line = (!line || line==='')? 'indefinido' : line.toString();
		this.description = (!description || description==='')? 'desconhecido' : description;
		this.agency = agency || '';
		this.keywords = keywords || '';
		this.spots = spots || [];
		this.streets = streets || [];
        this.lastStreetCount = 0;
        this.lastStreet = '';
	}
    
    addStreet(street, returning) {
        if (this.lastStreet === street) {
            this.lastStreetCount++;
            if (this.lastStreetCount == 4) {
                var lastAddedStreet = this.streets[this.streets.length - 1];
                if (this.streets.length == 0 || lastAddedStreet.location != street || lastAddedStreet.returning != returning) {
                    this.streets.push({ location: street, returning: returning });
                    return true;
                }
            }
        }
        else {
            this.lastStreet = street;
            this.lastStreetCount = 1;
        }

        return false;
    }
}
module.exports = Itinerary;