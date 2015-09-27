"use strict";

const http = require("http");
const path = require("path");
const yamlReader = require('js-yaml');
const fs = require('fs');

class PhaffServer {
    constructor(config) {
        this.routes = new Set();
        let self = this;
        this.server = http.createServer((request, response) => {
            //The router
            //@Todo : Find a way to split this in a method of PhaffServer
            var rails = {
                request: request,
                response: response
            };

            for (let route of self.routes) {
                if (route.paths.indexOf(request.url) > -1 && route.methods.indexOf(request.method) > -1) {
                    route(rails)
                }
            }
        });
    }

    registerRoute(fn) {
        var self = this;

        if (typeof fn.paths === 'undefined' || fn.paths.length < 1) {
            throw ("You must define a path (in paths)");
        }
        if (typeof fn.methods === 'undefined' || fn.methods.length < 1) {
            throw ("You must define a method (in methods)");
        }

        self.routes.add(fn);
    }

    listen(port) {
        port = port || 8080;
        this.server.listen(port);
    }
}

class Config {
    constructor() {
        this.configs = {};
    }

    readDirectory(dirPath) {
        let self = this;
        return new Promise((resolve, reject) => {
            fs.readdir(dirPath, function(err, files) {
                if (err) {
                    throw err;
                }
                var promises = [];
                files.forEach(function(file) {
                        promises.push(self.read(path.join(dirPath, file)));
                });
                Promise.all(promises).then(resolve, reject);
            });
        });
    }

    read(filePath) {
        let self = this;
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, function(err, content) {
                if (err) {
                    return reject(err);
                }
                let doc = {};
                try {
                    doc = yamlReader.safeLoad(content);
                } catch (e) {
                    console.log(e);
                }
                self.merge(doc);
                resolve();
            });
        });
    }

    merge(objectToMerge) {
        Config.mergeObjects(this.configs, objectToMerge);
    }

    get() {
        return this.configs;
    }

    /**
     * Thanks http://stackoverflow.com/a/383245/3093321
     * @Todo refactor with Object.assign
     */
    static mergeObjects(obj1, obj2) {
        for (let p in obj2) {
            if (obj2.hasOwnProperty(p)){
                try {
                    // Property in destination object set; update its value.
                    if ( obj2[p].constructor == Object ) {
                        obj1[p] = Config.mergeObjects(obj1[p], obj2[p]);

                    } else {
                        obj1[p] = obj2[p];

                    }

                } catch(e) {
                    // Property in destination object not set; create it and set its value.
                    obj1[p] = obj2[p];

                }
            }
        }
        return obj1;
    }
}

class Phaff {
    constructor() {
        this.config = new Config();
    }

    readFrameworkConfig() {
        return this.config.readDirectory(path.join(__dirname, 'config'));
    }

    newServer(config) {
        config = config || this.config;
        return new Promise((resolve, reject) => {
            resolve(new PhaffServer(config));
        });
    }
}

var exports = module.exports = Phaff;