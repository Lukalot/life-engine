const uncached = require ( '../utils/uncached.js' );
const fs = require ('fs'), path = './js/interactions/';
const interactions = {};

fs.readdirSync ( path ).forEach ( file => {
    if ( /\.hjson$/.test ( file ) ) {
        let name = file.split ( '/' ).slice ( -1 ) [ 0 ].split ( '.' ) [ 0 ];
        interactions [ name ] = uncached ( '../interactions/' + name + '.hjson' );
    }
} );

module.exports = interactions;
