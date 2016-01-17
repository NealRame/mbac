define(function(require) {
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Marionette = require('marionette');
	var PictureList = require('PictureList');
    var ProductBase = require('pages/products/common/models/product');

    var async = require('common/async');
    var marked = require('marked');
    var ui = require('common/ui');

    var Product = ProductBase.extend({
        urlRoot: '/api/products/'
    });

    function current_product_id() {
        return _.last(window.location.pathname.split('/'));
    }

    var Layout = Marionette.LayoutView.extend({
        regions: {
            'pictures-list': '#pictures-wrapper'
        },
        childEvents: {
            'thumbnail-list:ready': function() {
                ui.pushDown($('body > footer').first(), window, 0);
            }
        },
        ui: {
            description: '#description-wrapper'
        },
        template: false,
        onRender: function() {
            var region = this.getRegion('pictures-list');
            region.$el.empty().show();
            region.show(new PictureList({
				collection: new Backbone.Collection(this.model.pictures()),
				editable: false
			}));
            this.ui.description
                .empty()
                .html(marked(this.model.description(), {headerPrefix: '__'}))
                .show();
        }
    });

    async.fetchModel(new Product({
        _id: current_product_id()
    })).then(function(product) {
        var layout = new Layout({
            el: $('body'),
            model: product
        });
        layout.render();
    }).catch(function(err) {
        console.error(err);
    });
});
