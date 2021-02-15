'use strict';

require = require ( '../../require/uncached.js' ) ( require );

const   template = document.createElement ( 'template' ),
        LOW_DEFAULT = 0,
        HIGH_DEFAULT = 1;

// format/remove whitespace between tags
template.innerHTML = require ( `../html/dual-slider.html` ).replace ( /\n\s*/g, '' );

window.customElements.define ( 'dual-slider', class DualSlider extends HTMLElement {

    #low = LOW_DEFAULT;
    #high = HIGH_DEFAULT;
    #previousLow = NaN;
    #previousHigh = NaN;
    #bound = false;
    #setting = false;
    #lowChanged = false;
    #highChanged = false;
    #connected = false;
    #attrs = {
        bound: function ( old, val ) {
            val = !!val;
            if ( val !== this.#bound ) {
                this.bound = val;
            }
        },
        low: function ( old, val ) {
            val = Number ( val );
            if ( val !== this.#low ) {
                this.low = val;
            }
        },
        high: function ( old, val ) {
            val = Number ( val );
            if ( val !== this.#high ) {
                this.high = val;
            }
        }
    };
    #inputLow = null;
    #inputHigh = null;
    #changeLow = null;
    #changeHigh = null;
    #shadow = null;

    static get observedAttributes () { return [ 'bound', 'low', 'high' ]; }

    get low () {
        return this.#low;
    }

    set low ( val ) {
        this.#inputLow ( val );
    }

    get high () {
        return this.#high;
    }

    set high ( val ) {
        this.#inputHigh ( val );
    }

    get bound () {
        return !!this.#bound;
    }

    set bound ( val ) {
        this.#bound = !!val;
        this.#setting = true;
        if ( this.#bound ) {
            this.setAttribute ( 'bound', '' );
        } else {
            this.removeAttribute ( 'bound' );
        }
        this.#setting = false;
    }

    attributeChangedCallback ( name, old, val ) {
        if ( !this.#setting ) {
            if ( name in this.#attrs ) {
                this.#attrs [ name ].call ( this, old, val );
            }
        }
    }

    constructor () {
        super ();

        this.#shadow = this.attachShadow ( { mode: 'closed' } )
        this.#shadow.appendChild ( template.content.cloneNode ( true ) );
    }

    connectedCallback () {
        if ( !this.#connected ) {

            this.#connected = true;

            const pointerData = { frame: NaN, offset: NaN };

            let size = NaN,
                low = Object.assign ( Object.create ( null ), pointerData ),
                high = Object.assign ( Object.create ( null ), pointerData );

            const   shadow = this.#shadow,
                    pointers = shadow.querySelectorAll ( '.pointer' ),
                    markers = shadow.querySelectorAll ( '.marker' ),
                    bar = shadow.querySelector ( '.bar' ),
                    lowUpdate = ts => {
                        this.#inputLow ( low.offset / size );
                        low.frame = window.requestAnimationFrame ( lowUpdate );
                    },
                    highUpdate = ts => {
                        this.#inputHigh ( high.offset / size );
                        high.frame = window.requestAnimationFrame ( highUpdate );
                    },
                    lowMove = event => {
                        this.#lowChanged = true;
                        low.offset = Math.min ( Math.max ( 0, low.offset + event.movementX ), size );
                    },
                    highMove = event => {
                        this.#highChanged = true;
                        high.offset = Math.min ( Math.max ( 0, high.offset + event.movementX ), size );
                    },
                    lowUp = event => {
                        window.cancelAnimationFrame ( low.frame );
                        window.removeEventListener ( 'pointermove', lowMove );
                        window.removeEventListener ( 'pointerup', lowUp );
                        this.#changeLow ();
                    },
                    highUp = event => {
                        window.cancelAnimationFrame ( high.frame );
                        window.removeEventListener ( 'pointermove', highMove );
                        window.removeEventListener ( 'pointerup', highUp );
                        this.#changeHigh ();
                    },
                    lowDown = event => {
                        size = bar.getBoundingClientRect ().width;
                        low.offset = markers [ 0 ].getBoundingClientRect ().width;
                        this.#previousLow = low.offset / size;
                        window.addEventListener ( 'pointermove', lowMove );
                        window.addEventListener ( 'pointerup', lowUp );
                        low.frame = window.requestAnimationFrame ( lowUpdate );
                    },
                    highDown = event => {
                        size = bar.getBoundingClientRect ().width;
                        high.offset = size - markers [ 1 ].getBoundingClientRect ().width;
                        this.#previousHigh = high.offset / size;
                        window.addEventListener ( 'pointermove', highMove );
                        window.addEventListener ( 'pointerup', highUp );
                        high.frame = window.requestAnimationFrame ( highUpdate );
                    };

            this.#lowMarker = markers [ 0 ].style;
            this.#highMarker = markers [ 1 ].style;

            this.#inputLow = val => {
                val = Number ( val );
                if ( this.dispatchEvent ( new CustomEvent ( 'input',
                    { detail: Object.freeze ( { pointer: 'low', inputValue: val, currentValue: this.#low } ) }
                ) ) ) {
                    val = Math.min ( Math.max ( 0, isNaN ( val ) ? LOW_DEFAULT : val ), 1 );
                    if ( val !== this.#low ) {
                        this.#low = val;
                        this.#lowMarker.width = ( 100.0 * this.#low ) + '%';
                        this.#setting = true;
                        this.setAttribute ( 'low', this.#low );
                        this.#setting = false;
                        if ( this.#bound && ( this.#low > this.#high ) ) {
                            this.high = this.#low;
                        }
                    }
                }
            };

            this.#inputHigh = val => {
                val = Number ( val );
                if ( this.dispatchEvent ( new CustomEvent ( 'input',
                    { detail: Object.freeze ( { pointer: 'high', inputValue: val, currentValue: this.#high } ) }
                ) ) ) {
                    val = Math.min ( Math.max ( 0, isNaN ( val ) ? HIGH_DEFAULT : val ), 1 );
                    if ( val !== this.#high ) {
                        this.#high = val;
                        this.#highMarker.width = ( 100.0 * ( 1.0 - this.#high ) ) + '%';
                        this.#setting = true;
                        this.setAttribute ( 'high', this.#high );
                        this.#setting = false;
                        if ( this.#bound && ( this.#high < this.#low ) ) {
                            this.low = this.#high;
                        }
                    }
                }
            };

            this.#changeLow = () => {
                if ( this.#lowChanged ) {
                    this.#lowChanged = false;
                    if ( this.#previousLow !== this.#low ) {
                        if ( !this.dispatchEvent ( new CustomEvent ( 'change',
                            { detail: Object.freeze ( { pointer: 'low', currentValue: this.#low, previousValue: this.#previousLow } ) }
                        ) ) ) {
                            this.low = this.#previousLow;
                        }
                    }
                }
            };

            this.#changeHigh = () => {
                if ( this.#highChanged ) {
                    this.#highChanged = false;
                    if ( this.#previousHigh !== this.#high ) {
                        if ( !this.dispatchEvent ( new CustomEvent ( 'change',
                            { detail: Object.freeze ( { pointer: 'high', currentValue: this.#high, previousValue: this.#previousHigh } ) }
                        ) ) ) {
                            this.high = this.#previousHigh;
                        }
                    }
                }
            };

            this.low = this.hasAttribute ( 'low' ) ? this.getAttribute ( 'low' ) : this.#low;
            this.high = this.hasAttribute ( 'high' ) ? this.getAttribute ( 'high' ) : this.#high;
            this.bound = this.hasAttribute ( 'bound' );

            pointers [ 0 ].addEventListener ( 'pointerdown', lowDown );
            pointers [ 1 ].addEventListener ( 'pointerdown', highDown );
        }
    }
} );
