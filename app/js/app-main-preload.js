function preload () {
    require = require ( '../../require/uncached.js' ) ( require );

    require ( './ColorPicker.js' );
    require ( './DualSlider.js' );

    window.ipc = require ( 'electron' ).ipcRenderer;

    if ( require ( '../config.hjson' ).dev ) {
        window.ipc.send ( 'contentLoaded', 'main' );
    }

    window.removeEventListener ( 'DOMContentLoaded', preload );
}

window.addEventListener ( 'DOMContentLoaded', preload );
