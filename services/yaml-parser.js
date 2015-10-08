"use strict";
const jsYaml = require('js-yaml');

class YamlParser {
    /**@Phaff
     * @name="Phaff/YamlParser"
     */

    loadYaml(input, options) {
        return new Promise((resolve, reject) => resolve(jsYaml.safeLoad(input, options)));
    }
}
var exports = module.exports = YamlParser;