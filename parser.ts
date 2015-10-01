/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/request/request.d.ts' />
/// <reference path='typings/js-yaml/js-yaml.d.ts' />
import WHP = require('./WHParser');
import request = require('request');
import NERClient = require('./NERClient')
import Config = require('./Config')
import yaml = require('js-yaml');
import fs = require('fs');


var config: any = Config.readConfig();
var hnUrl: string = config.input.url;
var nc: NERClient.NERClient = new NERClient.NERClient(config.ner.port, config.ner.host);

request.get(hnUrl, (error, response, body) => {
	console.log("1111");
	var html: string = body.toString();
	console.log("2222");
	var whp: WHP.WHParser = new WHP.WHParser(html, nc, config.bing.key);
	console.log("3333");
	whp.geocodeEntries(() => {
		console.log("Foobar");
		console.log(config.output.filename);
//		var geocodedEntries: WHP.WHEntry[] = whp.entries.filter((e) => { return e.geolocation != null; });
		fs.writeFile(config.output.filename, "window.entryData = " + JSON.stringify(whp.locationMap), (err) => {
			console.log("quux");
			if (err) { throw "WTF?" }
		});

	});

});
