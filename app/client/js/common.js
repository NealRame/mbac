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

        'Configuration': 'back/Configuration/configuration',
        'Dashboard': 'back/dashboard',
        'TabbedPanels': 'back/TabbedPanels/tabbedpanels',
        'Gallery': 'back/Gallery/gallery',
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
