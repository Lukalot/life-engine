function preload () {
    require = require ( '../../require/uncached.js' ) ( require );

    window.ipc = require ( 'electron' ).ipcRenderer;

    if ( require ( '../config.hjson' ).dev ) {
        window.ipc.send ( 'contentLoaded', 'createSim' );
    }

    window.removeEventListener ( 'DOMContentLoaded', preload );
}

window.addEventListener ( 'DOMContentLoaded', preload );
