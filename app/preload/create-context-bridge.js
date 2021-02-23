const   { contextBridge } = require ( 'electron' );

require = require ( '../dev/require' ) ( require );

const   Registry = require ( './ipc-registry.js' );

module.exports = function createContextBridge ( ipcRenderer, apiName = 'api', api = {} ) {
    const   registry = new Registry ( ipcRenderer ),
            proxy = {
                send ( channel, ...data ) {
                    console.log ( data );
                    registry.send ( channel, ...data );
                },
                on ( channel, callback, acknowledge ) {
                    registry.on ( channel, callback, acknowledge );
                },
                once ( channel, callback, acknowledge ) {
                    registry.once ( channel, callback, acknowledge );
                },
                removeListener ( channel, callback, acknowledge ) {
                    registry.removeListener ( channel, callback, acknowledge );
                },
                removeAllListeners ( channel ) {
                    registry.removeAllListeners ( channel );
                }
            }
    contextBridge.exposeInMainWorld ( apiName, Object.assign ( {}, api, { ipc: proxy } ) );
};
