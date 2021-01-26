const uncached = require ( '../utils/uncached.js' );
const interactions = uncached('../interactions/interactions.js');
const Grid = uncached ( '../src/Grid.js' );
const grid_size = Math.max.apply ( Math, Object.values ( interactions ).map ( v => v.max_size ) );

const grid = new Grid ( grid_size );

module.exports.simulateParticles = function simulateParticles ( particles ) {
    // reset the grid, insert all particles
    grid.addParticles ( particles );

    let count, max_particles = 0

    // walk occupied grid cells
    for ( let cell of Object.values ( grid.cells ) ) {
        count = cell [ 0 ];
        cell = cell.slice ( 1, count + 1 );
        // update all particles assigned to a cell
        for ( let particle of cell ) {
            particle.fasterInteractions ( cell );
        }
        max_particles = Math.max ( max_particles, count );
    }

    return max_particles;
}

module.exports.updateParticles = function updateParticles ( p, particles ) {
    // advance and render particles at their new positions
    for ( let particle of particles ) {
        particle.fasterUpdate ();
        particle.draw ( p );
    }
}
