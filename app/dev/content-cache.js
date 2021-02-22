require = require ( './require' ) ( require );

const config = require ( '../config/config.hjson' );

module.exports = function saveCacheAfterPageLoad ( ipcMain ) {
    require ( './build-sources.js' );

    let onceLoaded = ( event, name ) => {
        if ( name in config.ui ) {
            config.ui [ name ].loaded = true;

            let allContentLoaded = true;

            for ( let status of Object.values ( config.ui ) ) {
                // any window not loaded will falsify _all_
                allContentLoaded = allContentLoaded && status.loaded;
            }

            if ( allContentLoaded ) {
                // in dev mode save require'd cache ( see require/uncached.js )
                require.save ();
                ipcMain.removeListener ( 'content-loaded', onceLoaded );
            }
        }
    };

    ipcMain.on ( 'content-loaded', onceLoaded );
};
