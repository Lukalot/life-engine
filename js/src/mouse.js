const uncached = require('../utils/uncached.js');
const general_settings = uncached ( '../config/ui.hjson' );
const camera = uncached ( '../src/camera.js' ).camera;
const Particle = uncached('../src/Particle.js');
const ptypes = Object.keys ( Particle.types );
const Vector = require ( 'p5' ).Vector;

module.exports.mouseWheel = function mouseWheel ( drawCanvas, event ) {
    console.log ( camera );
    camera.zoom += ((Math.sign(-event.delta)) * (general_settings.camera_zoom_rate * 6)) * camera.zoom;
    if (!general_settings.background) drawCanvas()
    // block page scrolling, just in case
    return false;
}

module.exports.mouseReleased = function mouseReleased ( particles ) {
    let p = this;
    if (p.mouseButton === p.LEFT) {
        console.log('mouse click registered')
        particles.push(
            new Particle(
                ptypes[general_settings.place_type],

                // has very small random digits added to roughly ensure that placements do not occur in the same place, as things just fall apart when that happens.
                new Vector(((p.mouseX - p.windowWidth / 2) / camera.zoom - camera.x) + p.random(0, 1) / 10000,
                    ((p.mouseY - p.windowHeight / 2) / camera.zoom - camera.y) + p.random(0, 1) / 10000),

                new Vector(0, 0)
            )
        );
    }
}
