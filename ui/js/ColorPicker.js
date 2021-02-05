'use strict';

require = require ( '../../require' );

const   template = document.createElement ( 'template' ),
        html = require ( `../ui/html/color-picker.html` );

// format/remove whitespace between tags
template.innerHTML = html.replace ( /\n\s*/g, '' );

window.customElements.define ( 'color-picker', class ColorPicker extends HTMLElement {

    connectedCallback () {}

    constructor () {
        super ();

        const   content = template.content.cloneNode ( true );

        this.attachShadow ( { mode: 'closed' } ).appendChild ( content );
    }
} );
