define(function(require) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var ApplicationLayout = require('pages/products/back/layout');
    var ApplicationMenu = require('pages/products/back/menu/menu');

    var app_channel = Backbone.Wreqr.radio.channel('app');

    var Application = Marionette.Application.extend({
        initialize: function() {
            this.layout = new ApplicationLayout({
                el: 'body'
            });
        },
        onStart: function() {
            console.log('app started');
            this.layout.showChildView('menu', new ApplicationMenu());
            var matched = Backbone.history.start({
                pushState: true,
                root: '/admin/products'
            });
        },
        products: function(args) {
            console.log('app:route:/products', args);
            app_channel.commands.execute('route', 'products', args);
        },
        resellers: function(args) {
            console.log('app:route:/resellers', name, args);
            app_channel.commands.execute('route', 'resellers', args);
        }
    });

    var app = new Application();

    app.router = new Marionette.AppRouter({
        controller: app,
        appRoutes: {
            '': 'products',
            'products': 'products',
            'resellers': 'resellers'
        }
    });
    app.start();
});
