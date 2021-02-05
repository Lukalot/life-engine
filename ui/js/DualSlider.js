'use strict';

require = require ( '../../require' );

const   template = document.createElement ( 'template' ),
        html = require ( `../ui/html/dual-slider.html` );

// format/remove whitespace between tags
template.innerHTML = html.replace ( /\n\s*/g, '' );

window.customElements.define ( 'dual-slider', class DualSlider extends HTMLElement {

    static get observedAttributes () { return [ 'bound', 'low', 'high' ]; }

    #low = 0;
    #high = 0;
    #low_marker = null;
    #high_marker = null;
    #bound = false;
    #vertical = false;
    #updating = false;
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

    get low () {
        return this.#low;
    }

    set low ( val ) {
        this.#low = Math.min ( Math.max ( 0, Number ( val ) ), 1 );
        this.#low_marker.width = ( 100.0 * this.#low ) + '%';
        this.#updating = true;
        this.setAttribute ( 'low', this.#low );
        this.#updating = false;
        if ( this.#bound && ( this.#low + this.#high > 1.0 ) ) {
            this.high = 1.0 - this.#low;
        }
    }

    get high () {
        return this.#high;
    }

    set high ( val ) {
        this.#high = Math.min ( Math.max ( 0, Number ( val ) ), 1 );
        this.#high_marker.width = ( 100.0 * this.#high ) + '%';
        this.#updating = true;
        this.setAttribute ( 'high', this.#high );
        this.#updating = false;
        if ( this.#bound && ( ( this.#high + this.#low ) > 1.0 ) ) {
            this.low = 1.0 - this.#high;
        }
    }

    get bound () {
        return !!this.#bound;
    }

    set bound ( val ) {
        this.#bound = !!val;
        this.#updating = true;
        if ( this.#bound && !this.hasAttribute ( 'bound' ) ) {
            this.setAttribute ( 'bound', '' );
        } else {
            this.removeAttribute ( 'bound' );
        }
        this.#updating = false;
    }

    attributeChangedCallback ( name, old, val ) {
        if ( !this.#updating ) {
            if ( name in this.#attrs ) {
                this.#attrs [ name ].call ( this, old, val );
            }
        }
    }

    connectedCallback () {
        this.#bound = this.hasAttribute ( 'bound' );
        if ( this.hasAttribute ( 'low') ) {
            this.low = this.getAttribute ( 'low' );
        }
        if ( this.hasAttribute ( 'high' ) ) {
            this.high = this.getAttribute ( 'high' );
        }
    }

    constructor () {
        super ();

        const   low = { name: "low", id: NaN, frame: NaN, offset: NaN, bounds: NaN, down: null, move: null, up: null, update: null },
                high = { name: "high", id: NaN, frame: NaN, offset: NaN, bounds: NaN, down: null, move: null, up: null, update: null },
                content = template.content.cloneNode ( true ),
                pointers = content.querySelectorAll ( '.pointer' ),
                markers = content.querySelectorAll ( '.marker' ),
                bar = content.querySelector ( '.bar' ),
                update = ( pointer, ts ) => {
                    let size = pointer.bounds;
                    this [ pointer.name ] = Math.min ( Math.max ( 0, pointer.offset ), size ) / size;
                    pointer.frame = window.requestAnimationFrame ( pointer.update );
                },
                pointermove = ( pointer, event ) => {
                    if ( event.pointerId === pointer.id ) {
                        let size = pointer.bounds, movement = event [ this.vertical ? "movementY" : "movementX" ];
                        movement = "low" === pointer.name ? movement : -movement;
                        pointer.offset = Math.min ( Math.max ( 0, pointer.offset + movement ), size );
                    }
                },
                pointerup = ( pointer, event ) => {
                    if ( event.pointerId === pointer.id ) {
                        window.cancelAnimationFrame ( pointer.frame );
                        window.removeEventListener ( 'pointermove', pointer.move );
                        window.removeEventListener ( 'pointerup', pointer.up );
                    }
                },
                pointerdown = ( pointer, event ) => {
                    pointer.bounds = bar.getBoundingClientRect () [ this.vertical ? "height" : "width" ];
                    pointer.id = event.pointerId;
                    pointer.offset = markers [ "low" === pointer.name ? 0 : 1 ].getBoundingClientRect () [ this.vertical ? "height" : "width" ];
                    window.addEventListener ( 'pointermove', pointer.move );
                    window.addEventListener ( 'pointerup', pointer.up );
                    pointer.frame = window.requestAnimationFrame ( pointer.update );
                };

                low.down = pointerdown.bind ( null, low );
                low.move = pointermove.bind ( null, low );
                low.up = pointerup.bind ( null, low );
                low.update = update.bind ( null, low );
                high.down = pointerdown.bind ( null, high );
                high.move = pointermove.bind ( null, high );
                high.up = pointerup.bind ( null, high );
                high.update = update.bind ( null, high );

        pointers [ 0 ].addEventListener ( 'pointerdown', low.down );
        pointers [ 1 ].addEventListener ( 'pointerdown', high.down );

        this.#low_marker = markers [ 0 ].style;
        this.#high_marker = markers [ 1 ].style;

        this.attachShadow ( { mode: 'closed' } ).appendChild ( content );
    }
} );
