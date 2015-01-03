/** Arrays.js
 *  Author: Vincent Hagen
 *  
 *  Some Array implementation which aren't default present in js
 */

module.exports = (function() {
    var $o = require("./core.js");

    /* A simple sorted array, all elements in array property are sorted 
        with the given key function on a ascending order. */
    var SortedArray = $o.Object.extend({
        array: null,
        // function used to key the value to sort upon
        key: function(i) { return i; },
        create: function(oPar) {
            $o.extend(this, oPar);

            this.array = [];
        },
        /* Binary searchest the given value, returns the index within the array
         When the exact value is not present it returns the index where the 
         given value sould be inserted -- the last index where the given value 
         is lower than the item's. */ 
        search: function(val) {
            var a = this.array;
            var l = 0, h = a.length - 1;
            var m;

            while(l <= h) {
                // mid = (low + high) / 2
                m = (l + h) >> 1;
                v = this.key(a[m]);

                if(v < val)
                    l = m + 1;
                else if(v > val)
                    h = m - 1;
                else
                    return m;                
            }

            return l;
        },
        /* Inserts an item into the SortedArray on the correct position.
            Returns the position where the item is inserted */
        add: function(item) {
            var iX = this.search( this.key(item) );

            this.array.splice(iX, 0, item);

            return iX;
        },
        /* Adds all items given in items into the sorted array.
            Returns an array */
        addAll: function(items) {
            for(var iX = 0; iX < items.length; iX++)
                this.add(items[iX]);
        }
    });

    return { SortedArray: SortedArray };
})();