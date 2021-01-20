'use strict';

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//Starting out sketch and
//injecting p5, as the param p, into our sketch function.
//Instantiates P5 sketch to keep it out of the global scope.
new ( require ( 'p5' ) ) ( function ( p ) {

    //Imports‮
    require('./js/utils/require_hjson.js');
    //​​Imports our custom function to decide what color the fill shall be.
    //const { getFillColor } = require('./js/src/colorController');
    const uncached = require('./js/utils/uncached.js'); // relative path from main.js
    const simulation_settings = uncached('../config/simulation.hjson'); // relative path from utils/uncached.js
    const general_settings = uncached('../config/ui.hjson');
    const toProperCase = uncached('../utils/toProperCase.js');
    const camera = uncached ( '../src/camera.js' ).camera;
    const updateCamera = uncached ( '../src/camera.js' ).updateCamera.bind ( p );
    const mouse = uncached ( '../src/mouse.js' );
    const keyboard = uncached ( '../src/keyboard.js' );
    const Particle = uncached('../src/Particle.js');
    const Vector = require('p5').Vector;
    const particle_types = Particle.types;
    const ptypes = Object.keys(particle_types);
    const Grid = uncached ( '../src/Grid.js' );
    const simulation = uncached('../src/simulation.js');
    // save timestamps for all required files
    uncached.save ();

    const PALLETE = {
        background: p.color(17, 17, 19),
        grid: p.color(240, 240, 248)
    }

    // Array to hold our particle objects
    let particles = []

    function createSoup(w, h, quantity) {
        for (let i = quantity; i > 0; i--) {

            let pos_vector = new Vector(p.random(-w / 2, w / 2), p.random(-h / 2, h / 2))
            let vel_vector = new Vector(0, 0)
            let pt = new Particle(
                ptypes[p.floor(p.random() * ptypes.length)],
                pos_vector,
                vel_vector,
            )
            particles.push(pt)
        }
    }

    function textInformation(bottom_offset, ...info) {
        // found the issue
        let space_unit = p.windowWidth / info.length;
        for (let i = 0; i < info.length; i++) {
            p.textAlign(p.CENTER)
            p.text(info[i], (space_unit * i) + space_unit / 2, p.windowHeight - bottom_offset)
        }
    }

    function drawCanvas() {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        p.background(PALLETE.background)
    }

    function inputHandler ( draw ) {
        updateCamera ( draw );
    }

    // additional scrolling control on mousewheel change
    p.mouseWheel = mouse.mouseWheel.bind ( p, drawCanvas );
    p.mouseReleased = mouse.mouseReleased.bind ( p, particles );
    p.keyReleased = keyboard.keyReleased.bind ( p, createSoup );
    p.windowResized = function() {
        drawCanvas()
    }
    p.setup = function() {
        createSoup(simulation_settings.simulation_area.width, simulation_settings.simulation_area.height, simulation_settings.particle_quantity)
        drawCanvas()
    }

    let perf = { frame: 0, time: 0 },
        ms, total, count = 0;

    p.draw = function() {
        let p = this;
        if (general_settings.background) {
            p.background(PALLETE.background);
        }

        inputHandler ( drawCanvas );

        p.push();
        // Apply camera settings for this frame
        p.translate(
            (p.windowWidth / 2 + (camera.zoom * camera.x)),
            (p.windowHeight / 2 + (camera.zoom * camera.y))
        );

        p.strokeWeight(2);
        p.stroke(255, 255, 255);
        p.line(-10, 0, 10, 0);
        p.line(0, -10, 0, 10);

        p.scale(camera.zoom, camera.zoom);

        // Calculate next positions for all particles
        // if (!general_settings.paused || general_settings.step_this_frame) {
        //     simulation.simulateParticles ( p, particles );
        //     general_settings.step_this_frame = false;
        // }
        //
        // simulation.updateParticles ( p, particles );

        // Calculate next positions for all particles
        if (!general_settings.paused || general_settings.step_this_frame) {

            ms = performance.now ();
            for ( let particle of particles ) {
                // particle.calculateUpdate(p, particles);
                particle.fasterInteractions ( particles );
            }
            total += performance.now () - ms;
            count++;
            if ( count === 10 ) {
                perf.time = total / count;
                perf.frame += count;
                count = 0;
                total = 0;
                console.log ( perf );
            }

            general_settings.step_this_frame = false;
        }

        // Update values to new positions and draw.
        for ( let particle of particles ) {
            // particle.update();
            particle.fasterUpdate ();
            particle.draw(p);
        }

        p.pop();
        // UI AREA -----------------
        if (general_settings.display_UI) {
            p.noStroke();
            p.textSize(15)

            p.fill(255);
            textInformation(40,
                'B - Toggle Background',
                'C - Clear Particles',
                'R - Reset Simulation',
                'S - Add Soup',
                '[ - Last Type',
                '] - Next Type',
                'U - Toggle UI'
            )
            textInformation(20,
                'P - Pause Simulation',
                'Period - Time Step',
                'Arrow Keys - Pan Camera',
                'MMB - Pan Camera, Zoom',
                'Z - Zoom In',
                'X - Zoom Out',
                'LMB - Place Particle'
            )

            let selected_type = particle_types[ptypes[general_settings.place_type]];
            p.fill(selected_type.color[0], selected_type.color[1], selected_type.color[2]);
            p.noStroke();
            p.rect(10, 10, 30, 30);
            p.textSize(15)
            p.textAlign(p.LEFT)
            p.text(toProperCase(ptypes[general_settings.place_type]), 9, 60)
        }
    }.bind ( p );
} );
