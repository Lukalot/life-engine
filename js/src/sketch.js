'use strict';

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//Imports‮‮P5‭‭. Instantiates the sketch at the bottom of this file.
const p5 = require('p5');
//​​Imports our custom function to decide what color the fill shall be.
//const { getFillColor } = require('./js/src/colorController');

/* -- PARTICLE TYPES DATA STRUCTURE --

particle_types {
	'particle name': {
		color: [ r, g, b, a ]
		relationships: {
			default: {
				// default rule for undeclared relationships
			},
			'other particles name': {
				'distance float value as string': number;
				'10.5': -2
      }
		},
		solid: bool, // will this particle allow other particles to move through its collision radius?
		effect_inner_radius: number, // area / hole within which the relationships do not apply yet. Relationship distances start added to this value
		collision_radius: number, // the physical area of the particle
	  visible_radius: number‭‭, // visual size of the representative circle. Defaults to collision radius.
	},
  // more types ...
}
*/

let simulation_settings = {
  additive_relationships_override: null, // false, true, or null. Forces relationship rules stacking additively or being static. Uses per-type value if null.
  acceleration_override: null, // false, true, or null. Forces relationships setting acceleration instead of velocity. Uses per-type value if null. 
  particle_quantity: 1000, // initial particles introduced to the area, likely will change how this works later
  friction_override: null,

  simulation_area: { // simulation_settings.simulation_area

    width: 600, //window.innerWidth, // p is not defined. How to get window width outside of p5?
    height: 600, //window.innerHeight,

    edge_mode: 'soft_dish', // 'soft_dish', 'loop', 'hard_dish', 'hard', null. Soft is gradual attraction to the centre once the radius is exceeded
    
    dish_radius: 1200, // applies to dish types if set
    soft_wall_force: 0.001,
  },

  // Multiplies the range values supplied in the types input
  relationship_radius_multiplier: 1
}

let general_settings = {
  particle_opacity: 1.0,
  visualize_relationships: false,
  visualize_relationships_opacity: 0.1,
  visualize_trajectory: false,
  visualize_trajectory_opacity: 0.7,
  visualize_trajectory_multiplier: 10,
  particle_render_mode: 'circle', // circle, fast_circle, line, arrow, square
  background: true,
  background_opacity: 1.0,
  paused: false,
  step_this_frame: false,
  camera_pan_speed: 10,
  camera_zoom_rate: 0.015,
  place_type: 0,
  lolcat: false,
  display_UI: true,
}

let camera = {
  x: 0,
  y: 0,
  zoom: 1
}

// Deep copy the object, supposedly
function deepCopyObject(x) {
  if ( typeof x === "object" ){
    let res;
    if (x.concat){
      res=[];
    } else {
      res={};
    }
    for ( let i in x ) {
      res[ deepCopyObject(i) ] = deepCopyObject( x[i] )
    }
    return res;
  } else {
    return x;
  }
}

String.prototype.toProperCase = function(opt_lowerCaseTheRest) {
  return (opt_lowerCaseTheRest ? this.toLowerCase() : this)
    .replace(/(^|[\s\xA0])[^\s\xA0]/g, function(s){ return s.toUpperCase(); });
};

//Starting out sketch and
//injecting p5, as the param p, into our sketch function.
const sketch = function(p) {
  let types_input = {
    'atom (dense)': {
      color: [255, 0, 128],
      relationships: {
        default: [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "atom (dense)": [
          [0, -160],
          [10, 32],
        ],
      },
      additive_relationships: false,
      visible_radius: 5,
      friction: 0.1,
      mass: 10,
      interpolate: 'linear',
    },
    'atom (dense) 2': {
      color: [0, 128, 255],
      relationships: {
        default: [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "atom (dense) 2": [
          [0, -160],
          [10, 32],
        ],
      },
      additive_relationships: false,
      visible_radius: 5,
      friction: 0.01,
      mass: 10,
      interpolate: 'linear',
    },
    'atom (frictionless)': {
      color: [255, 128, 0],
      relationships: {
        default: [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "atom (frictionless)": [
          [0, -160],
          [10, 32],
        ],
      },
      additive_relationships: false,
      visible_radius: 5,
      friction: 0.0,
      mass: 10,
      interpolate: 'linear',
    },
    'atom chaser': {
      color: [0, 255, 0],
      relationships: {
        default: [
          [ -10, -20 ],
          [ 10, 0 ],
          [ 40, 0.5 ],
        ],
      },
      additive_relationships: false,
      visible_radius: 10,
      friction: 0.2,
      mass: 5,
      interpolate: 'linear',
    },
    '1': {
      color: [0, 128, 255],
      relationships: {
        default: [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "atom chaser": [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "atom (frictionless)": [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "atom (dense)": [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "2": [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
      },
      additive_relationships: false,
      visible_radius: 10,
      friction: p.random(0, 0.5),
      mass: p.random(0.3, 10),
      interpolate: 'linear',
    },
    '2': {
      color: [255, 0, 128],
      relationships: {
        default: [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "atom chaser": [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "atom (frictionless)": [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "atom (dense)": [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "1": [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
      },
      additive_relationships: false,
      visible_radius: 10,
      friction: p.random(0, 0.5),
      mass: p.random(0.3, 10),
      interpolate: 'linear',
    },
  }

  types_input = {
    '1': {
      color: [255, 0, 128],
      relationships: {
        default: [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "2": [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "3": [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "4": [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
      },
      additive_relationships: false,
      visible_radius: 10,
      friction: p.random(0, 0.5),
      mass: p.random(0.3, 10),
      interpolate: 'linear',
    },
    '2': {
      color: [0, 128, 255],
      relationships: {
        default: [
          [ 0, -p.random(40, 120) ],
          [ p.random(20, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "1": [
          [ 0, -p.random(40, 120) ],
          [ p.random(10, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "3": [
          [ 0, -p.random(40, 120) ],
          [ p.random(10, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "4": [
          [ 0, -p.random(40, 120) ],
          [ p.random(10, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
      },
      additive_relationships: false,
      visible_radius: 10,
      friction: p.random(0, 0.5),
      mass: p.random(0.3, 10),
      interpolate: 'linear',
    },
    '3': {
      color: [128, 255, 0],
      relationships: {
        default: [
          [ 10, -p.random(40, 120) ],
          [ p.random(10, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "2": [
          [ 0, -p.random(40, 120) ],
          [ p.random(10, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "1": [
          [ 0, -p.random(40, 120) ],
          [ p.random(10, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "4": [
          [ 0, -p.random(40, 120) ],
          [ p.random(10, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
      },
      additive_relationships: false,
      visible_radius: 10,
      friction: p.random(0, 0.5),
      mass: p.random(0.3, 10),
      interpolate: 'linear',
    },
    '4': {
      color: [128, 0, 255],
      relationships: {
        default: [
          [ 0, -p.random(40, 120) ],
          [ p.random(10, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "2": [
          [ 0, -p.random(40, 120) ],
          [ p.random(10, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "1": [
          [ 0, -p.random(40, 120) ],
          [ p.random(10, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
        "3": [
          [ 0, -p.random(40, 120) ],
          [ p.random(10, 40), p.random(-20, 20) ],
          [ p.random(40, 60), p.random(-20, 20) ],
          [ p.random(60, 80), p.random(-20, 20) ],
        ],
      },
      additive_relationships: false,
      visible_radius: 10,
      friction: p.random(0, 0.5),
      mass: p.random(0.3, 10),
      interpolate: 'linear',
    },
  }

  // Set defaults and do one time computations on the input values, output a correct type object
  function generateTypesObject( object ) {

    let nobject = deepCopyObject(object)

    // apply for each type
    for (let type in object) {
      let current_type = nobject[type];
      // default visible_radius to collision radius if not set, or 1
      current_type.visible_radius = current_type.visible_radius || current_type.collision_radius || 1;

      // square the value of effect_inner_radius and collision_radius to save performance later
      current_type.effect_inner_radius = current_type.effect_inner_radius ** 2 || 0
      current_type.collision_radius = current_type.collision_radius ** 2 || 0
      
      for (let eye in object[type].relationships) {
        for (let jay in object[type].relationships[eye]) {
          nobject[type].relationships[eye][jay][0] **= 2;
          nobject[type].relationships[eye][jay][0] *= simulation_settings.relationship_radius_multiplier;
          nobject[type].relationships[eye][jay][1] /= 30;
        }
      }
      
      current_type.additive_relationships = current_type.additive || false;
      current_type.solid = current_type.solid || false;
      current_type.friction = (1 - current_type.friction) || 1;
      current_type.acceleration = current_type.acceleration || true;
      current_type.mass = current_type.mass || 1;
      current_type.interpolate = current_type.interpolate || "none"; // "none", "sine", "linear", "exponential", etc.
    }
    // return object to be saved
    return nobject;
  }

  // Use generateTypesObject to convert the input to a more efficient format.
  // We will do this again later any time types input is changed.
  let particle_types = generateTypesObject( types_input );

  let ptypes = Object.keys(particle_types);

  function createSoup(w, h, quantity) {
    for ( let i = quantity; i > 0; i-- ) {

      let pos_vector = new p5.Vector(p.random(-w/2, w/2), p.random(-h/2, h/2))
      let vel_vector = new p5.Vector(0, 0)
      let pt = new Particle(
          Object.keys(particle_types)[p.floor( p.random() * Object.keys(particle_types).length )],
          pos_vector,
          vel_vector,
        )
      particles.push(pt)
		}
  }

	const PALLETE = {
		background: p.color(17, 17, 19),
		grid: p.color(240, 240, 248)
	}

  function textInformation(bottom_offset, ...info) {
    // found the issue
    let space_unit = p.windowWidth/info.length;
    for (let i = 0; i < info.length; i++) {
      p.textAlign(p.CENTER)
      p.text( info[i], (space_unit * i) + space_unit / 2, p.windowHeight-bottom_offset )
    }
  }
	
	// ------------------ PARTICLE OBJECT / METHODS ------------------

	// Main particle object
	function Particle(type, pos, vel) {
		this.type = type; // key of a property of the particle_types object
    
    for (let i in particle_types[type]){
      this[i] = particle_types[type][i];
    }
		
    this.pos = pos;
    this.ppos = pos;
		this.npos = new p5.Vector(0,0); // Just making it clear that this property exists.
	
		this.vel = vel;
		this.nvel = new p5.Vector(0,0); // ditto
	};

	// Update this particles state given an array of particles to be affected by.
  // Disclaimer: heavpoot wrote this code
  function lint(x,y,a,b,t){
    return ((t-x)*(b-a))/y+a; // magic
  }
	Particle.prototype.calculateUpdate = function( particlesArray ) {
    this.ppos = this.pos;
    this.nvel = this.vel;
    this.npos = this.pos;
		for ( let i of particlesArray ) {
      if (i==this) continue;
      let distSq = ( this.pos.x - i.pos.x ) ** 2 + ( this.pos.y - i.pos.y ) ** 2;
      let otype = i.type;
      let atrdsc; // atr dsc
      
      if (this.relationships[otype] !== undefined){
        atrdsc = this.relationships[otype];
      } else {
        atrdsc = this.relationships.default;
      }
      
      let atrt;

      for ( let j = atrdsc.length-1; j >= 0; j-- ){
        if ( distSq <= atrdsc[j][0] ){
          if (this.interpolate=="linear"){
            let lx=j==0?0:p.sqrt(atrdsc[j-1][0]);
            let ly=p.sqrt(atrdsc[j][0]);
            atrt = lint(lx, ly, j === 0 ? 0 : atrdsc[j-1][1], atrdsc[j][1], p.sqrt(distSq))
          } else {
            atrt = atrdsc[j][1];
          }
        }
      }

      if (atrt === undefined ) continue;
      
      let ang = p.atan2(i.pos.y-this.pos.y,i.pos.x-this.pos.x);
      let dvel = p5.Vector.fromAngle(ang);
      dvel.mult(atrt);
      this.nvel=p5.Vector.add(dvel,this.nvel);
    }
    if (simulation_settings.simulation_area.edge_mode==="soft_dish"){
      let m=this.pos.mag();
      if (m>simulation_settings.simulation_area.dish_radius){
        let a = p.atan2(-this.pos.y,-this.pos.x);
        a = p5.Vector.fromAngle(a);
        a.mult((m-simulation_settings.simulation_area.dish_radius) * simulation_settings.simulation_area.soft_wall_force);
        this.nvel=p5.Vector.add(a,this.nvel);
      }
    }
    this.nvel.mult(this.friction);
    this.npos=p5.Vector.add(this.pos,p5.Vector.div(this.nvel,this.mass));
	}

	// Update actual position based on
	Particle.prototype.update = function () {
		// update existing values to the next values
		this.pos = this.npos;
		this.vel = this.nvel;
	
		// reset 'next' values to null to prepare for the next calculation.
    //this.nvel = null;
    //this.npos = null;
	}

	// draw a particle based on its type
	Particle.prototype.draw = function () {

    // TODO: Don't render particles outside of the screen. Zoom and panning will need to be accounted for, and the formula is going to be hell.

    p.noFill();
    p.strokeWeight(1)

    p.stroke(this.color[0], this.color[1], this.color[2], 255*general_settings.visualize_relationships_opacity)
    if (general_settings.visualize_relationships) {
      for (let rel in this.relationships) {
        for (let item of this.relationships[rel]) {
          p.ellipse(this.pos.x, this.pos.y, p.sqrt(item[0]), p.sqrt(item[0]))
        }
      }
    }

    p.stroke(this.color[0], this.color[1], this.color[2], 255*general_settings.visualize_trajectory_opacity)

    if (general_settings.visualize_trajectory) {
      p.strokeWeight(1)
      p.line( this.pos.x, this.pos.y, this.pos.x + (this.vel.x*general_settings.visualize_trajectory_multiplier), this.pos.y + (this.vel.y*general_settings.visualize_trajectory_multiplier))
    }

    p.fill(this.color[0], this.color[1], this.color[2], 255*general_settings.particle_opacity);
    
    if (general_settings.particle_render_mode === 'circle') {
      p.noStroke();
      p.ellipse(this.pos.x, this.pos.y, this.visible_radius, this.visible_radius);
    } else if (general_settings.particle_render_mode === 'square') {
      p.noStroke();
      p.rect(this.pos.x, this.pos.y, this.visible_radius, this.visible_radius);
    } else if (general_settings.particle_render_mode === 'fast_circle') {
      p.strokeWeight(this.visible_radius);
      p.stroke(this.color[0], this.color[1], this.color[2], this.color[3]);
      p.point(this.pos.x, this.pos.y);
    } else if (general_settings.particle_render_mode === 'line') {
      p.strokeWeight(this.visible_radius);
      p.stroke(this.color[0], this.color[1], this.color[2], this.color[3]);
      p.line(this.ppos.x, this.ppos.y, this.pos.x, this.pos.y);
    } else if (general_settings.particle_render_mode === 'arrow') {

    }
	}

  
	
	// ------------------ END PARTICLE OBJECT / METHODS ------------------

	function drawCanvas() {
		p.resizeCanvas(p.windowWidth, p.windowHeight);
		p.background(PALLETE.background)
	}

	// Array to hold our particle objects
	let particles = []

  function cameraControls() {
    if (p.keyIsPressed) {
      // Left
      if (p.keyIsDown(39) /*left key*/) {
        camera.x -= general_settings.camera_pan_speed / camera.zoom;
        if (!general_settings.background) drawCanvas()
      }
      
      // Right
      if (p.keyIsDown(37) /*right key*/) {
        camera.x += general_settings.camera_pan_speed / camera.zoom;
        if (!general_settings.background) drawCanvas()
      }
      
      // Up
      if (p.keyIsDown(40) /*up key*/) {
        camera.y -= general_settings.camera_pan_speed / camera.zoom;
        if (!general_settings.background) drawCanvas()
      }

      // Down
      if (p.keyIsDown(38) /*down key*/) {
        camera.y += general_settings.camera_pan_speed / camera.zoom;
        if (!general_settings.background) drawCanvas()
      }

      // Zoom In
      if (p.keyIsDown(90) /*z*/) {
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

  // additional scrolling control on mousewheel change
  p.mouseWheel = function(event) {
    camera.zoom += ((Math.sign(-event.delta)) * ( general_settings.camera_zoom_rate * 6 ) ) * camera.zoom;
    if (!general_settings.background) drawCanvas()
    // block page scrolling, just in case
    return false;
  }

  function inputHandler() {
    cameraControls();
  }
	
  p.setup = function() {
		createSoup(simulation_settings.simulation_area.width, simulation_settings.simulation_area.height, simulation_settings.particle_quantity)
		drawCanvas()
	}
  
  p.draw = function() {
    if ( general_settings.background ) {
		  p.background(PALLETE.background);
    }

    inputHandler();

    p.push();
    // Apply camera settings for this frame
    p.translate(
      ( p.windowWidth/2 + (camera.zoom * camera.x) ),
      ( p.windowHeight/2 + (camera.zoom * camera.y) )
    );

    p.strokeWeight(2);
    p.stroke(255, 255, 255);
    p.line(-10, 0, 10, 0);
    p.line(0, -10, 0, 10);

    p.scale(camera.zoom, camera.zoom);

    // Calculate next positions for all particles
    if (!general_settings.paused || general_settings.step_this_frame) {
      particles.map( item => {
        item.calculateUpdate(particles);
        return item;
      } );
      general_settings.step_this_frame = false;
    }

    p.rectMode(p.CENTER)
    // Update values to new positions and draw.
    particles.map( item => {
      item.update();
      item.draw();
      return item;
    } );

    p.pop();
    // UI AREA -----------------
    if (general_settings.display_UI) {
      // p.

      p.stroke(PALLETE.background);
      p.strokeWeight(4)
      p.textSize(15)

      p.fill(255);
      textInformation( 40,
        'B - Background',
        'G - Grid',
        'E - Erase All',
        'R - Reload',
        'S - Add Soup',
        '[ - Last Type',
        '] - Next Type',
        'U - Toggle UI',
        'V - Show Relationships'
      )
      textInformation( 20,
        'P - Pause',
        'Period - Time Step', 
        'Arrow Keys - Pan',
        'MMB - Pan, Zoom',
        'Z - Zoom In',
        'X - Zoom Out',
        'C - Reset Camera',
        'LMB - Place Particle',
        'T - Show Trajectory'
      )

      let selected_type = particle_types[ptypes[general_settings.place_type]];
      p.fill(selected_type.color[0], selected_type.color[1], selected_type.color[2]);
      p.rect(10, 10, 30, 30);
      p.textSize(15)
      p.textAlign(p.LEFT)
      p.text(ptypes[general_settings.place_type].toProperCase(), 9, 60)
    }
	};
  
  p.mouseReleased = function() {
    if ( p.mouseButton === p.LEFT) {
      console.log('mouse click registered')
      particles.push(
        new Particle(
          ptypes[general_settings.place_type],
          
          // has very small random digits added to roughly ensure that placements do not occur in the same place, as things just fall apart when that happens.
          new p5.Vector(((p.mouseX-p.windowWidth/2)/camera.zoom-camera.x) + p.random(0,1)/10000,
          ((p.mouseY-p.windowHeight/2)/camera.zoom-camera.y) + p.random(0,1)/10000),
          
          new p5.Vector(0, 0)
        )
      );
    }
  }

  p.keyReleased = function() {
    if (p.key === 'p') {
      general_settings.paused = !general_settings.paused;
    } else if (p.key === '.') {
      general_settings.step_this_frame = true;
    } else if (p.key === 'b') {
      general_settings.background = ! general_settings.background;
    } else if (p.key === 'v') {
      general_settings.visualize_relationships = ! general_settings.visualize_relationships;
    } else if (p.key === 't') {
      general_settings.visualize_trajectory = !general_settings.visualize_trajectory;
    } else if (p.key === 'e') {
      particles = [];
      drawCanvas();
    } else if (p.key === 'c') {
      camera.x = 0;
      camera.y = 0;
      camera.zoom = 1;
      drawCanvas();
    } else if (p.key === 'r') {
      particles = [];
      createSoup(simulation_settings.simulation_area.width, simulation_settings.simulation_area.height, simulation_settings.particle_quantity);
      drawCanvas();
    } else if (p.key === 's') {
      createSoup(simulation_settings.simulation_area.width, simulation_settings.simulation_area.height, simulation_settings.particle_quantity);
    } else if (p.key === '[') {
      general_settings.place_type --;
      if ( general_settings.place_type < 0 ) {
        general_settings.place_type = Object.keys(particle_types).length - 1;
      }
    } else if (p.key === ']') {
      general_settings.place_type ++;
      if ( general_settings.place_type > Object.keys(particle_types).length - 1) {
        general_settings.place_type = 0;
      }
    } else if (p.key === 'u') {
      general_settings.display_UI = !general_settings.display_UI;
    }
  }

  p.windowResized = function() {
  		drawCanvas()
	}
}

//Instantiates P5 sketch to keep it out of the global scope.
const app = new p5(sketch);
