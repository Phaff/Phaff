"use strict";
const nunjucks = require('nunjucks');

class TwigParser {
    /**@Phaff
     * @name="Phaff/TwigParser"
     */

    render(name, options) {
        return new Promise(
            (resolve, reject) => nunjucks.render(name, options, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(res);
            })
        );
    }
}
var exports = module.exports = TwigParser;