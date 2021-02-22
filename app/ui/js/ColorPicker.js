!function () {
'use strict';

const   template = document.createElement ( 'template' );

// format/remove whitespace between tags
template.innerHTML = `<link href="../css/color-picker.css" rel="stylesheet" type="text/css"><div class="content"><div class="h"><div class="sv"><div class="sv-pointer"></div><div class="sv-overlay"></div></div></div><div class="hue"><div class="h-pointer"></div><div class="h-overlay"></div></div></div>`;

function hsvToHsl ( V, L ) {
    let { h, s, v } = V,
        l = v - 0.5 * v * s,
        m = Math.min ( l, 1 - l );
    s = m ? ( v - l ) / m : 0;
    L.h = h;
    L.s = s;
    L.l = l;
}

function rgbToHsv ( R, V ) {
    let { r, g, b } = R,
        v = Math.max ( r, g, b ),
        c = v - Math.min ( r, g, b ),
        h = c && (
            v === r ? ( g - b ) / c : (
                v === g ? 2 + ( b - r ) / c :
                4 + ( r - g ) / c
            )
        );
    V.h = ( h < 0 ? h + 6 : h ) / 6;
    V.s = v ? c / v : 0;
    V.v = v;
}

window.customElements.define ( 'color-picker', class ColorPicker extends HTMLElement {

    #value = "";
    #previousValue = "";
    #offsets = null;
    #hsv = null;
    #hsl = null;
    #rgb = null;
    #hue = null;
    #hPointer = null;
    #satVal = null;
    #satValComputed = null;
    #changed = false;
    #reverting = false;
    #updating = false;
    #setting = false;
    #connected = false;
    #inputValue = null;
    #changeValue = null;
    #shadow = null;

    static get observedAttributes () {
        return [ 'value' ];
    }

    get value () {
        return this.#value;
    }

    set value ( val ) {
        this.#inputValue ( val );
    }

    attributeChangedCallback ( name, old, value ) {
        if ( !this.#setting ) {
            this.value = value;
        }
    }

    constructor () {
        super ();

        // if ( !template ) {
        //     template = document.createElement ( 'template' );
        //     template.innerHTML = html;
        // }

        this.#shadow = this.attachShadow ( { mode: 'closed' } );
        this.#shadow.appendChild ( template.content.cloneNode ( true ) );
    }

    connectedCallback () {
        if ( !this.#connected ) {

            this.#connected = true;

            let hframe = NaN, svframe = NaN;

            const   shadow = this.#shadow,
                    offsets = { h: { top: 0 }, sv: { top: 255, left: 0 } },
                    hsv = { h: 0, s: 0, v: 0 },
                    hsl = { h: 0, s: 0, l: 0.5 },
                    rgb = { r: 0, g: 0, g: 0 },
                    updateH = ts => {
                        this.#updating = true;
                        this.#inputValue ();
                        this.#updating = false;
                        hframe = window.requestAnimationFrame ( updateH );
                    },
                    updateSV = ts => {
                        this.#updating = true;
                        this.#inputValue ();
                        this.#updating = false;
                        svframe = window.requestAnimationFrame ( updateSV );
                    },
                    pointermoveH = event => {
                        if ( !this.#changed ) {
                            this.#changed = true;
                            this.#previousValue = this.#value;
                        }
                        offsets.h.top = Math.min ( Math.max ( 0, offsets.h.top + event.movementY ), 255 );
                    },
                    pointermoveSV = event => {
                        if ( !this.#changed ) {
                            this.#changed = true;
                            this.#previousValue = this.#value;
                        }
                        offsets.sv.left = Math.min ( Math.max ( 0, offsets.sv.left + event.movementX ), 255 );
                        offsets.sv.top = Math.min ( Math.max ( 0, offsets.sv.top + event.movementY ), 255 );
                    },
                    pointerupH = event => {
                        window.cancelAnimationFrame ( hframe );
                        window.removeEventListener ( 'pointermove', pointermoveH );
                        window.removeEventListener ( 'pointerup', pointerupH );
                        this.#changeValue ();
                    },
                    pointerupSV = event => {
                        window.cancelAnimationFrame ( svframe );
                        window.removeEventListener ( 'pointermove', pointermoveSV );
                        window.removeEventListener ( 'pointerup', pointerupSV );
                        this.#changeValue ();
                    },
                    pointerdownH = event => {
                        let bounds = event.target.getBoundingClientRect ();
                        offsets.h.top = Math.min ( Math.max ( 0, Math.round ( event.clientY - bounds.top - 1 ) ), 255 );
                        window.addEventListener ( 'pointermove', pointermoveH );
                        window.addEventListener ( 'pointerup', pointerupH );
                        hframe = window.requestAnimationFrame ( updateH );
                    },
                    pointerdownSV = event => {
                        let bounds = event.target.getBoundingClientRect ();
                        offsets.sv.left = Math.min ( Math.max ( 0, Math.round ( event.clientX - bounds.left - 1 ) ), 255 );
                        offsets.sv.top = Math.min ( Math.max ( 0, Math.round ( event.clientY - bounds.top - 1 ) ), 255 );
                        window.addEventListener ( 'pointermove', pointermoveSV );
                        window.addEventListener ( 'pointerup', pointerupSV );
                        svframe = window.requestAnimationFrame ( updateSV );
                    },
                    cancelH = event => {

                    },
                    cancelSV = event => {

                    };

            let svEl = shadow.querySelector ( '.sv-pointer' );

            this.#hsv = hsv;
            this.#hsl = hsl;
            this.#rgb = rgb;
            this.#offsets = offsets;
            this.#hPointer = shadow.querySelector ( '.h-pointer' ).style;
            this.#hue = shadow.querySelector ( '.h' ).style;
            this.#satVal = svEl.style;
            this.#satValComputed = getComputedStyle ( svEl );

            // configure private methods
            // see https://www.chromestatus.com/feature/5700509656678400
            this.#inputValue = val => {
                let update = false,
                    rgb = this.#rgb,
                    hsv = this.#hsv,
                    hsl = this.#hsl,
                    offsets = this.#offsets,
                    hPointer = this.#hPointer,
                    hue = this.#hue,
                    satVal = this.#satVal,
                    satValComputed = this.#satValComputed,
                    hColor = "",
                    svColor = "";

                if ( this.#updating ) {
                    if ( offsets.h.top !== Number ( hPointer.top ) ) {
                        update = true;
                        hsl.h = hsv.h = 0.00390625 * offsets.h.top;
                    }
                    if ( offsets.sv.left !== Number ( satVal.left ) || offsets.sv.top !== Number ( satVal.top ) ) {
                        update = true;
                        hsv.s = offsets.sv.left / 255;
                        hsv.v = ( 255 - offsets.sv.top ) / 255;
                        hsvToHsl ( hsv, hsl );
                    }
                    hColor = `hsl(${hsl.h}turn,100%,50%)`;
                    svColor = `hsl(${hsl.h}turn,${100*hsl.s}%,${100*hsl.l}%)`;
                } else {
                    // check for computed color === this.#value
                    svColor = satVal.backgroundColor;
                    satVal.backgroundColor = val;
                    val = satValComputed.backgroundColor;
                    satVal.backgroundColor = svColor;
                    if ( update = val === this.#value ) {
                        svColor = val;
                        let [ r, g, b ] = val.split ( /[(,)]/ ).slice ( 1, 4 ).map ( n => Number ( n ) );
                            rgb.r = r;
                            rgb.g = g;
                            rgb.b = b;
                        rgbToHsv ( rgb, hsv );
                        hColor = `hsl(${hsv.h}turn,100%,50%)`;
                        offsets.h.top = 255 * ( 1 - hsv.h );
                        offsets.sv.left = 255 * hsv.s;
                        offsets.sv.top = 255 * ( 1 - hsv.v );
                    }
                }
                if ( update && ( this.#reverting || this.dispatchEvent (
                    new CustomEvent ( 'input', {
                        detail: Object.freeze ( { inputValue: svColor, currentValue: this.#value } )
                    } )
                ) ) ) {
                    hPointer.top = offsets.h.top + 'px';
                    satVal.left = offsets.sv.left + 'px';
                    satVal.top = offsets.sv.top + 'px';
                    hue.backgroundColor = hColor;
                    satVal.backgroundColor = svColor;
                    this.#setting = true;
                    this.#value = svColor;
                    this.setAttribute ( 'value', satValComputed.backgroundColor );
                    this.#setting = false;
                }
            };

            this.#changeValue = () => {
                if ( this.#changed ) {
                    this.#changed = false;
                    if ( !this.dispatchEvent (
                        new CustomEvent ( 'changed', {
                            detail: Object.freeze ( { currentValue: this.#value, previousValue: this.#previousValue } )
                        } )
                    ) ) { // if cancelled
                        this.#reverting = true;
                        this.value = this.#previousValue;
                        this.#reverting = false;
                    }
                }
            };

            if ( this.hasAttribute ( 'value' ) ) {
                this.value = this.getAttribute ( 'value' );
            } else {
                this.#value = this.#satValComputed.backgroundColor;
                this.#setting = true;
                this.setAttribute ( 'value', this.#value );
                this.#setting = false;
            }

            // bind pointerdown events
            shadow.querySelector ( '.h-overlay' ).addEventListener ( 'pointerdown', pointerdownH );
            shadow.querySelector ( '.sv-overlay' ).addEventListener ( 'pointerdown', pointerdownSV );
        }
    }
} );
} ();
