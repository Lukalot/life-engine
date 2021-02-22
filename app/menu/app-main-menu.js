const   { app, Menu, ipcMain, dialog } = require ( 'electron' ),
        fs = require ( 'fs' ),
        hjson = require ( 'hjson' ),
        isMac = process.platform === 'darwin',
        isWin = process.platform === 'win32';

require = require ( '../dev/require' ) ( require );

function asyncResponse ( senderArgs, webContents, callback ) {
    let responder = ( event, ...args ) => {
        if ( event.sender === webContents ) {
            ipcMain.removeListener ( senderArgs [ 0 ], responder );
            callback ();
        }
    };

    webContents.send ( ...senderArgs );
    ipcMain.on ( senderArgs [ 0 ], responder );
}


module.exports = windows => [
    {
        label: 'File',
        submenu: [
            {
                label: 'New...',
                accelerator: 'CmdOrCtrl+N',
                click () {
                    asyncResponse ( [ 'reset' ], windows.editSim.webContents, () => windows.editSim.show () );
                }
            },
            {
                label: 'Open Simulation File',
                accelerator: 'CmdOrCtrl+F',
                click () {
                    let file = dialog.showOpenDialogSync ( windows.main, {
                            title: 'LifeEngine - Open Simulation File',
                            filters: [ { name: 'simulation', extensions: [ 'hjson' ] } ],
                            properties: [ 'openFile' ]
                        } );
                    if ( file ) {
                        file = fs.readFile ( file [ 0 ], 'utf-8', ( err, text ) => {
                            if ( err ) {
                                // windows.main.webContents.send ( 'error', err );
                                return;
                            }
                            asyncResponse ( [ 'load', text ], windows.editSim.webContents, () => windows.editSim.show () );
                        } );
                    }
                }
            }
        ]
    }
];
