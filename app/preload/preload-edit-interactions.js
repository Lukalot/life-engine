const { ipcRenderer } = require ( 'electron' );

require = require ( '../dev/require' ) ( require );

const   createContextBridge = require ( './create-context-bridge.js' ),
        config = require ( '../config/config.hjson' ),
        DEV_MODE = config.dev,
        apiName = config.apiName;

createContextBridge ( ipcRenderer, apiName, {} );

if ( DEV_MODE ) {
    ipcRenderer.send ( 'content-loaded', 'editInteractions' );
}
