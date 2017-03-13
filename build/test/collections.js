"use strict";
const assert = require("assert");
const collections_1 = require("../collections");
describe("SortedArray", () => {
    let rnd = () => Math.random() * 512;
    let checkArray = (arr) => {
        let last = arr.getItem(0);
        for (let i = 0; i < arr.length; i++) {
            const item = arr.getItem(i);
            assert.ok(item >= last, "Sorted array failed on " + item + " > " + last);
            last = item;
        }
    };
    it("Simple", () => {
        let arr = new collections_1.SortedArray();
        arr.add(5);
        arr.add(1);
        arr.add(9);
        arr.add(19);
        checkArray(arr);
    });
    it("Random", () => {
        let arr = new collections_1.SortedArray();
        for (let i = 0; i < 512; i++) {
            arr.add(rnd());
        }
        checkArray(arr);
    });
    it("OnInit", () => {
        let arr = [8, 1, 19, 98, 5, -47, 1];
        for (let i = 0; i < 512; i++) {
            arr.push(rnd());
        }
        let sArr = new collections_1.SortedArray(arr);
        checkArray(sArr);
    });
});
//# sourceMappingURL=collections.js.map