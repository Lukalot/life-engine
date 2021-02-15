// Modules to control application life and create native browser window
const {
        app,
        BrowserWindow,
        ipcMain,
        Menu,
        // nativeTheme,
    } = require ( 'electron' ),
    path = require ( 'path' ),
    SRC_PATH = path.join ( app.getAppPath(), 'app/js' ),
    HTML_PATH = path.join ( app.getAppPath(), 'app/html' );

require ( 'electron-reload' )( __dirname, {
    electron: path.join ( __dirname, 'node_modules', '.bin', 'electron' )
} );

// require extensions and dev wrapper ( if applicable )
require = require ( './require' ) ( require );

let config = require ( './app/config.hjson' );

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let   windows = {};

const ipcChannels = [ 'contentLoaded' ];

function handleDevCaching () {
    if ( config.dev ) {

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
                    ipcMain.removeListener ( 'contentLoaded', onceLoaded );
                }
            }
        };

        ipcMain.on ( 'contentLoaded', onceLoaded );
    }
}

function buildMenu ( win, src ) {

    let menu = src ? Menu.buildFromTemplate ( require ( path.join ( SRC_PATH , src ) ) ( windows ) ) : null;

    if ( win ) {
        if ( process.platform === "darwin" ) {
            win.on ( "focus", () => {
                Menu.setApplicationMenu ( menu );
            } );
        } else {
            win.setMenu ( menu );
        }
    }

    return menu;
}

function configWindow ( config ) {

    config.init.webPreferences.preload = path.join ( SRC_PATH, config.init.webPreferences.preload );
    let win = new BrowserWindow ( config.init );

    config.layout = path.join ( HTML_PATH, config.layout );
    win.loadFile ( config.layout );

    return win;
}

function ipcConfig ( ipcMain, windows ) {

}

function buildUI () {

    // create the application menu, this will automatically become the menu
    // of the main window
    Menu.setApplicationMenu ( buildMenu ( null, config.ui.main.menu ) );

    // handle file cache when in dev mode
    handleDevCaching ();

    // main is the parent window
    windows.main = configWindow ( config.ui.main );

    // initialize other windows with main as the parent
    for ( let [ name, cfg ] of Object.entries ( config.ui ).slice ( 1 ) ) {
        cfg.parent = windows.main;
        windows [ name ] = configWindow ( cfg );
        buildMenu ( windows [ name ], cfg.menu );
    }

    // handle ipcMain requests, renderer ipc is handled by renderer scripts
    require ( './app/js/ipc-config.js' ) ( ipcMain, windows );

    windows.main.maximize ();
    windows.main.webContents.openDevTools ();

    windows.main.once ( 'ready-to-show', function () {
        // use preferred user theme ( this doesn't seem to work on window frames in electron )
        nativeTheme.themeSource = 'system';
    } );

    windows.main.on ( 'closed', function () {

        // detatch ipc channels, this removes access to any event-registered
        // references to in-memory windows. hopefully garbage collection can
        // find and free them once forgotten
        for ( let channel of ipcChannels ) {
            ipcMain.removeAllListeners ( channel );
        }

        // close any other windows
        Object.values ( windows ).slice ( 1 ).forEach ( win => win.close () );

        // forget all in memory windows
        windows = {};

        // process may stay alive, reset config in case we rebuild the ui
        if ( process.platform === 'darwin' ) {
            config = require ( './app/config.hjson' );
        } // otherwise everthing should be cordoned off for termination
    } );
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on ('ready', buildUI );

// Quit when all windows are closed.
app.on ( 'window-all-closed', function() {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit ();
    }
} );

app.on ( 'activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if ( !Object.keys ( windows ).length ) {
        buildUI ();
    }
} );

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
