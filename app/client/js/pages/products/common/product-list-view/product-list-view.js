/// Product collection view.
/// ========================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Sun Jan 17 12:11:10 CET 2016
define(function(require) {
	'use strict';

    var ThumbnailList = require('ThumbnailList');
	var Product = require('pages/products/common/models/product');
    var product_render = require('pages/products/common/product-list-view/product-thumbnail-render');

    return ThumbnailList.extend({
		createItemTarget: '#create',
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
});
