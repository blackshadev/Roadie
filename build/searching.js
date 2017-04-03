"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collections_1 = require("./collections");
class State {
    constructor(data) {
        this.data = data;
        this.path = [];
        this.left = [];
    }
    get cost() { return this.path.length; }
    ;
    clone() {
        let s = new State(this.data);
        s.path = this.path.slice(0);
        s.left = this.left.slice(0);
        return s;
    }
    valueOf() {
        return this.cost;
    }
}
exports.State = State;
class GreedySearch {
    constructor() {
        this.nodes = new collections_1.SortedArray();
    }
    reset() {
        this.nodes.clear();
        this.nodes.addAll(this.initial());
    }
    first() {
        this.reset();
        return this.next();
    }
    next() {
        while (this.nodes.length > 0) {
            let state = this.nodes.items.shift();
            if (this.goal(state))
                return state;
            let arr = this.move(state);
            this.nodes.addAll(arr);
        }
        return;
    }
}
exports.GreedySearch = GreedySearch;
//# sourceMappingURL=searching.js.map