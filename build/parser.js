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
    console.log("1111");
    var html = body.toString();
    console.log("2222");
    var whp = new WHP.WHParser(html, nc, config.bing.key);
    console.log("3333");
    whp.geocodeEntries(function () {
        console.log("Foobar");
        console.log(config.output.filename);
        //		var geocodedEntries: WHP.WHEntry[] = whp.entries.filter((e) => { return e.geolocation != null; });
        fs.writeFile(config.output.filename, "window.entryData = " + JSON.stringify(whp.locationMap), function (err) {
            console.log("quux");
            if (err) {
                throw "WTF?";
            }
        });
    });
});
//# sourceMappingURL=parser.js.map