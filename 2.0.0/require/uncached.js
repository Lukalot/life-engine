/** uncached(path) stores file change timestamps, and when files are requested,
  * their current timestamp is compared to the stored stamp.  If the two don't
  * match, the require() cache is busted before the file is require()d, which
  * forces the newer file to load.
  *
  * Usage: load uncached, uncache all modules, save module timestamps
  *
  * const uncached = require ( "./uncached.js" );
  * const module1 = uncached ( "./module1.js" );
  * const module2 = uncached ( "./module2.js" );
  * const etc = uncached ( "./etc.js" );
  * uncached.save ();
  */

// File change timestamps are stored and when files are requested their current
// timestamp is compared to the stored timestamp.  If the two don't match, the
// require cache for that module is busted before the file is require()d.

//

const   fs = require ( 'fs' ),
        config = require ( "../js/config.hjson" ),
        cachepath = require.resolve ( './_file_cache.json' ),
        cache = JSON.parse ( fs.readFileSync ( cachepath, 'utf8' ) ),
        require = ( window || global ).require;

let update = false;

function uncached ( name ) {
    const   path = require.resolve ( name ).replace ( /\\/g, '/'),
            timestamp = fs.statSync ( path ).mtimeMs;
    if ( cache [ path ] !== timestamp ) {
        cache [ path ] = timestamp
        delete require.cache [ path ];
        update = true;
    }
    return require ( name );
}

uncached.save = function save () {
    if ( update ) {
        fs.writeFileSync ( cachepath, JSON.stringify ( cache ) );
    }
};

// just in case some other module uses require.save, otherwise noop
require.save = require.save || function () {};

( window || global ).require = config.dev ? uncached : require;
