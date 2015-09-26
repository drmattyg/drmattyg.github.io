var fs = require('fs');
var yaml = require('js-yaml');
function readConfig() {
    return readConfigFromFile('./conf/config.yml');
}
exports.readConfig = readConfig;
function readConfigFromFile(filename) {
    return yaml.safeLoad(fs.readFileSync(filename, 'utf8'));
}
exports.readConfigFromFile = readConfigFromFile;
//# sourceMappingURL=Config.js.map