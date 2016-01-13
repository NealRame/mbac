/// Product collection view.
/// ========================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Fri Dec 25 23:28:36 CET 2015
define(function(require) {
	'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
    var ThumbnailList = require('ThumbnailList');
    var product_render = require('pages/products/back/product-list-view/product-thumbnail-render');
    var template = require('text!pages/products/back/product-list-view/product-list-view.html');

    var ProductList = ThumbnailList.extend({
		createItemTarget: '#create',
        editable: false,
        thumbnailsRenderers: [product_render],
        initialize: function(options) {
            ThumbnailList.prototype.initialize.call(this, options);
        }
    });

    return Marionette.LayoutView.extend({
        initialize: function() {
            this.listView = new ProductList({
                collection: this.collection,
                editable: true
            });
        },
        template: _.template(template),
        regions: {
            list: '#product-list'
        },
        onRender: function() {
            this.showChildView('list', this.listView);
        }
    });
});