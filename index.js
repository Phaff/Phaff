"use strict";

const ffi = require("ffi");
const path = require("path");
const assert = require("assert");
const ref = require("ref");
const StructType = require("ref-struct");

// Define a struct type with properties matching the order and type of the
// receiving struct type.
var Args = StructType({
    init: ref.types.uint32,
    by: ref.types.uint32
});

var lib = ffi.Library(path.join(__dirname, 'target/release/libphaff.dylib'), {
    "createCounter": [ "pointer", [ Args ] ],
    "destroyCounter": [ "void", [ "pointer" ] ],
    "getCounterValue": [ "uint32", [ "pointer" ] ],
    "incrementCounter": [ "uint32", [ "pointer" ] ],
    "decrementCounter": [ "uint32", [ "pointer" ] ]
});

class Counter {
    constructor(value) {

        var args =  new Args({init:value, by: 1});
        this.ptr = lib.createCounter(args);
    }

    get() {
        return lib.getCounterValue(this.ptr);
    }

    increment() {
        return lib.incrementCounter(this.ptr);
    }

    destroy() {
        lib.destroyCounter(this.ptr);
    }
}
var exports = module.exports = Counter;