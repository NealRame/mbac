requirejs.config({
    baseUrl: '/js',
    paths: {
        'async': 'libs/async',
        'backbone': 'libs/backbone',
        'fastclick': 'libs/fastclick',
        'foundation': 'libs/foundation',
        'foundation-datepicker': 'libs/foundation-datepicker',
        'foundation-datepicker-fr': 'libs/foundation-datepicker.fr',
        'jquery': 'libs/jquery',
        'marked': 'libs/marked',
        'marionette': 'libs/backbone.marionette',
        'modernizr': 'libs/modernizr',
        'promise': 'libs/bluebird',
        'text': 'libs/text',
        'underscore': 'libs/underscore',

        'Configuration': 'common/Configuration/configuration',
        'Dialog': 'common/Dialog/dialog',
        'LightBox': 'common/LightBox/lightbox',
        'Picture': 'common/Picture/picture',
        'TabbedPanels': 'common/TabbedPanels/tabbedpanels',
        'Thumbnail': 'common/Thumbnail/thumbnail',
        'ThumbnailList': 'common/ThumbnailList/thumbnail-list'
    },
    shim: {
        'fastclick':  {exports: 'FastClick'},
        'modernizr':  {exports: 'Modernizr'},
        'foundation': {
            deps: ['fastclick', 'jquery', 'modernizr'],
            exports: 'Foundation'
        },
        'foundation-datepicker-fr': {
            deps: ['foundation', 'foundation-datepicker']
        }
    }
});
