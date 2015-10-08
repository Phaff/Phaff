"use strict";
const fs = require('fs');
const path = require('path');
const yamlReaderPrivate = Symbol('yamlReader');

class Config {
    /**@Phaff
     * @name="Phaff/Config"
     * @dependencies=["Phaff/YamlParser"]
     * @isSingleton
     */
    constructor(dependencies) {
        this[yamlReaderPrivate] = dependencies.shift();
        this.configs = {};
    }

    readDirectory(dirPath) {
        let self = this;
        return new Promise((resolve, reject) => {
            fs.readdir(dirPath, function(err, files) {
                if (err) {
                    reject(err);
                    return;
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
                self[yamlReaderPrivate].loadYaml(content)
                    .then(
                        (doc) => {
                            self.merge(doc);
                        },
                        (err) => console.log(err)
                    )
                    .then(resolve, reject);
            });
        });
    }

    merge(objectToMerge) {
        Config.mergeObjects(this.configs, objectToMerge);
    }

    get(selector) {
        if ("undefined" === typeof selector) {
            return this.configs;
        }

        var arr = selector.split(".");
        while(arr.length && (this.configs = this.configs[arr.shift()]));
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

var exports = module.exports = Config;
