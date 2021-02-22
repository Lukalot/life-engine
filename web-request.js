const electron = require('electron');
const session = electron.session;

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 600,
        frame: true,
        webPreferences: {
            devTools: true,
            webSecurity: false
        }
    });

    mainWindow.webContents.openDevTools();

    // and load the index.html of the app.
    mainWindow.loadURL('YOUR_WEBSITE_URL');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    // filter to catch all requests to wp-content folder
    const wpContentFilter = {
        urls: [
            'YOUR_WEBSITE_URL/*'
        ]
    };

    mainWindow.webContents.session.webRequest.onBeforeRequest(wpContentFilter, (details, callback) => {
        console.log('onBeforeRequest details', details);
        const {
            url
        } = details;
        const localURL = url.replace('YOUR_WEBSITE_URL', 'YOUR_REDIRECT_SITE')
        // get local asset instead of one from pizza bottle

        callback({
            cancel: false,
            redirectURL: (encodeURI(localURL))
        });
    });

    mainWindow.webContents.session.webRequest.onErrorOccurred((details) => {
        console.log('error occurred on request');
        console.log(details);
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
