// require() extensions

const   hjson = require ( 'hjson' ),
        fs = require ( 'fs' ),
        ext = require.extensions;

ext [ '.hjson' ] = function ( module, filename ) {
    module.exports = hjson.parse ( fs.readFileSync ( filename, 'utf8' ) );
};

ext [ '.html' ] = ext [ '.txt' ] = function ( module, filename ) {
    module.exports = fs.readFileSync ( filename, 'utf8' );
};
