/// <reference path="../typings/cheerio/cheerio.d.ts" />
/// <reference path="../typings/q/Q.d.ts" />
/// <reference path="../typings/leaflet/leaflet.d.ts" />
import NC = require('./NERClient');
export declare class GeoPoint {
    latitude: number;
    longitude: number;
    constructor(lat: number, lon: number);
    key(): string;
}
export declare class WHEntry {
    html: string;
    header: string;
    geolocation: GeoPoint;
    geoName: string;
    parent: WHParser;
    constructor(html: string);
}
export declare class WHParser {
    html: string;
    entries: Array<WHEntry>;
    nerClient: NC.NERClient;
    bingKey: string;
    MAX_GEOCODER_TRIES: number;
    config: any;
    limit: any;
    geocodeEntryPromise: any;
    locationMap: {};
    cityStateRegex: RegExp;
    constructor(html: string, client: NC.NERClient, geocoderApiKey: string);
    geocodeEntries(callback: () => void): void;
    static getEmptyInstance(client: NC.NERClient, geocoderApiKey: string): WHParser;
    geocodeEntry(entry: WHEntry, callback: () => void): void;
    geocodeString(value: string, maxTries: number, callback: (GeoPoint) => void): void;
    addEntry(entry: WHEntry): void;
    addEntryToMap(entry: WHEntry): void;
}
