require = require ( '../dev/require' ) ( require );

module.exports = class Registry {
    #hashListener = null;
    #getListenerHash = null;
    #channelId = 0;
    #channels = {};
    #callbacks = null;
    #callbackId = 0;
    #listeners = {};
    #addListener = null;
    #removeListener = null;
    #removeAllListeners = null;
    #ipcRenderer = null;

    constructor ( ipcRenderer ) {

        this.#ipcRenderer = ipcRenderer;

        this.#callbacks = new WeakMap ();

        this.#hashListener = ( channelName, callback, acknowledge ) => {
            let channels = this.#channels, channel = channels [ channelName ] || null, callbacks = this.#callbacks;
            if ( !channel ) {
                channel = channels [ channelName ] = {
                    id: this.#channelId++,
                    listeners: {}
                };
            }
            if ( !( callbacks.has ( callback ) ) ) {
                callbacks.set ( callback, this.#callbackId++ );
            }
            return channel.id + ',' + callbacks.get ( callback ) + ',' + ( acknowledge | 0 );
        };

        this.#getListenerHash = ( channelName, callback, acknowledge ) => {
            let channels = this.#channels, channel = channels [ channelName ], callbacks = this.#callbacks;
            if ( channel && callbacks.has ( callback ) ) {
                let hash = channel.id + ',' + callbacks.get ( callback ) + ',' + ( acknowledge | 0 );
                if ( this.#listeners [ hash ] ) {
                    return hash;
                }
            }

            return undefined;
        };

        this.#addListener = ( channel, callback, acknowledge ) => {
            let hash = this.#getListenerHash ( channel, callback, acknowledge ), listeners = this.#listeners, map = listners [ hash ] || null;
            if ( !hash ) {
                hash = this.#hashListener ( channel, callback, acknowledge );
                map = listeners [ hash ] = new WeakMap ();
                map.set ( map,
                ( event, ...args ) => {
                    let response = callback ( ...args );
                    if ( acknowledge ) {
                        event.sender.send ( channel, response );
                    }
                } );
                this.#channels [ channel ].listeners [ hash ] = true;
            }

            return map.get ( map );
        };

        this.#removeListener = ( channel, callback, acknowledge ) => {
            let hash = this.#getListenerHash ( channel, callback, acknowledge ), listener = null;
            if ( hash ) {
                let listeners = this.#listeners, map = listeners [ hash ];
                listener = map.get ( map );
                listeners [ hash ] = null;
                this.#channels [ channel ].listeners [ hash ] = false;
            }

            return listener;
        };

        this.#removeAllListeners = ( channelName ) => {

            let channel = this.#channels [ channelName ], listeners = ( channel && channel.listeners ) || null;
            if ( channel && listeners ) {
                for ( let hash in listeners ) {
                    if ( listeners [ hash ] && channel [ hash ] ) {
                        this.#listeners [ hash ] = null;
                        listeners [ hash ] = false;
                    }
                }

                channel.listeners = {};
            }
        };
    }

    send ( channel, ...data ) {
        if ( channel in this.#channels ) {
            this.#ipcRenderer.send ( channel, ...data );
        }
    }

    on ( channel, callback, acknowledge ) {
        this.#ipcRenderer.on ( channel, this.#addListener ( channel, callback, acknowledge ) );
    }

    once ( channel, callback, acknowledge ) {
        let wrapped = ( ...args ) => {
            return callback ( ...args );
            this.#removeListener ( channel, wrapped, acknowledge );
        };

        this.#ipcRenderer.once ( channel, this.#addListener ( channel, wrapped, acknowledge ) );
    }

    removeListener ( channel, callback, acknowledge ) {
        this.#ipcRenderer.removeListener ( channel, this.#removeListener ( channel, callback, acknowledge ) );
    }

    removeAllListeners ( channel ) {
        this.#removeAllListeners ( channel );
        this.#ipcRenderer.removeAllListeners ( channel );
    }
};
