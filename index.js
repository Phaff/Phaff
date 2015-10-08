"use strict";

const http = require("http");
const path = require("path");
const yamlReader = require('js-yaml');
const fs = require('fs');

const DependencyInjection = require('./services/dependency-injection.js');

class Phaff {
    constructor() {
        this.dependencyInjection = new DependencyInjection();
    }

    initConfig() {
        let self = this;
        return new Promise((resolve, reject) => {
            self.dependencyInjection.getService('Phaff/Config')
            .then(
                (config) => config.readDirectory(path.join(__dirname, 'config'))
            )
            .then(
                () => self.dependencyInjection.getService('Phaff/Config')
            )
            .then(
                (config) => self.dependencyInjection.mapAlias(config.get('service_aliases'))
            )
            .then(resolve, reject);
        });
    }

    initServices() {
        return this.dependencyInjection.registerDirectory(path.join(__dirname, 'services'));
    }

    getService(name) {
        return this.dependencyInjection.getService(name);
    }

    newServer(config) {
        config = config || this.config;
        return new Promise((resolve, reject) => {
            resolve(new PhaffServer(config));
        });
    }
}

var exports = module.exports = Phaff;