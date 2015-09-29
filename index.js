"use strict";

const http = require("http");
const path = require("path");
const yamlReader = require('js-yaml');
const fs = require('fs');

const DependencyInjection = require('./services/dependency-injection.js');

class Phaff {
    constructor() {
        //this.config = new Config();
        this.dependencyInjection = new DependencyInjection();
    }

    initConfig() {
        return new Promise((resolve)=>resolve()); //this.config.readDirectory(path.join(__dirname, 'config'));
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