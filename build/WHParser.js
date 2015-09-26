/// <reference path='typings/cheerio/cheerio.d.ts' />
/// <reference path='typings/q/Q.d.ts' />
/// <reference path='typings/leaflet/leaflet.d.ts' />
// using https://gist.github.com/kristopolous/19260ae54967c2219da8 as reference for parsing
var Config = require('./Config');
// why do it the hard way when someone already did the work for you?
var geocoder = require('simple-bing-geocoder');
var Q = require('q');
var qlimit = require('qlimit'); // no tsd for qlimit
var GeoPoint = (function () {
    function GeoPoint(lat, lon) {
        this.latitude = lat;
        this.longitude = lon;
    }
    GeoPoint.prototype.key = function () {
        return this.latitude.toString() + ":" + this.longitude.toString();
    };
    return GeoPoint;
})();
exports.GeoPoint = GeoPoint;
var WHEntry = (function () {
    function WHEntry(html) {
        var d = html.split(/(<p>|\n)/);
        this.header = d[0];
        this.html = html.replace(this.header, "");
    }
    return WHEntry;
})();
exports.WHEntry = WHEntry;
var WHParser = (function () {
    function WHParser(html, client, geocoderApiKey) {
        var _this = this;
        this.entries = [];
        this.MAX_GEOCODER_TRIES = 3;
        this.config = Config.readConfig();
        this.limit = qlimit(this.config.bing.max_connections);
        this.geocodeEntryPromise = Q.nbind(this.geocodeEntry, this);
        this.locationMap = {};
        this.cityStateRegex = /\b([A-Z]\w+(?:\s[A-Z]\w*)?,?\s?(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC|AB|BC|MB|NB|NL|NS|ON|PE|QC|SK))\b/;
        var cheerio = require('cheerio');
        this.html = html;
        this.nerClient = client;
        this.bingKey = geocoderApiKey;
        if (!html)
            return; // this is a case used for testing
        var $ = cheerio.load(this.html);
        $('.c5a,.cae,.c00,.c9c,.cdd,.c73,.c88').each(function (i, elem) {
            var entry = new WHEntry($(elem).html());
            _this.addEntry(entry);
        });
    }
    WHParser.prototype.geocodeEntries = function (callback) {
        var _this = this;
        Q.all(this.entries.map(this.limit(function (e) {
            return _this.geocodeEntryPromise(e);
        }))).done(function (values) {
            _this.entries.forEach(function (e) { return _this.addEntryToMap(e); });
            callback();
        });
    };
    // for testing
    WHParser.getEmptyInstance = function (client, geocoderApiKey) {
        var whp = new WHParser(null, client, null);
        whp.bingKey = geocoderApiKey;
        whp.html = null;
        return whp;
    };
    WHParser.prototype.geocodeEntry = function (entry, callback) {
        var _this = this;
        // first, try the simple city/state regex
        var locationName = null;
        var m = entry.header.match(this.cityStateRegex); //(/\b([\w\s]*?, \w\w)/);
        if (m) {
            locationName = m[0];
            entry.geoName = locationName;
            this.geocodeString(locationName, this.MAX_GEOCODER_TRIES, function (p) {
                entry.geolocation = p;
                callback();
            });
            return;
        }
        this.nerClient.query(entry.header.replace(/,\s?/, " "), function (entities) {
            var locations = entities.filter(function (e) { return e.isLocation; });
            var locationName = "NOWHERE";
            if (locations.length > 0) {
                locationName = locations[0].name;
                entry.geoName = locationName;
                if (entry.geoName.toLowerCase() == "bay area") {
                    // special case for HN; Bing geocodes this to Texas, but YC HN almost certainly means SF Bay Area
                    entry.geolocation = new GeoPoint(37.442548, -122.162158);
                    callback();
                    return;
                }
                _this.geocodeString(locationName, _this.MAX_GEOCODER_TRIES, function (p) {
                    entry.geolocation = p;
                    callback();
                });
            }
            else {
                entry.geolocation = null;
                callback();
            }
        });
    };
    WHParser.prototype.geocodeString = function (value, maxTries, callback) {
        var _this = this;
        try {
            if (maxTries < 0) {
                callback(null);
                return;
            }
            geocoder.geocode(value, function (err, data) {
                if (err != null) {
                    console.log("Retrying");
                    _this.geocodeString(value, maxTries - 1, callback);
                    return;
                }
                var rs = data.resourceSets[0];
                if (rs.estimatedTotal == 0) {
                    if (maxTries < 0) {
                        console.log("Failed for " + value);
                        callback(null);
                        return;
                    }
                    else {
                        _this.geocodeString(value, maxTries - 1, callback);
                        return;
                    }
                }
                // unpacking all the crap from Bing
                var coords = rs.resources[0].geocodePoints[0].coordinates;
                var p = new GeoPoint(coords[0], coords[1]);
                callback(p);
            }, { key: this.bingKey });
        }
        catch (ex) {
            if (maxTries < 0) {
                callback(null);
                return;
            }
            else {
                this.geocodeString(value, maxTries - 1, callback);
                return;
            }
        }
    };
    WHParser.prototype.addEntry = function (entry) {
        this.entries.push(entry);
        if (entry.geolocation == null)
            return;
        var entryList = this.locationMap[entry.geolocation.key()];
        if (!entryList) {
            entryList = [];
            this.locationMap[entry.geolocation.key()] = entryList;
        }
        entryList.push(entry);
    };
    WHParser.prototype.addEntryToMap = function (entry) {
        if (entry.geolocation == null)
            return;
        var entryList = this.locationMap[entry.geolocation.key()];
        if (!entryList) {
            entryList = [];
            this.locationMap[entry.geolocation.key()] = entryList;
        }
        entryList.push(entry);
    };
    return WHParser;
})();
exports.WHParser = WHParser;
//export = WHParser
//# sourceMappingURL=WHParser.js.map