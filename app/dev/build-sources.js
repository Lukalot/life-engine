const   fs = require ( 'fs' ),
        path = require ( 'path' );

require = require ( './require' ) ( require );

const tasks = require ( './build-tasks.js' );

for ( let task of tasks ) {
    let source = require.jsAsText ( task.source ),
        target = path.join ( __dirname, task.target );

    if ( !fs.existsSync ( target ) || !require.status ( task.source ) ) {
        fs.writeFileSync ( target, task.callback ( source ), 'utf-8' );

        // may not compile, so just read as text, so status is cached
        require.jsAsText ( target );
    }
}
