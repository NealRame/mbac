/// Product collection view.
/// ========================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Fri Dec 25 23:28:36 CET 2015
define(function(require) {
	'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
    var ThumbnailList = require('ThumbnailList');
	var Product = require('pages/products/models/product');
    var product_render = require('pages/products/back/product-list-view/product-thumbnail-render');
    var template = require('text!pages/products/back/product-list-view/product-list-view.html');

    var ProductList = ThumbnailList.extend({
		createItemTarget: '#create',
        editable: true,
        thumbnailsRenderers: [product_render],
        initialize: function(options) {
            ThumbnailList.prototype.initialize.call(this, options);
        },
		viewComparator: function(model1, model2) {
			if ((model1 instanceof Product) && (model2 instanceof Product)) {
				var d1 = model1.date(), d2 = model2.date();
				if (d1 < d2) return  1;
				if (d1 > d2) return -1;
				return 0;
			}
			return model1 instanceof Product ? -1 : 1;
		}
    });

    return Marionette.LayoutView.extend({
        initialize: function() {
            this.listView = new ProductList({
                collection: this.collection
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
