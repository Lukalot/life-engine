module.exports = function ( ipcMain, windows ) {

    const   handles = {
        
    };

    ipcMain.on ( 'app-color-picker', ( event, handle, ...args ) => {
        if ( handle in handles ) {
            handles [ handle ] ( ...args );
        }
    } );
};
