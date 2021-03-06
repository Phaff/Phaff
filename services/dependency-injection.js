"use strict";

let fs = require('fs');
let path = require('path');
let FunctionUtils = require('../utils/Function.js');

//This symbol is to insure the privacy of options.
const optionsSymbol = Symbol('DependencyOptions');
const uniqInstanceSymbol = Symbol('uniqInstance');

class DependencyInjection {
    /**@Phaff
     * @name="Phaff/DIC"
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
                return self.instantiateService(service).then(resolve, reject);
            }
            //So we want a singleton.
            if ('undefined' === typeof service[uniqInstanceSymbol]) {
                self.instantiateService(service).then((singleton) => {
                    service[uniqInstanceSymbol] = singleton;
                    return resolve(singleton);
                });
                return;
            }
            resolve(service[uniqInstanceSymbol]);
        });
    }

    getClass(name) {
        let self = this;
        return new Promise((resolve, reject) => {
            if (!self.services.has(name)) {
                return reject(`Service "${name}" not exists.`);
            }
            let service = self.services.get(name);
            resolve(service);
        });
    }

    static serviceDependenciesInjector() {
        var service = arguments[0];
        return new (service.bind.apply(service, arguments))();
    }


    instantiateService(service) {
        let self = this;
        return new Promise((resolve, reject) => {
            if (service[optionsSymbol].has('dependencies')) {
                Promise
                    .all(
                        service[optionsSymbol]
                            .get('dependencies')
                            .map((name) => self.getService(name))
                    ).then(
                        (dependencies) => DependencyInjection.serviceDependenciesInjector(service, dependencies) //@todo: find better way
                    )
                    .then(resolve, reject);
            } else {
                var object = new service();
                resolve(object);
            }
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

    mapAlias(services) {
    let self = this;
    let chainedPromise = new Promise((resolve) => resolve());
    Object.keys(services).forEach((key) => {
        if (services.hasOwnProperty(key)) {
            chainedPromise = chainedPromise
                .then(() => self.getClass(services[key]))
                .then((service) => self.register(key, service));
        }
    });
    return chainedPromise;
}

    //
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
