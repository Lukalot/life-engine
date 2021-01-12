const uncached = require('../utils/uncached.js');
const general_settings = uncached ( '../config/ui.hjson' );

const camera = {
    x: 0,
    y: 0,
    zoom: 1
}

module.exports.camera = camera;
module.exports.updateCamera = function updateCamera () {
    let p = this;
    if (p.keyIsPressed) {
        // Left
        if (p.keyIsDown(39) /*left key*/ ) {
            camera.x -= general_settings.camera_pan_speed / camera.zoom;
            if (!general_settings.background) drawCanvas()
        }

        // Right
        if (p.keyIsDown(37) /*right key*/ ) {
            camera.x += general_settings.camera_pan_speed / camera.zoom;
            if (!general_settings.background) drawCanvas()
        }

        // Up
        if (p.keyIsDown(40) /*up key*/ ) {
            camera.y -= general_settings.camera_pan_speed / camera.zoom;
            if (!general_settings.background) drawCanvas()
        }

        // Down
        if (p.keyIsDown(38) /*down key*/ ) {
            camera.y += general_settings.camera_pan_speed / camera.zoom;
            if (!general_settings.background) drawCanvas()
        }

        // Zoom In
        if (p.keyIsDown(90) /*z*/ ) {
            camera.zoom += general_settings.camera_zoom_rate * camera.zoom;
            if (!general_settings.background) drawCanvas()
        }

        // Zoom Out
        if (p.keyIsDown(88) /*x*/ ) {
            camera.zoom -= general_settings.camera_zoom_rate * camera.zoom;
            if (!general_settings.background) drawCanvas()
        }
    }

    if (p.mouseIsPressed && p.mouseButton === p.CENTER) {
        camera.x -= (p.pmouseX - p.mouseX) / camera.zoom;
        camera.y -= (p.pmouseY - p.mouseY) / camera.zoom;
        if (!general_settings.background) drawCanvas()
    }
}
