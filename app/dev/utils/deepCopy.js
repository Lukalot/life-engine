module.exports = function ( source ) {
    let refs = new WeakMap (),
        deepCopy = ( source ) => {

            if ( Array.isArray ( source ) ) {
                if ( refs.has ( source ) ) {
                    return refs.get ( source );
                }

                let copy = source.slice ();
                refs.set ( source, copy );
                for ( let [ key, value ] of Object.entries ( source ) ) {
                    copy [ key ] = deepCopy ( value );
                }

                return copy;
            } else if ( 'object' === typeof source && null !== source ) {
                if ( refs.has ( source ) ) {
                    return refs.get ( source );
                }

                let copy = {};
                refs.set ( source, copy );
                for ( let [ key, value ] of Object.entries ( source ) ) {
                    copy [ key ] = deepCopy ( value );
                }

                return copy;
            }

            return source;
        };

    return deepCopy ( source );
}
