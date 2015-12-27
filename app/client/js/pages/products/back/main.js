define(function(require) {
    'use strict';

    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var ApplicationLayout = require('pages/products/back/layout');
    var ApplicationMenu = require('pages/products/back/menu/menu');
    var ProductListView = require('pages/products/back/products/product-list-view');

    var app_channel = Backbone.Wreqr.radio.channel('app');

    var ApplicationRouter = Marionette.AppRouter.extend({
        appRoutes: {
            '': 'products',
            'create': 'createProduct',
            ':id': 'editProduct',
            'resellers': 'resellers'
        }
    });

    var Application = Marionette.Application.extend({
        initialize: function() {
            this.layout = new ApplicationLayout({
                el: 'body'
            });
            this.productList = new ProductListView();
        },
        onStart: function() {
            this.layout.showChildView('menu', new ApplicationMenu());
            this.router = new ApplicationRouter({
                controller: this
            });
            Backbone.history.start();
        },
        createProduct: function() {
            console.log('create product');
        },
        editProduct: function(args) {
            console.log(args);
        },
        products: function(args) {
            app_channel.commands.execute('route', 'products', args);
            this.layout.showChildView('products', this.productList);
        },
        resellers: function(args) {
            app_channel.commands.execute('route', 'resellers', args);
        }
    });

    var app = new Application();
    app.start();
});
