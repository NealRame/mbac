define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');

    return Marionette.LayoutView.extend({
        regions: {
            menu: '#products-menu .menu-content-wrapper',
            products: '#products-wrapper',
            resellers: '#resellers-wrapper'
        },
        serializeData: _.constant({}),
        template: false
    });
});
