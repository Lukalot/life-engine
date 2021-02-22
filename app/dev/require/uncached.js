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

// ** NOTE: this was dependent on hjson file extension, however keeping
// this module dependency free is more important than doing everything here
// so this wrapper as well as file extensions are loaded from require/index.js

const   fs = require ( 'fs' ),
        cachepath = require.resolve ( './_file_cache.json' ),
        cache = fs.existsSync ( cachepath ) ? JSON.parse ( fs.readFileSync ( cachepath, 'utf8' ) ) : {};

let update = false;

function save () {
    if ( update ) {
        fs.writeFileSync ( cachepath, JSON.stringify ( cache ) );
    }
};

function status ( require, name ) {
    const   path = require.resolve ( name ).replace ( /\\/g, '/'),
            timestamp = fs.statSync ( path ).mtimeMs;
    return cache [ path ] === timestamp;
}

function jsAsText ( require, name ) {
    let ext = require.extensions,
        js = ext [ '.js' ],
        mod;

    ext [ '.js' ] = function ( module, filename ) {
        module.exports = fs.readFileSync ( filename, 'utf8' );
    };

    mod = external ( require, name ).module;

    // remove from the cache so we don't get string when a module is required
    delete require.cache [ require.resolve ( name ) ];

    ext [ '.js' ] = js;

    return mod;
}

function external ( require, name ) {
    console.log ( name );
    const   path = require.resolve ( name ).replace ( /\\/g, '/'),
            timestamp = fs.statSync ( path ).mtimeMs;
    let updated = false;
    if ( cache [ path ] !== timestamp ) {
        cache [ path.replace ( /\\/g, '/') ] = timestamp;
        delete require.cache [ path ];
        update = updated = true;
    }

    return { updated, module: require ( name ) };
}

function uncached ( require ) {
    function uncached ( name ) {
        return external ( require, name ).module;
    };

    uncached.save = save;
    // for externally require()'d modules, can return updated module or do nothing
    uncached.external = external.bind ( null, require );
    uncached.status = status.bind ( null, require );
    uncached.jsAsText = jsAsText.bind ( null, require );

    return uncached;
}

// "un"cache this file
uncached ( require ) ( './uncached.js' );

module.exports = uncached;
