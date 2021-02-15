const uncached = require ( './uncached.js' );

// load file extensions
// ( hard uncache the extensions module regardless of dev status )
uncached ( require ) ( './require-extensions.js' );

// if we are in dev mode use uncached(), otherwise require()
// ( also hard uncache the config file )
module.exports = uncached ( require ) ( '../app/config.hjson' ).dev ? uncached :
    function ( require ) {
        let wrapper = function ( name ) {
            return require ( name );
        };
        wrapper.save = function () {};
        wrapper.external = function ( name ) { return { updated: false } };
        return wrapper;
    };
