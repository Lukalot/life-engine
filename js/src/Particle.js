const uncached = require('../utils/uncached.js');
const simulation_settings = uncached ( '../config/simulation.hjson' );
const general_settings = uncached ( '../config/ui.hjson' );
const generateTypesObject = uncached ( '../interactions/generateTypesObject.js' );
const types_input = uncached('../interactions/interactions.js');
const p5 = require ( 'p5' ), Vector = p5.Vector;

// Use generateTypesObject to convert the input to a more efficient format.
// We will do this again later any time types input is changed.
const particle_types = generateTypesObject ( types_input );

module.exports = class Particle {

    static types = particle_types;

    constructor(type, pos, vel) {
        this.type = type; // key of a property of the particle_types object

        Object.assign ( this, Particle.types [ type ] );

        this.pos = pos;
        this.npos = new Vector(0, 0); // Just making it clear that this property exists.

        this.vel = vel;
        this.nvel = new Vector(0, 0); // ditto
    }

    // Update this particles state given an array of particles to be affected by.
    // Disclaimer: heavpoot wrote this code
    calculateUpdate(p, particlesArray) {
        this.nvel = this.vel;
        this.npos = this.pos;
        for (let i of particlesArray) {
            if (i == this) continue;
            let distSq = (this.pos.x - i.pos.x) ** 2 + (this.pos.y - i.pos.y) ** 2;
            let otype = i.type;
            let atrdsc; // atr dsc

            if (this.relationships[otype] !== undefined) {
                atrdsc = this.relationships[otype];
            } else {
                atrdsc = this.relationships.default;
            }

            let atrt;

            for (let j = atrdsc.length - 1; j >= 0; j--) {
                if (distSq <= atrdsc[j][0]) {
                    atrt = atrdsc[j][1];
                }
            }

            if (atrt === undefined) continue;

            let ang = p.atan2(i.pos.y - this.pos.y, i.pos.x - this.pos.x);
            let dvel = Vector.fromAngle(ang);
            dvel.mult(atrt);
            this.nvel = Vector.add(dvel, this.nvel);
        }
        if (simulation_settings.simulation_area.edge_mode === "soft_dish") {
            let m = this.pos.mag();
            if (m > simulation_settings.simulation_area.dish_radius) {
                let a = p.atan2(-this.pos.y, -this.pos.x);
                a = Vector.fromAngle(a);
                a.mult((m - simulation_settings.simulation_area.dish_radius) * simulation_settings.simulation_area.soft_force);
                this.nvel = Vector.add(a, this.nvel);
            }
        }
        this.nvel.mult(this.friction);
        this.npos = Vector.add(this.pos, Vector.div(this.nvel, this.mass));
    }

    // Update actual position based on
    update() {
        // update existing values to the next values
        this.pos = this.npos;
        this.vel = this.nvel;

        // reset 'next' values to null to prepare for the next calculation.
        //this.nvel = null;
        //this.npos = null;
    }

    // draw a particle based on its type
    draw(p) {

        // TODO: Don't render particles outside of the screen. Zoom and panning will need to be accounted for, and the formula is going to be hell.

        p.noFill();
        p.stroke(this.color[0], this.color[1], this.color[2], 20)
        p.strokeWeight(1)

        if (general_settings.visualize_relationships) {
            for (let rel in this.relationships) {
                for (let item of this.relationships[rel]) {
                    p.ellipse(this.pos.x, this.pos.y, p.sqrt(item[0]), p.sqrt(item[0]))
                }
            }
        }

        p.fill(this.color[0], this.color[1], this.color[2], this.color[3]);
        p.stroke(this.color[0], this.color[1], this.color[2], this.color[3]);

        if (general_settings.particle_render_mode === 'circle') {
            p.noStroke()
            p.ellipse(this.pos.x, this.pos.y, this.visible_radius, this.visible_radius)
        } else if (general_settings.particle_render_mode === 'line') {
            p.strokeWeight(this.visible_radius);
            p.line(this.pos.x, this.pos.y, this.pos.x, this.pos.y);
        } else if (general_settings.particle_render_mode === 'arrow') {

        }
    }
}
