define(function(require) {
    'use strict';

    var Backbone = require('backbone');
    var Marionette = require('marionette');
    var Product = require('pages/products/models/product');
    var ApplicationLayout = require('pages/products/back/layout');
    var ApplicationMenu = require('pages/products/back/menu/menu');
    var ProductListView = require('pages/products/back/product-list-view/product-list-view');
    var ProductEditView = require('pages/products/back/product-edit-view/product-edit-view');
    var async = require('common/async');

    var app_channel = Backbone.Wreqr.radio.channel('app');

    var ApplicationRouter = Marionette.AppRouter.extend({
        appRoutes: {
            '': 'products',
            'create': 'createProduct',
            'resellers': 'resellers',
            ':id': 'editProduct'
        }
    });

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
            app_channel.commands.execute('route', 'editProduct');
            this.layout.showChildView('app', new ProductEditView({
                collection: this.config.products,
                model: new Product({}),
                router: this.router
            }));
        },
        editProduct: function(id) {
            app_channel.commands.execute('route', 'editProduct', id);
            this.layout.showChildView('app', new ProductEditView({
                collection: this.config.products,
                model: this.config.products.get(id),
                router: this.router
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

    var ProductCollectionProto = {
        model: Product,
        url: '/api/products'
    };

    async.fetchCollection(ProductCollectionProto, {reset: true})
        .then(function(collection) {
            var app = new Application();
            app.start({
                products: collection
            });
        })
        .catch(function(err) {
            alert(err.message);
        });
});
