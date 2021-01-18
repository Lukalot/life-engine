const uncached = require('../utils/uncached.js');
const types = uncached('../interactions/interactions.js');
const Particle = uncached ( '../src/Particle.js' );

module.exports = class Grid {
    constructor ( cellSize ) {
        this.cellSize = cellSize;       // the width/height of each grid cell
        this.registry = new Set ();     // tracks currently occupied cells by their id
        this.cells = new Map ();        // maps cell ids to collision arrays
        this.store = [];                // for keeping/recycling collision arrays
    }

    addParticles ( particles ) {
        let size = this.cellSize,
            scale = 1.0 / size,    // convert simulations space to grid space
            pos, row, col, xf, yf, xp, yp, xs, ys, offset,
            reg = this.registry,
            cells = this.cells,
            store = this.store;

        const getCell = function ( row, col ) {
            let id = ( row << 16 ) | ( col & 65535 ),
                cell = cells.get ( id ),
                // only create a new array if we need one
                arry = cell ? cell : store.length ? store.pop () : [];

            // array may carry residual particles ( from previous CD )
            // clear those
            arry.length = 0;

            // add the cell id to the current registry
            reg.add ( id );

            // insert the new array if this cell was unoccupied
            // otherwise the current one is reused
            if ( cell !== arry ) {
                cells.set ( id, arry );
            }
            return arry;
        }

        // forget all previously occupied cells
        reg.clear ();

        for ( let particle of particles ) {
            pos = particle.pos;
            // convert position to float row/col
            yf = scale * pos.y;
            xf = scale * pos.x;
            // increment/decrement based on row/col sign
            xs = Math.sign ( xf );
            ys = Math.sign ( yf );
            // integer row/col
            row = Math.floor ( yf );
            col = Math.floor ( xf );
            // get fractional part of rol/col position
            yp = yf - row;
            xp = xf - col;

            // determine which grid cells intersect with the largest bounding box for this particle
            // ( based on max interaction radius for this particle )
            // note: particle.max_size is always <= cell size, i.e. offset is always positive
            offset = 0.5 * scale * ( size - particle.max_size );

            if ( Math.abs ( yp + ys * offset ) > 0.5 ) {
                if ( Math.abs ( xp + xs * offset ) > 0.5 ) {
                    getCell ( row + ys, col + xs ).push ( particle );
                } else if ( Math.abs ( xp - xs * offset ) < 0.5 ) {
                    getCell ( row + ys, col - xs ).push ( particle );
                }
            } else if ( Math.abs ( yp - ys * offset ) < 0.5 ) {
                if ( Math.abs ( xp + xs * offset ) > 0.5 ) {
                    getCell ( row - ys, col + xs ).push ( particle );
                } else if ( Math.abs ( xp - xs * offset ) < 0.5 ) {
                    getCell ( row - ys, col - xs ).push ( particle );
                }
            } else {
                if ( Math.abs ( xp + xs * offset ) > 0.5 ) {
                    getCell ( row, col + xs ).push ( particle );
                } else if ( Math.abs ( xp - xs * offset ) < 0.5 ) {
                    getCell ( row, col - xs ).push ( particle );
                }
            }
            getCell ( row, col ).push ( particle );
        }

        // remove residual cells ( from previous CD )
        // store them for recycling
        for ( let [ id, cell ] in cells.entries () ) {
            if ( !reg.has ( id ) ) {
                store.push ( cell );
                cells.delete ( id );
            }
        }
    }

    clear () {
        let reg = this.registry,
            store = this.store,
            cells = this.cells;

        reg.clear ();
        for ( let [ id, cell ] in cells.entries () ) {
            if ( !reg.has ( id ) ) {
                reg.set
            }
        }
    }
}
