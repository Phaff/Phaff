"use strict";

let fs = require('fs');
let path = require('path');
let FunctionUtils = require('../utils/Function.js');

//This symbol is to insure the privacy of options.
const optionsSymbol = Symbol('DependencyOptions');
const uniqInstanceSymbol = Symbol('uniqInstance');

class DependencyInjection {
    /**@Phaff
     * @name="phaff/dic"
     * @isSingleton
     */
    constructor() {
        this.services = new Map();
    }

    getService(name) {
        let self = this;
        return new Promise((resolve, reject) => {
            if (!self.services.has(name)) {
                return reject(`Service "${name}" not exists.`);
            }
            let service = self.services.get(name);
            if (!service[optionsSymbol].has('isSingleton') || false === service[optionsSymbol].get('isSingleton')) {
                return DependencyInjection.instantiateService(service).then(resolve, reject);
            }
            //So we want a singleton.
            if ('undefined' === typeof service[uniqInstanceSymbol]) {
                return DependencyInjection.instantiateService(service).then((singleton) => {
                    service[uniqInstanceSymbol] = singleton;
                    return singleton;
                });
            }
            //Else, return singleton
            resolve(service[uniqInstanceSymbol]);
        });
    }

    static instantiateService(service) {
        return new Promise((resolve, reject) => {
            resolve(new service());
        });
    }

    registerDirectory(dirPath) {
        let self = this;

        return new Promise((resolve, reject) => {
            fs.readdir(dirPath, function(err, files) {
                if (err) {
                    throw err;
                }
                var promises = [];
                files.forEach(function(file) {
                    promises.push(self.registerFile(path.join(dirPath, file)));
                });
                Promise.all(promises).then(resolve, reject);
            });
        });
    }



    registerFromString(name, serviceString) {
        if (serviceString.startsWith('alias:')) {
            //Cut alias:
            serviceString = serviceString.substring(6);
            this.register(name, this.getService(serviceString));
            return;
        }

        if (serviceString.startsWith('@')) {
            let object;
            try {
                object = require(serviceString.substring(1));
            } catch (e) {
                console.log(`Service ${name} <-> ${serviceString}`);
            }
            return;
        }



        this.register(name, service);
    }

    registerFile(path) {
        var service = require(path);
        service[optionsSymbol] = FunctionUtils.getPhaffAnnotations(service);
        let name = service[optionsSymbol].get('name') || service.name;
        if (typeof name === 'undefined') {
            throw 'Service name should be defined !';
        }
        this.register(name, service);
    }



    register(name, service) {
        this.services.set(name, service);
    }
}

var exports = module.exports = DependencyInjection;
