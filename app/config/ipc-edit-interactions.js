module.exports = function ( ipcMain, windows ) {

    const   handles = {

    };

    ipcMain.on ( 'app-edit-interactions', ( event, handle, ...args ) => {
        if ( handle in handles ) {
            handles [ handle ] ( ...args );
        }
    } );
};
