requirejs.config({
    baseUrl: '/js',
    paths: {
        'backbone': 'libs/backbone',
        'fastclick': 'libs/fastclick',
        'foundation': 'libs/foundation',
        'jquery': 'libs/jquery',
        'marionette': 'libs/backbone.marionette',
        'modernizr': 'libs/modernizr',
        'text': 'libs/text',
        'underscore': 'libs/underscore',

        'Dialog': 'common/Dialog/dialog',

        'Configuration': 'back/Configuration/configuration',
        'Dashboard': 'back/dashboard',
        'Gallery': 'back/Gallery/gallery',
        'TabbedPanels': 'back/TabbedPanels/tabbedpanels',
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
