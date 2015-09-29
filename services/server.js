"use strict";
const http = require('http');

class WebServer {
    /**@Phaff
     * @name="phaff/webserver"
     */
    constructor() {
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

var exports = module.exports = WebServer;