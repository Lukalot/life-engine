const uncached = require ( '../utils/uncached.js' );
const deepCopyObject = uncached('../utils/deepCopy.js');
const simulation_settings = uncached ( '../config/simulation.hjson' );

// Set defaults and do one time computations on the input values, output a correct type object
module.exports = function generateTypesObject( object ) {

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
      object[type].max_size = 2 * Math.max.apply ( Math, Object.values ( object[type].relationships ).map ( v => v[v.length-1][0] ) );
    }

    current_type.additive_relationships = current_type.additive || false;
    current_type.solid = current_type.solid || false;
    current_type.friction = (1 - current_type.friction) || 1;
    current_type.acceleration = current_type.acceleration || true;
    current_type.mass = current_type.mass || 1;
  }
  // return object to be saved
  return nobject;
}
