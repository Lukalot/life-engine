const   { app, Menu, ipcMain, dialog } = require ( 'electron' ),
        isMac = process.platform === 'darwin';

module.exports = function loadAppMenu ( windows ) {
    return [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New...',
                    accelerator: 'CmdOrCtrl+N',
                    click () {
                        windows.createSim.show ();
                    }
                },
                {
                    label: 'Open File',
                    accelerator: 'CmdOrCtrl+F',
                    click () {
                        let file = dialog.showOpenDialogSync ( windows.main, {} );
                    }
                }
            ]
        }
    ];
};
