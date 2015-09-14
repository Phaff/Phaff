"use strict";

const ffi = require('ffi');
const path = require('path');

module.exports = ffi.Library(path.join(__dirname, 'target/release/libphaff.dylib'), {
    hello_world: ['string', []]
});