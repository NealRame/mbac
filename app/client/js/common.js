requirejs.config({
    baseUrl: '/js',
    paths: {
        'backbone': 'libs/backbone',
        'fastclick': 'libs/fastclick',
        'foundation': 'libs/foundation',
        'jquery': 'libs/jquery',
        'marionette': 'libs/backbone.marionette',
        'modernizr': 'libs/modernizr',
        'promise': 'libs/bluebird',
        'text': 'libs/text',
        'underscore': 'libs/underscore',

        'Achievement': 'common/Achievement/achievement',
        'AchievementLightBox': 'common/AchievementLightBox/achievement-lightbox',
        'Dialog': 'common/Dialog/dialog',
        'Picture': 'common/Picture/picture',
        'Thumbnail': 'common/Thumbnail/thumbnail',

        'AchievementEditorDialog': 'back/AchievementEditorDialog/editor',
        'Configuration': 'back/Configuration/configuration',
        'Dashboard': 'back/dashboard',
        'Gallery': 'back/Gallery/gallery',
        'TabbedPanels': 'back/TabbedPanels/tabbedpanels',

        'Test': 'back/Test/test',
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
