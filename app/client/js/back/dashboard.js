define(function(require) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var Controller = require('back/dashboard.controller');

    console.log('-- Creating application instance');

    var app = new Marionette.Application();

    app.on('start', function() {
        console.log('-- Dashboard started!');
    });

    console.log('-- Creating application instance - done');

    app.addInitializer(function() {
        var controller = new Controller(this);
        controller.start();
        Backbone.history.start();
    });

    return app;
});
