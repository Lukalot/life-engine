module.exports = function deepCopy ( obj ) {
    var i, res = "object" !== typeof obj ? obj : Array.prototype.isPrototypeOf ( obj ) ? [] : {};
    for ( i in obj ) {
        res [ i ] = deepCopy ( obj [ i ] );
    }
    return res;
}
