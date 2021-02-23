!function () {
    const   IPC = window [ "LifeEngine" ].ipc,
            ID = 'app-edit-sim';

    // reset the page,
    IPC.on ( 'reset', () => {
        window.sessionStorage.setItem ( 'reset', 'true' )
        window.location.reload ( false );
    } );

    // respond to "reset" after reload to avoid FOUC
    window.addEventListener ( 'DOMContentLoaded', event => {
        if ( window.sessionStorage.getItem ( 'reset' ) ) {
            window.sessionStorage.removeItem ( 'reset' );
            IPC.send ( 'reset' );
        }
    } );
} ();
