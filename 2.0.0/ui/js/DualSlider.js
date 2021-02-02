'use strict';

const   csspath = require ( '../../js/config.hjson' ).csspath,
        name = 'dual-slider',
        template = document.createElement ( 'template' );

template.innerHTML = require ( `./html/${name}.html` ).replace ( /\n\s*/g, '' ).replace ( '$$$', `${csspath + name}.css` );

class DualSlider extends HTMLElement {

    #low = 0;
    #high = 0;
    #bound = false;
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
        val = Math.min ( Math.max ( 0, Number ( val ) ), 1 );
        this.setAttribute ( 'low', this.#low );
        if ( this.#bound & val > this.#high ) {
            this.#high = 1.0 - val;
            this.setAttribute ( 'low', this.#high );
        }
    }

    get high () {
        return this.#high;
    }

    set high ( val ) {
        val = Math.min ( Math.max ( 0, Number ( val ) ), 1 );
        this.setAttribute ( 'high', this.#high );
        if ( this.#bound & val > this.#low ) {
            this.#low = 1.0 - val;
            this.setAttribute ( 'low', this.#low );
        }
    }

    get bound () {
        return !!this.#bound;
    }

    set bound ( val ) {
        val = !!val;
        if ( val & !this.hasAttribute ( 'bound' ) ) {
            this.setAttribute ( 'bound', '' );
        } else {
            this.removeAttribute ( 'bound' );
        }
    }

    attributeChangedCallback ( name, old, val ) {
        if ( name in this.attrs ) {
            this.#attrs [ name ].call ( this, old, val );
        }
    }

    constructor () {
        super ();

        const   low = { name: "low", id: NaN, frame: NaN, offset: NaN, bounds: null, down: null, move: null, up: null, update: null },
                high = { name: "high", id: NaN, frame: NaN, offset: NaN, bounds: null, down: null, move: null, up: null, update: null },
                content = template.content.cloneNode ( true ),
                pointers = content.querySelectorAll ( '.pointer' ),
                markers = content.querySelectorAll ( '.marker' ),
                bar = content.querySelector ( '.bar' ),
                update = ( pointer, ts ) => {
                    let size = this.vertical ? bounds.height : bounds.width;
                    this [ pointer.name ] = Math.min ( Math.max ( 0, pointer.offset ), size ) / size;
                    pointer.frame = window.requestAnimationFrame ( pointer.update );
                },
                pointermove = ( pointer, event ) => {
                    if ( event.pointerId === pointer.id ) {
                        let size, movement;
                        if ( this.vertical ) {
                            size = bounds.height;
                            movement = "movementY"
                        } else {
                            size = bounds.width;
                            movement = "movementX";
                        }
                        pointer.offset = Math.min ( Math.max ( 0, pointer.offset + event [ movement ] ), size );
                    }
                },
                pointerup = event => {
                    if ( event.pointerId === pointer.id ) {
                        window.stopAnimationFrame ( pointer.frame );
                        window.removeEventListener ( 'pointermove', pointer.move );
                        window.removeEventListener ( 'pointerup', pointer.up );
                    }
                },
                pointerdown = ( pointer, event ) => {
                    pointer.bounds = bar.getBoundingClientRect ();
                    pointer.id = event.pointerId;
                    pointer.offset = markers [ 0 ].getBoundingClientRect () [ this.vertical ? "height" : "width" ];
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

        this.attachShadow ( { mode: 'closed' } ).appendChild ( content );
    }
}

window.customElements.define ( 'dual-slider', DualSlider );
