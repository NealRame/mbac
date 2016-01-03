/// Product collection view.
/// ========================
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Fri Dec 25 23:28:36 CET 2015
define(function(require) {
	'use strict';

    var _ = require('underscore');
    var Marionette = require('marionette');
    var ThumbnailList = require('ThumbnailList');
    var product_render = require('pages/products/back/products/product-thumbnail-render');
    var template = require('text!pages/products/back/products/product-list-view.html');

    var ProductList = ThumbnailList.extend({
        editable: false,
        thumbnailOptions: function() {
            return {
				clickBehavior: 'default',
				createItemTarget: '#create',
				editable: Marionette.getOption(this, 'editable'),
                removable: Marionette.getOption(this, 'editable'),
                renderers: [product_render]
            };
        },
        initialize: function() {
            _.bindAll(this, 'thumbnailOptions');
            ThumbnailList.prototype.initialize.call(this);
        }
    });

    return Marionette.LayoutView.extend({
        initialize: function() {
            this.listView = new ProductList({
                collection: this.collection,
                editable: true,
                clickBehavior: 'default'
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
