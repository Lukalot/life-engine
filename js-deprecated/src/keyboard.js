const uncached = require('../utils/uncached.js');
const simulation_settings = uncached('../config/simulation.hjson');
const general_settings = uncached ( '../config/ui.hjson' );
const ptypes = Object.keys ( uncached ( '../src/Particle.js').types );

module.exports.keyReleased = function keyReleased ( createSoup ) {
    let p = this;
    if (p.key === 'p') {
        general_settings.paused = !general_settings.paused;
    } else if (p.key === '.') {
        general_settings.step_this_frame = true;
    } else if (p.key === 'b') {
        general_settings.background = !general_settings.background;
    } else if (p.key === 'v') {
        general_settings.visualize_relationships = !general_settings.visualize_relationships;
    } else if (p.key === 'c') {
        particles = [];
    } else if (p.key === 'r') {
        particles = [];
        createSoup(simulation_settings.simulation_area.width, simulation_settings.simulation_area.height, simulation_settings.particle_quantity)
    } else if (p.key === '[') {
        general_settings.place_type--;
        if (general_settings.place_type < 0) {
            general_settings.place_type = ptypes.length - 1;
        }
    } else if (p.key === ']') {
        general_settings.place_type++;
        if (general_settings.place_type > ptypes.length - 1) {
            general_settings.place_type = 0;
        }
    } else if (p.key === 'u') {
        general_settings.display_UI = !general_settings.display_UI;
    }
}
