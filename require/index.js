const uncached = require ( './uncached.js' );

// load file extensions
// ( hard uncache the extensions module regardless of dev status )
uncached ( './require-extensions.js' );

// if we are in dev mode use uncached(), otherwise require()
// ( also hard uncache the config file )
module.exports = uncached ( '../js/config.hjson' ).dev ? uncached : require;
