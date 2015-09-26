/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/request/request.d.ts' />
/// <reference path='typings/js-yaml/js-yaml.d.ts' />
var WHP = require('./WHParser');
var request = require('request');
var NERClient = require('./NERClient');
var Config = require('./Config');
var fs = require('fs');
var config = Config.readConfig();
var hnUrl = config.input.url;
var nc = new NERClient.NERClient(config.ner.port, config.ner.host);
request.get(hnUrl, function (error, response, body) {
    var html = body.toString();
    var whp = new WHP.WHParser(html, nc, config.bing.key);
    whp.geocodeEntries(function () {
        //		var geocodedEntries: WHP.WHEntry[] = whp.entries.filter((e) => { return e.geolocation != null; });
        fs.writeFile(config.output.filename, "window.entryData = " + JSON.stringify(whp.locationMap), function (err) {
            if (err) {
                throw "WTF?";
            }
        });
    });
});
//# sourceMappingURL=parser.js.map