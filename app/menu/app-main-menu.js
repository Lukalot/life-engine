const   { ipcMain, dialog, nativeTheme } = require ( 'electron' ),
        fs = require ( 'fs' ),
        path = require ( 'path' ),
        hjson = require ( 'hjson' ),
        isMac = process.platform === 'darwin',
        wrapText = ( title, wrap ) => wrap.left + title + wrap.right,
        padding = {
            file: {
                spacer: " ".repeat ( 24 ),
                left: " ".repeat ( 6 ),
                right: " ".repeat ( 6 )
            },
            edit: {
                spacer: " ".repeat ( 24 ),
                left: " ".repeat ( 9 ),
                right: " ".repeat ( 9 )
            }
        };

require = require ( '../dev/require' ) ( require );

const   deepCopy = require ( '../dev/utils/deepCopy.js' );

function asyncResponse ( senderArgs, webContents, callback ) {
    if ( 'function' === typeof callback ) {
        ipcMain.once ( senderArgs [ 0 ], ( event, ...args ) => callback ( ...args ) );
    }
    webContents.send ( ...senderArgs );
}


module.exports = ( windows, workspace ) => {
    const   file = deepCopy ( workspace.file ),
            recent = deepCopy ( workspace.recent ),
            userPreferences = deepCopy ( workspace.preferences );

    windows.main.on ( 'close', () => {
        workspace.file.path = file.path;
        workspace.preferences.theme = userPreferences.theme;
        workspace.preferences.launchMostRecent = userPreferences.launchMostRecent;

        for ( let item of recent ) {
            item.timestamp = fs.statSync ( item.path ).mtimeMs;
        }

        recent.sort ( ( a, b ) => a.timestamp - b.timestamp );

        recent.length = Math.min ( recent.length, 10 );

        workspace.recent = recent.map ( item => item.path );

        let name = path.join ( __dirname, '../ui/workspace.hjson' );

        fs.writeFile ( name, hjson.stringify ( workspace, {
            bracesSameLine: true,
            quotes: 'strings',
            separator: true,
            space: 4
        } ), 'utf-8', err => {
            if ( err ) {
                console.error ( 'Unable to save user workspace: ' + name, err );
            }
        } );
    } );

    let preferences = [
        {
            label: 'Theme System',
            type: 'radio',
            checked: userPreferences.theme === 'System',
            click () {
                userPreferences.theme = 'System';
                nativeTheme.themeSource = 'system';
            }
        },
        {
            label: 'Theme Light',
            type: 'radio',
            checked: userPreferences.theme === 'Light',
            click () {
                userPreferences.theme = 'Light';
                nativeTheme.themeSource = 'light';
            }
        },
        {
            label: 'Theme Dark',
            type: 'radio',
            checked: userPreferences.theme === 'Dark',
            click () {
                userPreferences.theme = 'Dark';
                nativeTheme.themeSource = 'dark';
            }
        },
        { type: 'separator' },
        {
            label: 'Open Recent on Launch',
            type: 'checkbox',
            checked: userPreferences.launchMostRecent,
            click () {
                userPreferences.launchMostRecent = !userPreferences.launchMostRecent;
            }
        }
    ];

    recent.map ( ( path, index ) => ( {
        label: path.slice ( -30 ),
        toolTip: path,
        accelerator: 'CmdOrCtrl+Shift+' ( index ),
        click () {
            let text = '';
            try {
                text = fs.readFileSync ( path, 'utf-8' );
            } catch ( err ) {
                windows.main.webContents.send ( 'error', 'Unable to open file: ' + path, err );
            }

            if ( text ) {
                windows.editSim.webContents.send ( 'load', text );
            }
        }
    } ) );

return [
    {
        label: wrapText ( 'File', padding.file ),
        // accelerator: 'Alt+F', // doesn't work
        submenu: [
            {
                label: 'New File...' + padding.file.spacer,
                accelerator: 'CmdOrCtrl+N',
                click () {
                    asyncResponse ( [ 'reset' ], windows.editSim.webContents, () => windows.editSim.show () );
                }
            },
            {
                label: 'Open File...',
                accelerator: 'CmdOrCtrl+O',
                click () {
                    let file = dialog.showOpenDialogSync ( windows.main, {
                            title: 'LifeEngine - Open Simulation File',
                            filters: [ { name: 'Simulation', extensions: [ 'hjson' ] } ],
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
            },
            { type: 'separator' },
            {
                label: 'Save',
                accelerator: 'CmdOrCtrl+S',
                click () {
                    let callback = null, save = null;

                    save = ( file, text ) => {
                        if ( file ) {
                            fs.writeFile ( file, text, 'utf-8', err => {
                                if ( err ) {
                                    return windows.main.webContents.send ( 'error', 'Unable to save file: ' + file.path, err );
                                }

                                windows.main.webContents.send ( 'notify', 'File saved: ' + file.path );
                            } );
                        }
                    };

                    callback = text => {
                        if ( workspace ) {
                            file.content = text;
                            if ( !file.path ) {
                                let file = dialog.showSaveDialogSync ( windows.main, {
                                        title: 'LifeEngine - Save File As',
                                        defaultPath: 'simulation.hjson',
                                        filters: [ { name: 'Simulation', extensions: [ 'hjson' ] } ]
                                    } );
                                if ( file ) {
                                    file.path = file;
                                }
                            }

                            save ( file.path, file.content );
                        } else {
                            console.log ( 'saving' );
                        }
                    };

                    asyncResponse ( [ 'get' ], windows.editSim.webContents, callback );
                }
            },
            {
                label: 'Save As...',
                accelerator: 'CmdOrCtrl+Shift+S',
                click () {
                    let file = dialog.showSaveDialogSync ( windows.main, {
                            title: 'LifeEngine - Save File As',
                            defaultPath: 'simulation.hjson',
                            filters: [ { name: 'Simulation', extensions: [ 'hjson' ] } ]
                        } );
                    if ( file ) {
                        file.path = file;
                        asyncResponse ( [ 'get' ], windows.editSim.webContents, text => {
                            fs.writeFile ( file, text, 'utf-8', err => {
                                if ( err ) {
                                    return windows.main.webContents.send ( 'error', 'Unable to save file: ' + file, err );
                                }

                                windows.main.webContents.send ( 'notify', 'File saved as: ' + file );
                            } );
                        } )
                    }
                }
            },
            { type: 'separator' },
            { role: isMac ? 'close' : 'quit', accelerator: 'CmdOrCtrl+Q' }
        ]
    },
    {
        id: 'Edit',
        label: wrapText ( 'Edit', padding.edit ),
        // accelerator: 'Alt+E', // doesn't work
        submenu: [
            {
                label: 'Simulation' + padding.edit.spacer,
                accelerator: 'CmdOrCtrl+E',
                click () {
                    windows.editSim.show ();
                }
            },
            { type: 'separator' },
            {
                label:  'Recent Files...',
                // accelerator: 'CmdOrCtrl+R', // doesn't work with submenu
                id: 'RecentFiles',
                submenu: recent
            },
            { type: 'separator' },
            {
                label: 'Preferences',
                id: 'Preferences',
                submenu: preferences
            }
        ]
    }
] };
