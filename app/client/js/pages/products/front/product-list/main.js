
define(function(require) {
    'use strict';

    var $ = require('jquery');
    var Marionette = require('marionette');
    var Product = require('pages/products/common/models/product');
    var ProductListView = require('pages/products/common/product-list-view/product-list-view');
    var async = require('common/async');
    var ui = require('common/ui');

    var Layout = Marionette.LayoutView.extend({
        regions: {
            'list': '#products-wrapper'
        },
        childEvents: {
            'thumbnail-list:ready': function() {
                ui.pushDown($('body > footer').first(), window, 0);
            }
        },
        template: false,
        onRender: function() {
            var region = this.getRegion('list');
            region.$el.empty().show();
            region.show(new ProductListView({
                collection: this.collection
            }));
        }
    });

    async.fetchCollection({
        model: Product,
        url: '/api/products'
    }, {reset: true})
        .then(function(collection) {
            var layout = new Layout({
                collection: collection,
                el: $('body')
            });
            layout.render();
        });
});
