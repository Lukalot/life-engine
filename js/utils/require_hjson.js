const hjson = require ( 'hjson' );
const fs = require ( 'fs' );

require.extensions['.hjson'] = function (module, filename) {
    module.exports = hjson.parse(fs.readFileSync(filename, 'utf8'));
};
