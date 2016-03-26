"use strict";
var collections_1 = require("./collections");
var State = (function () {
    function State(data) {
        this.data = data;
        this.path = [];
        this.left = [];
    }
    Object.defineProperty(State.prototype, "cost", {
        get: function () { return this.path.length; },
        enumerable: true,
        configurable: true
    });
    ;
    State.prototype.clone = function () {
        var s = new State(this.data);
        s.path = this.path.slice(0);
        s.left = this.left.slice(0);
        return s;
    };
    State.prototype.valueOf = function () {
        return this.cost;
    };
    return State;
}());
exports.State = State;
var GreedySearch = (function () {
    function GreedySearch() {
        this.nodes = new collections_1.SortedArray();
    }
    GreedySearch.prototype.reset = function () {
        this.nodes.clear();
        this.nodes.addAll(this.initial());
    };
    GreedySearch.prototype.first = function () {
        this.reset();
        return this.next();
    };
    GreedySearch.prototype.next = function () {
        while (this.nodes.length > 0) {
            var state = this.nodes.items.shift();
            if (this.goal(state))
                return state;
            var arr = this.move(state);
            this.nodes.addAll(arr);
        }
        return;
    };
    return GreedySearch;
}());
exports.GreedySearch = GreedySearch;
//# sourceMappingURL=searching.js.map