require = require ( '../dev/require' ) ( require );

module.exports = {
    main: require ( './ipc-main.js' ),
    editSim: require ( './ipc-edit-sim.js' ),
    editInteractions: require ( './ipc-edit-interactions.js' ),
    editParticle: require ( './ipc-edit-particle.js' ),
    editForce: require ( './ipc-edit-force.js' ),
    colorPicker: require ( './ipc-color-picker.js' )
}
