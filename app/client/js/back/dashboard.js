define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var Controller = require('back/dashboard.controller');
    var Foundation = require('foundation');
    var stickyFooter = require('utils/sticky-footer');

    console.log('-- Creating application instance');

    var app = new Marionette.Application();

    app.on('start', function() {
        $(document).foundation();
        $(window)
            .bind('load', stickyFooter.bind(null, 0))
            .bind('resize', Foundation.utils.throttle(stickyFooter.bind(null, 0), 150));
        stickyFooter(0);
        console.log('-- Dashboard started');
    });

    console.log('-- Creating application instance - done');

    app.addInitializer(function() {
        var controller = new Controller(this);
        controller.start();
        Backbone.history.start();
    });

    return app;
});
