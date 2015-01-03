/** Astar.js
 *  Author: Vincent Hagen
 *  Uses:
 *   - Arrays.js : SortedArray.js
 *  
 *  A js implementation of the Astar search algorithm.
 *
 *  AStar is a search algorithm that searches over the states as follows.
 *  Each state has a cost, it has cost to go to that state from the start ~g(x) 
 *  and a estimate function which estimates the cost from that state to a goal
 *  state ~h(x). The combined function ~f(x) = g(x) + h(x). Is how AStar chooses
 *  which states to expant. A imported note is that the estimate may not be 
 *  higher than the actual cost from a state to the goal state.
 */

module.exports = (function($o) {
    var SortedArray = require("./Arrays.js").SortedArray;

    /* A bare implementation of a State within a search space */
    var State = $o.Object.extend({
        path: null, // Path taken to get to this state
        left: null, // Steps "left" to take, an array like user defined data
        data: null, // user defined, watch out for changes by reference
        cost: 0, // Cost to come from the beginning to this state 
        create: function() { this.path = []; this.left = []; },
        // Returns a new State with all data copied
        clone: function() {
            var n = new State();

            n.path = this.path.slice(0);
            n.left = this.left.slice(0);
            n.data = this.data;

            n.cost = this.cost;

            return n;
        }
    });

    // Actual implementation of the AStar search algorithm 
    var AStar = $o.Object.extend({
        stateClass: State,
        // -- UserDefined
        // returns the cost of a state
        cost: function(state) { return this.left.length + this.path.length; /* f(x) = g(x) + h(x) */ },
        // returns true when the goal is reached
        goal: function(state) { return true; },
        // Returns the new states possible from given state
        move: function(state) {
            return [];
        },
        // returns the initial states
        initial: function() {
            return [];
        },
        // -- Privates
        nodes: null, // A sorted array of nodes
        create: function(oPar) {
            this.nodes = new SortedArray({
                key: function(i) { return i.cost; }
            });

            $o.extend(this, oPar);

            this.reset();
        },
        // Returns the next found goal state
        next: function() {
            while(this.nodes.array.length) {
                // The nodes are sorted on the cost (in our case is f(x))
                var state = this.nodes.array.shift();
                if(this.goal(state)) return state;

                // Advances the state
                var arr = this.move(state);

                var self = this;
                arr.forEach(function(e) { e.cost = self.cost(e); });

                // Add the new states to our array of states
                this.nodes.addAll(arr);
            }

            // No more states to explorer
            return false;
        },
        // Resets by clearing the nodes and adding the initial states
        reset: function() {
            this.nodes.array.length = 0;
            this.nodes.addAll(this.initial());
        }
    });

    return { AStar: AStar, State: State };
})(require("./core.js"));