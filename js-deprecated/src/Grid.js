const uncached = require('../utils/uncached.js');
const types = uncached('../interactions/interactions.js');
const Particle = uncached ( '../src/Particle.js' );

function getCell ( cells, store, row, col ) {
    let id = ( row << 16 ) | ( col & 65535 ),
        cell = cells [ id ],
        // only create a new array if we need one
        arry = cell ? cell : store.length ? store.pop () : [];

    // insert the new array if this cell was unoccupied
    // otherwise the current one is reused
    if ( cell !== arry ) {
        cells [ id ] = arry;
        arry [ 0 ] = 0;
    }
    return arry;
}

function push ( arry, item ) {
    let index = arry [ 0 ] + 1;
    arry [ 0 ] = index;
    arry [ index ] = item;
}

module.exports = class Grid {
    constructor ( cellSize ) {
        this.cellSize = cellSize;       // the width/height of each grid cell
        this.cells = {};                // maps cell ids to collision arrays
        this.store = [];                // for keeping/recycling collision arrays
    }

    get size () {
        return this.cells.size;
    }

    addParticles ( particles ) {
        let max_size,
            size = this.cellSize,
            scale = 1.0 / size,    // convert simulations space to grid space
            pos, row, col, s, x, y, x0, y0, x1, y1, offset,
            cells = {},
            store = this.store;

        Array.prototype.push.apply ( store, Object.values ( this.cells ) );

        for ( let particle of particles ) {
            pos = particle.pos;
            max_size = types [ particle.type ].max_size;
            // convert position/offset to float row/col
            x = scale * pos.x;
            y = scale * pos.y;
            offset = 0.5 * scale * max_size;
            // calculate bounds grid cells
            x0 = Math.floor ( x - offset );
            y0 = Math.floor ( y - offset );
            x1 = Math.floor ( x + offset );
            y1 = Math.floor ( y + offset );

            push ( getCell ( cells, store, y0, x0 ), particle );

            if ( x0 !== x1 ) {
                push ( getCell ( cells, store, y0, x1 ), particle );
                if ( y0 !== y1 ) {
                    push ( getCell ( cells, store, y1, x0 ), particle );
                    push ( getCell ( cells, store, y1, x1 ), particle );
                }
            } else if ( y0 !== y1 ){
                push ( getCell ( cells, store, y1, x0 ), particle );
            }
        }

        this.cells = cells;
    }
}
