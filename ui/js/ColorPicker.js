'use strict';

require = require ( '../../require' );

const   template = document.createElement ( 'template' ),
        html = require ( `../ui/html/color-picker.html` );

// format/remove whitespace between tags
template.innerHTML = html.replace ( /\n\s*/g, '' );

function hsvToHsl ( V, L ) {
    let { h, s, v } = V,
        l = v - 0.5 * v * s,
        m = Math.min ( l, 1 - l );
    s = m ? ( v - l ) / m : 0;
    Object.assign ( L, { h, s, l } );
}

window.customElements.define ( 'color-picker', class ColorPicker extends HTMLElement {

    connectedCallback () {}

    constructor () {
        super ();

        let hframe = NaN, svframe = NaN;

        const   content = template.content.cloneNode ( true ),
                h = content.querySelector ( '.h-pointer' ).style,
                sv = content.querySelector ( '.sv-pointer' ).style,
                svBackground = content.querySelector ( '.h' ).style,
                hueInput = content.querySelector ( '.h-overlay' ),
                svInput = content.querySelector ( '.sv-overlay' ),
                bounds = { h: null, sv: null },
                offsets = { h: { top: 0 }, sv: { top: 255, left: 0 } },
                hsv = { h: 0, s: 0, v: 0 },
                hsl = { h: 0, s: 0, l: 0 },
                updateH = ts => {
                    h.top = offsets.h.top + 'px';
                    hsv.h = 0.00390625 * offsets.h.top;
                    hsvToHsl ( hsv, hsl );
                    sv.backgroundColor = `hsl(${hsl.h + 'turn'},${(hsl.s * 100) + '%'},${(hsl.l * 100) + '%'})`;
                    svBackground.backgroundColor = `hsl(${hsl.h + 'turn'},100%,50%)`;
                    let v = hsv.v;
                    hsv.v = Math.sqrt ( 1.0 - hsv.v );
                    hsvToHsl ( hsv, hsl );
                    sv.borderColor = `hsl(0,0%,${(hsl.l * 100) + '%'})`;
                    hsv.v = v;

                    hframe = window.requestAnimationFrame ( updateH );
                },
                updateSV = ts => {
                    sv.left = offsets.sv.left + 'px';
                    sv.top = offsets.sv.top + 'px';
                    hsv.s = offsets.sv.left / 255;
                    hsv.v = ( 255 - offsets.sv.top ) / 255;
                    hsvToHsl ( hsv, hsl );
                    sv.backgroundColor = `hsl(${hsl.h + 'turn'},${(hsl.s * 100) + '%'},${(hsl.l * 100) + '%'})`;
                    let v = hsv.v;
                    hsv.v = Math.sqrt ( 1.0 - hsv.v  );
                    hsvToHsl ( hsv, hsl );
                    sv.borderColor = `hsl(0,0%,${(hsl.l * 100) + '%'})`;
                    hsv.v = v;

                    svframe = window.requestAnimationFrame ( updateSV );
                },
                pointermoveH = event => {
                    offsets.h.top = Math.min ( Math.max ( 0, offsets.h.top + event.movementY ), 255 );
                },
                pointermoveSV = event => {
                    offsets.sv.left = Math.min ( Math.max ( 0, offsets.sv.left + event.movementX ), 255 );
                    offsets.sv.top = Math.min ( Math.max ( 0, offsets.sv.top + event.movementY ), 255 );
                },
                pointerupH = event => {
                    window.cancelAnimationFrame ( hframe );
                    window.removeEventListener ( 'pointermove', pointermoveH );
                    window.removeEventListener ( 'pointerup', pointerupH );
                },
                pointerupSV = event => {
                    window.cancelAnimationFrame ( svframe );
                    window.removeEventListener ( 'pointermove', pointermoveSV );
                    window.removeEventListener ( 'pointerup', pointerupSV );
                },
                pointerdownH = event => {
                    bounds.h = event.target.getBoundingClientRect ();
                    let pos = Math.min ( Math.max ( 0, event.clientY - bounds.h.top - 1 ), 255 );
                    offsets.h.top = pos;
                    hsv.h = 0.00390625 * pos;
                    window.addEventListener ( 'pointermove', pointermoveH );
                    window.addEventListener ( 'pointerup', pointerupH );

                    hframe = window.requestAnimationFrame ( updateH );
                },
                pointerdownSV = event => {
                    bounds.sv = event.target.getBoundingClientRect ();
                    let x = Math.min ( Math.max ( 0, event.clientX - bounds.sv.left - 1 ), 255 ),
                        y = Math.min ( Math.max ( 0, event.clientY - bounds.sv.top - 1 ), 255 );
                    offsets.sv.left = x;
                    offsets.sv.top = y;
                    hsv.s = x / 255;
                    hsv.v = ( 255 - y ) / 255;
                    window.addEventListener ( 'pointermove', pointermoveSV );
                    window.addEventListener ( 'pointerup', pointerupSV );

                    svframe = window.requestAnimationFrame ( updateSV );
                };

                hueInput.addEventListener ( 'pointerdown', pointerdownH );
                svInput.addEventListener ( 'pointerdown', pointerdownSV );

        this.attachShadow ( { mode: 'closed' } ).appendChild ( content );
    }
} );
