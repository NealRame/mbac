define(function(require) {
    'use strict';

    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var ApplicationLayout = require('pages/products/back/layout');
    var ApplicationMenu = require('pages/products/back/menu/menu');

    var app_channel = Backbone.Wreqr.radio.channel('app');

    var ApplicationRouter = Marionette.AppRouter.extend({
        appRoutes: {
            '': 'products',
            'products': 'products',
            'resellers': 'resellers'
        }
    });

    var Application = Marionette.Application.extend({
        initialize: function() {
            this.layout = new ApplicationLayout({
                el: 'body'
            });
        },
        onStart: function() {
            this.layout.showChildView('menu', new ApplicationMenu());
            this.router = new ApplicationRouter({
                controller: this
            });
            Backbone.history.start();
        },
        products: function(args) {
            app_channel.commands.execute('route', 'products', args);
        },
        resellers: function(args) {
            app_channel.commands.execute('route', 'resellers', args);
        }
    });

    var app = new Application();
    app.start();
});
