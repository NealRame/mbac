// Achievements application layout.
// ===============================
// - author: Neal.Rame. <contact@nealrame.com>
// -   date: Tue Jan  5 20:46:12 CET 2016
define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');

    return Marionette.LayoutView.extend({
        regions: {
            menu: '#achievements-menu .menu-content-wrapper',
            app: '#admin-content-wrapper'
        },
        serializeData: _.constant({}),
        template: false
    });
});
