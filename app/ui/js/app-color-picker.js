!function () {
    const   IPC = window [ "LifeEngine" ].ipc,
            ID = 'app-color-picker',
            PALETTE = [],
            picker = document.getElementById ( 'colorpicker' ),
            color = document.getElementById ( 'color' ),
            palette = document.getElementById ( 'palette' ),
            keep = document.getElementById ( 'keep' ),
            confirm = document.getElementById ( 'confirm' );

    document.querySelectorAll ( '.item' ).forEach ( item => {
        item.addEventListener ( 'click', event => {
            if ( item.style.backgroundColor ) {
                picker.value = color.style.backgroundColor = item.style.backgroundColor;
                IPC.send ( ID, [ 'color-change', picker.value ] );
            }
        } );
    } );

    picker.addEventListener ( 'change', event => {
        color.style.backgroundColor = event.detail.currentValue;
        IPC.send ( ID, [ 'color-change', color.style.backgroundColor ] );
    } );

    picker.addEventListener ( 'input', event => {
        color.style.backgroundColor = event.detail.inputValue;
    } );

    keep.addEventListener ( 'click', event => {
        let last = palette.lastElementChild, color = picker.value;
        const maxlen = palette.children.length;
        palette.prepend ( last );
        last.style.backgroundColor = color;
        PALETTE.unshift ( color );
        if ( PALETTE.length > maxlen ) {
            PALETTE.length = maxlen;
        }
    } );

    confirm.addEventListener ( 'click', event => {
        IPC.send ( ID, [ 'confirm' ] );
    } );

    IPC.on ( 'remove-color', ( index ) => {
        let item = palette.children [ index ];
        item.style.backgroundColor = "";
        palette.appendChild ( item );
        PALETTE.splice ( index, 1 );
    } );
} ();
