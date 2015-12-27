define(function(require) {
    'use strict';

    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var Product = require('pages/products/models/product');
    var Promise = require('promise');
    var ApplicationLayout = require('pages/products/back/layout');
    var ApplicationMenu = require('pages/products/back/menu/menu');
    var ProductListView = require('pages/products/back/products/product-list-view');
    var ProductEditView = require('pages/products/back/products/product-edit-view');

    var app_channel = Backbone.Wreqr.radio.channel('app');

    var ApplicationRouter = Marionette.AppRouter.extend({
        appRoutes: {
            '': 'products',
            'create': 'createProduct',
            ':id': 'editProduct',
            'resellers': 'resellers'
        }
    });

    var products = new (Backbone.Collection.extend({
        model: Product,
        url: '/api/products'
    }));

    var Application = Marionette.Application.extend({
        initialize: function() {
            this.layout = new ApplicationLayout({
                el: 'body'
            });
        },
        onStart: function(config) {
            this.config = config;
            this.layout.showChildView('menu', new ApplicationMenu());
            this.router = new ApplicationRouter({
                controller: this
            });
            Backbone.history.start();
        },
        createProduct: function() {
            console.log('create product');
        },
        editProduct: function(id) {
            app_channel.commands.execute('route', 'editProducts', id);
            this.layout.showChildView('app', new ProductEditView({
                model: this.config.products.get(id)
            }));
        },
        products: function(args) {
            app_channel.commands.execute('route', 'products', args);
            this.layout.showChildView('app', new ProductListView({
                collection: this.config.products
            }));
        },
        resellers: function(args) {
            app_channel.commands.execute('route', 'resellers', args);
        }
    });

    var app = new Application();

    (new Promise(function(resolve, reject) {
        products.fetch({
            reset: true,
            success: resolve,
            error: function(collection, res) {
                reject(res);
            }
        });
    }))
    .then(function(collection) {
        app.start({
            products: collection
        });
    })
    .catch(function(err) {
        console.error(err);
    });

    // app.start();
});
