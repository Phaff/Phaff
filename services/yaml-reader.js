"use strict";
const jsYaml = require('js-yaml');

class YamlReader {
    /**@Phaff
     * @name="Phaff/yamlReader"
     */

    loadYaml(input, options) {
        return new Promise((resolve, reject) => resolve(jsYaml.safeLoad(input, options)));
    }
}
var exports = module.exports = YamlReader;