const   { contextBridge } = require ( 'electron' );

require = require ( '../dev/require' ) ( require );

const   Registry = require ( './ipc-registry.js' );

module.exports = function createContextBridge ( ipcRenderer, apiName = 'api', api = {} ) {
    contextBridge.exposeInMainWorld ( apiName, Object.assign ( {}, api, { ipc: new Registry () } ) );
};
