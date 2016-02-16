'use strict';
class StreetItinerary {
    constructor() {
        this.streets = [];
        this.lastStreetCount = 0;
        this.lastStreet = '';
    }
    
    add(street, returning) {
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
module.exports = StreetItinerary;