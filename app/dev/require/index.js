const   uncached = require ( './uncached.js' ),
        fs = require ( 'fs' ),
        path = require ( 'path' ),
        required = uncached ( require );

// load file extensions
// ( hard uncache the extensions module regardless of dev status )
required ( './require-extensions.js' );

// if we are in dev mode use uncached(), otherwise require()
// ( also hard uncache the config file )
module.exports = required ( '../../config/config.hjson' ).dev ? uncached :
    function ( require ) {
        let wrapper = name => require ( name );
        wrapper.save = () => undefined;
        wrapper.external = name => ( { updated: false, module: require ( name ) } );
        wrapper.status = () => false;
        wrapper.jsAsText = name => fs.readFileSync ( require.resolve ( name ), 'utf-8');
        return wrapper;
    };
