define(function(require) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var layoutTemplate = require('text!back/dashboard.layout.template.html');

    return Marionette.LayoutView.extend({
        template: _.template(layoutTemplate),
        regions: {
            menu:  '#dashboard-menu',
            panel: '#dashboard-panel'
        }
    });
});
