// Modules to control application life and create native browser window
const {
        app,
        BrowserWindow,
        ipcMain,
        Menu,
    } = require ( 'electron' ),
    path = require ( 'path' );

require ( 'electron-reload' )( __dirname, {
    electron: path.join ( __dirname, 'node_modules', '.bin', 'electron' )
} );

// require extensions and dev wrapper ( if applicable )
require = require ( './dev/require' ) ( require );

let deepCopy = require ( './dev/utils/deepCopy.js' ),
    originalConfig = require ( './config/config.hjson' ),
    config = deepCopy ( originalConfig ),
    paths = config.paths;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let   windows = {};

const   DEV_MODE = config.dev,
        DEBUG = false,
        workspace = require ( './ui/workspace.hjson' );

function buildMenu ( win, src ) {

    let menu = src ? Menu.buildFromTemplate (
        require ( path.join ( __dirname, paths.menu, src ) ) ( windows, workspace )
    ) : null;

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

    config.init.webPreferences.preload = path.join ( __dirname, paths.preload, config.preload );
    if ( DEV_MODE ) {
        config.init.webPreferences.devTools = true;
    }
    let win = new BrowserWindow ( config.init );

    config.layout = path.join ( __dirname, paths.layout, config.layout );
    win.loadFile ( config.layout );

    config.ipc = path.join ( __dirname, paths.ipc, config.ipc );
    require ( config.ipc ) ( ipcMain, windows );

    if ( config.init.parent ) {
        win.on ( 'close', event => {
            event.preventDefault ();
            win.hide ();
        } );
    }

    return win;
}

function buildUI () {

    // handle file cache when in dev mode
    if ( DEV_MODE ) {
        require ( './dev/content-cache.js' ) ( ipcMain );
    }

    if ( process.platform === "darwin" ) {
        // create the application menu, this will automatically become the menu
        // of the main window
        Menu.setApplicationMenu ( buildMenu ( null, config.ui.main.menu ) );
    }

    // use preferred user theme
    // - this doesn't seem to work on window frames in electron
    // - devtools seems to mung it
    // - the background is preferred when devtools is opened initally, but reverts when devtools is manually closed
    // - should implement theme selection at content/css query level
    // - opening devtools seems to grab the preferred theme
    // nativeTheme.themeSource = 'dark';

    // NOTE: windows are constructed in order and the parent property depends
    // on that order being maintained ( null parent means window is not modal,
    //  otherwise it is )
    for ( let [ name, cfg ] of Object.entries ( config.ui ) ) {
        if ( cfg.parent ) {
            cfg.init.parent = windows [ cfg.parent ];
        }

        // build the window
        windows [ name ] = configWindow ( cfg );

        // configure menu
        buildMenu ( windows [ name ], cfg.menu );
    }

    windows.main.on ( 'close', function ( event ) {
        windows = {};
    } );

    windows.main.on ( 'closed', function () {
        // process may stay alive, reset config in case we rebuild the ui
        if ( process.platform === 'darwin' ) {
            config = deepCopy ( originalConfig );
        } // otherwise everthing should be cordoned off for termination
    } );

    windows.main.maximize ();

    if ( DEV_MODE && DEBUG ) {
        windows.main.webContents.openDevTools ();
        windows.editSim.show ();
        windows.editSim.openDevTools ();
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on ('ready', buildUI );

// Quit when all windows are closed.
app.on ( 'window-all-closed', function() {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if ( process.platform !== 'darwin' ) {
        app.quit ();
    }
} );

app.on ( 'activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    buildUI ();
} );
