"use strict";
var assert = require('assert');
var collections_1 = require('../collections');
describe("SortedArray", function () {
    var rnd = function () { return Math.random() * 512; };
    var checkArray = function (arr) {
        var last = arr.getItem(0);
        for (var i = 0; i < arr.length; i++) {
            var item = arr.getItem(i);
            assert.ok(item >= last, "Sorted array failed on " + item + " > " + last);
            last = item;
        }
    };
    it("Simple", function () {
        var arr = new collections_1.SortedArray();
        arr.add(5);
        arr.add(1);
        arr.add(9);
        arr.add(19);
        checkArray(arr);
    });
    it("Random", function () {
        var arr = new collections_1.SortedArray();
        for (var i = 0; i < 512; i++) {
            arr.add(rnd());
        }
        checkArray(arr);
    });
    it("OnInit", function () {
        var arr = [8, 1, 19, 98, 5, -47, 1];
        for (var i = 0; i < 512; i++) {
            arr.push(rnd());
        }
        var sArr = new collections_1.SortedArray(arr);
        checkArray(sArr);
    });
});
//# sourceMappingURL=collections.js.map