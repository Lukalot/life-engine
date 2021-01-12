const fs = require ( 'fs' );
let cache = {}, cachepath = require.resolve ( './_file_cache.json' ), update = false;

function uncached ( name ) {
    const   path = require.resolve ( name ),
            timestamp = fs.statSync ( path ).mtime;
    if ( cache [ path ] !== timestamp ) {
        cache [ path ] = timestamp
        delete require.cache [ path ];
        update = true;
    }
    return require ( name );
}

uncached.save = function () {
    if ( update ) {
        fs.writeFileSync ( cachepath, JSON.stringify ( cache ) );
    }
};

cache = JSON.parse ( fs.readFileSync ( cachepath, 'utf8' ) );

module.exports = uncached;
