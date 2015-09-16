"use strict";

const ffi = require("ffi");
const path = require("path");
const ref = require("ref");
const StructType = require("ref-struct");

var lib = ffi.Library(path.join(__dirname, 'target/release/libphaff.dylib'), {
});

var exports = module.exports = null;