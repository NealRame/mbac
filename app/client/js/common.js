requirejs.config({
    baseUrl: '/js',
    paths: {
        'backbone': 'libs/backbone',
        'fastclick': 'libs/fastclick',
        'foundation': 'libs/foundation',
        'jquery': 'libs/jquery',
        'modernizr': 'libs/modernizr',
        'underscore': 'libs/underscore'
    },
    shim: {
        'fastclick':  {exports: 'FastClick'},
        'modernizr':  {exports: 'Modernizr'},
        'foundation': {
            deps: ['fastclick', 'jquery', 'modernizr'],
            exports: 'Foundation'
        },
    }
});
