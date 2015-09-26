/// <reference path='typings/node/node.d.ts' />
var net = require("net");
var NEREntity = (function () {
    function NEREntity() {
    }
    return NEREntity;
})();
exports.NEREntity = NEREntity;
var NERClient = (function () {
    function NERClient(port, host) {
        this.reEntString = /(.*?)\/(.*)$/;
        this.port = port;
        this.host = host;
    }
    NERClient.prototype.processResults = function (result) {
        var _this = this;
        var entities = result.trim().split(/\s+/).map(function (value) {
            var e = new NEREntity();
            var m = value.match(_this.reEntString);
            if (m === null || m.length != 3) {
                throw "Invalid input from NER";
            }
            if (m[2] === "LOCATION") {
                e.isLocation = true;
            }
            else {
                e.isLocation = false;
            }
            e.name = m[1];
            return e;
        });
        var coalescedEntities = new Array();
        var wasLocation = false;
        entities.forEach(function (e, ix) {
            if (ix != 0 && e.isLocation && coalescedEntities[coalescedEntities.length - 1].isLocation) {
                var previous = coalescedEntities.pop();
                previous.name = previous.name + " " + e.name;
                coalescedEntities.push(previous);
            }
            else {
                coalescedEntities.push(e);
            }
        });
        return coalescedEntities;
    };
    NERClient.prototype.query = function (text, callback) {
        var _this = this;
        if (text[text.length - 1] != "\n") {
            text = text + "\n";
        }
        var client = net.connect({ port: this.port, host: this.host, function: function () { client.write(text + "\n"); } });
        var result = null;
        client.on("data", function (data) {
            var queryResult = data.toString();
            callback(_this.processResults(queryResult));
        });
        client.on("end", function () {
        });
        client.write(text);
        return;
    };
    // Stole this from here: http://stackoverflow.com/questions/280634/endswith-in-javascript
    NERClient.prototype.endsWith = function (input, suffix) {
        return input.indexOf(suffix, input.length - suffix.length) !== -1;
    };
    return NERClient;
})();
exports.NERClient = NERClient;
//# sourceMappingURL=NERClient.js.map