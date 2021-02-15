require = require ( '../../require/uncached.js' ) ( require );

const DEV_MODE = require ( '../config.hjson' ).dev;

if ( DEV_MODE ) {
    // externally loaded module, check for updated cache
    let ext = require.external ( './app-picker-preload.js' );
    if ( ext.updated ) {
        // return the updated module, otherwise the module is current - do nothing
        return ext.module;
    }
}

window.ipc = require ( 'electron' ).ipcRenderer;

if ( DEV_MODE ) {
    let once = () => {
        window.ipc.send ( 'contentLoaded', 'colorPicker' );
        window.removeEventListener ( 'DOMContentLoaded', once );
    };

    window.addEventListener ( 'DOMContentLoaded', once );
}
