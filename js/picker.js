// const   canvas = document.getElementById ( 'canvas' ),
//         ctx = canvas.getContext ( '2d' );
//
// let id = ctx.getImageData ( 0, 0, canvas.width, canvas.height ),
//     data = id.data;
//
// for ( let i = 0; i < data.length; i = i + 4 ) {
//     let v = 255 - ( i >> 10 ), a = 255 - ( ( i & 1023 ) >> 2 ) * v / 255;
//     data [ i + 0 ] = v;
//     data [ i + 1 ] = v;
//     data [ i + 2 ] = v;
//     data [ i + 3 ] = a;
// }
//
// ctx.putImageData ( id, 0, 0 );
