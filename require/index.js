require ( './require-extensions.js' );
delete require.cache [ require.resolve ( './uncached.js' ) ];
module.exports = require ( './uncached.js' );
