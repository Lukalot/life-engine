require = require ( './require' ) ( require );

module.exports = [
    {
        source: './build/js/ColorPicker.js',
        target: '../ui/js/ColorPicker.js',
        callback: source => source.replace ( /\$\$[^$]+\$\$/, require ( './build/html/color-picker.html' ).replace ( /\s*\n\s*/g, '' ) )
    }, {
        source: './build/js/DualSlider.js',
        target: '../ui/js/DualSlider.js',
        callback: source => source.replace ( /\$\$[^$]+\$\$/, require ( './build/html/dual-slider.html' ).replace ( /\s*\n\s*/g, '' ) )
    }, {
        source: './build/js/app-color-picker.js',
        target: '../ui/js/app-color-picker.js',
        callback: source => source.replace ( /\$\$[^$]+\$\$/, require ( '../config/config.hjson' ).apiName )
    }
]
